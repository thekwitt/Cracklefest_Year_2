const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

const users = [];

// eslint-disable-next-line no-unused-vars

module.exports = {
	name: 'trade',
	description: 'Trade an egg with someone!!',
	cooldown: 300,
	data: new SlashCommandBuilder()
		.setName('trade')
		.setDescription('Trade an egg with someone!')
		.addUserOption(option => option.setName('target').setDescription('The card of that user.').setRequired(true))
		.addIntegerOption(option => option.setName('your_id').setDescription('The ID of the Your Egg (Click/Tap emoji for egg id)').setRequired(true))
		.addIntegerOption(option => option.setName('their_id').setDescription('The ID of the Their Egg (Click/Tap emoji for egg id)').setRequired(true)),
	// eslint-disable-next-line no-unused-vars
	async execute(interaction, client) {
		try{ await interaction.deferReply(); }
		catch{;}

		const u_egg = interaction.options.getInteger('your_id');
		const t_egg = interaction.options.getInteger('their_id');

		const target = interaction.options.getUser('target');

		const data = await client.pool.query('SELECT * FROM guild_settings WHERE Guild_ID = $1', [interaction.guildId]);
		const setting = data.rows[0];

		if(setting.enable_trading == false) {
			try{return await interaction.editReply('Looks like trading was disabled.').then(client.extra.log_g(client.logger, interaction.guild, 'Bag Command', 'Duplicate Reply'));}
			catch{client.extra.log_error_g(client.logger, interaction.guild, 'Bag Command', 'Reply Denied');}
		}

		if(users.includes(interaction.member.id + '' + interaction.guildId) || users.includes(target.id + '' + interaction.guildId)) {
			interaction.reset_cooldown = true;
			try{return await interaction.editReply({ content: 'You or them are already included in a trade. Please try again later.', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'No Clusters Warning Reply'));}
			catch (err) {client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied');}
		} else {
			users.push(interaction.member.id + '' + interaction.guildId);
			users.push(target.id + '' + interaction.guildId);
		}

		if (target != undefined) {
			await client.pool.query('INSERT INTO user_data (Guild_ID, Member_ID) VALUES ($1, $2) ON CONFLICT DO NOTHING;', [interaction.guildId, target.id]);
			await client.pool.query('INSERT INTO user_stats (Guild_ID, Member_ID) VALUES ($1, $2) ON CONFLICT DO NOTHING;', [interaction.guildId, target.id]);
		}

		const data_u = await client.pool.query('SELECT * FROM user_data WHERE member_id = $1 AND Guild_ID = $2;', [interaction.user.id, interaction.guildId]);
		const u = data_u.rows[0];

		const data_t = await client.pool.query('SELECT * FROM user_data WHERE member_id = $1 AND Guild_ID = $2;', [target.id, interaction.guildId]);
		const t = data_t.rows[0];

		const user_bag = u.basket_eggs;
		const target_bag = t.basket_eggs;


		if(u.basket_eggs.includes(u_egg) == false) {
			interaction.reset_cooldown = true;
			client.extra.removeElementArray(users, interaction.member.id + '' + interaction.guildId);
			client.extra.removeElementArray(users, target.id + '' + interaction.guildId);
			try{return await interaction.editReply({ content: 'Looks like you don\'t have an egg with the id of ' + u_egg + '. Check out your **/basket** to see what eggs you have!', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, 'Bag Command', 'Duplicate Reply'));}
			catch{client.extra.log_error_g(client.logger, interaction.guild, 'Bag Command', 'Reply Denied');}
		}

		if(t.basket_eggs.includes(t_egg) == false) {
			interaction.reset_cooldown = true;
			client.extra.removeElementArray(users, interaction.member.id + '' + interaction.guildId);
			client.extra.removeElementArray(users, target.id + '' + interaction.guildId);
			try{return await interaction.editReply({ content: 'Looks like they don\'t have an egg with the id of ' + t_egg + '. Check out their **/basket** to see what eggs they have!', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, 'Bag Command', 'Duplicate Reply'));}
			catch{client.extra.log_error_g(client.logger, interaction.guild, 'Bag Command', 'Reply Denied');}
		}

		const list1 = [...client.extra.eggs.regular_eggs, ...client.extra.eggs.collectible_eggs];
		const egg1 = list1.filter(candy => candy.id == u_egg)[0];

		const list2 = [...client.extra.eggs.regular_eggs, ...client.extra.eggs.collectible_eggs];
		const egg2 = list2.filter(candy => candy.id == t_egg)[0];


		if(target.id != interaction.user.id) {
			const row = [
				new MessageActionRow()
					.addComponents(
						new MessageButton()
							.setCustomId('accept')
							.setLabel('Accept Trade')
							.setStyle('PRIMARY'),
					).addComponents(
						new MessageButton()
							.setCustomId('decline')
							.setLabel('Decline Trade')
							.setStyle('DANGER'),
					)];

			let embed = new MessageEmbed()
				.setColor(client.colors[0][2])
				.setTitle('🥚  ' + interaction.user.username + ' opened a trade with ' + target.username + '  🥚')
				// eslint-disable-next-line spaced-comment
				//.setThumbnail(user.defaultAvatarURL)
				.setDescription('⠀\n' + interaction.user.username + ' has offered their [' + egg1.emoji + '] for ' + target.username + '\'s [' + egg2.emoji + ']!\n\nPress the Accept or Decline Button to this trade.\n⠀');

			try{await interaction.editReply({ embeds: [embed], components: row }).then(client.extra.log_g(client.logger, interaction.guild, 'Bag Command', 'Duplicate Reply'));}
			catch (err) {client.extra.log_error_g(client.logger, interaction.guild, 'Bag Command' + String(err), 'Reply Denied');}

			let pressed = false;

			const interactionMessage = await interaction.fetchReply();

			const filter = i => {
				if(interactionMessage != undefined) return i.message.id == interactionMessage.id;
			};

			if(filter == undefined) {
				return;
			}

			const collector = await interactionMessage.channel.createMessageComponentCollector({ filter, time: 300000 });
			collector.on('collect', async i => {
				if(i.user.id != target.id) { i.reply({ content: 'This trade isn\'t for you!.', ephemeral: true }); }
				else if (i.customId === 'accept') {
					client.extra.removeElementArray(user_bag, u_egg);
					client.extra.removeElementArray(target_bag, t_egg);
					client.extra.removeElementArray(users, interaction.member.id + '' + interaction.guildId);
					client.extra.removeElementArray(users, target.id + '' + interaction.guildId);
					user_bag.push(t_egg);
					target_bag.push(u_egg);

					await client.pool.query('UPDATE user_data SET basket_eggs = $1 WHERE Guild_ID = $3 AND Member_ID = $2;', [user_bag, interaction.user.id, interaction.guildId]);
					await client.pool.query('UPDATE user_data SET basket_eggs = $1 WHERE Guild_ID = $3 AND Member_ID = $2;', [target_bag, target.id, interaction.guildId]);
					pressed = true;
					embed = new MessageEmbed()
						.setColor(client.colors[0][1])
						.setTitle('🥚  Trade accepted!  🥚')
						// eslint-disable-next-line spaced-comment
						//.setThumbnail(user.defaultAvatarURL)
						.setDescription('⠀\n' + target.username + ' now has a [' + egg1.emoji + '] and ' + interaction.user.username + ' now has a [' + egg2.emoji + ']!\n⠀')
						.setFooter('Check it out with /basket');

					try{await i.update({ embeds: [embed], components: [] }).then(client.extra.log_g(client.logger, interaction.guild, 'Bag Command', 'Duplicate Reply'));}
					catch{client.extra.log_error_g(client.logger, interaction.guild, 'Bag Command', 'Reply Denied');}
				} else if(i.customId === 'decline') {
					client.extra.removeElementArray(users, interaction.member.id + '' + interaction.guildId);
					client.extra.removeElementArray(users, target.id + '' + interaction.guildId);

					pressed = true;
					embed = new MessageEmbed()
						.setColor(client.colors[0][0])
						.setTitle('🥚  Trade declined!  🥚')
						// eslint-disable-next-line spaced-comment
						//.setThumbnail(user.defaultAvatarURL)
						.setDescription('⠀\nLooks like they didn\'t like that trade!\n⠀')
						.setFooter('Try again in five minutes!');

					try{await i.update({ embeds: [embed], components: [] }).then(client.extra.log_g(client.logger, interaction.guild, 'Bag Command', 'Duplicate Reply'));}
					catch{client.extra.log_error_g(client.logger, interaction.guild, 'Bag Command', 'Reply Denied');}
				}
			});

			collector.on('end', async i => {
				client.extra.removeElementArray(users, interaction.member.id + '' + interaction.guildId);
				client.extra.removeElementArray(users, target.id + '' + interaction.guildId);

				if(pressed == false) {
					embed = new MessageEmbed()
						.setColor(client.colors[0][0])
						.setTitle('🥚  Trade expired!  🥚')
						// eslint-disable-next-line spaced-comment
						//.setThumbnail(user.defaultAvatarURL)
						.setDescription('⠀\nLooks like they didn\'t like that trade!\n⠀')
						.setFooter('Try again in five minutes!');

					try{await interaction.editReply({ embeds: [embed], components: [row] }).then(client.extra.log_g(client.logger, interaction.guild, 'Bag Command', 'Duplicate Reply'));}
					catch{client.extra.log_error_g(client.logger, interaction.guild, 'Bag Command', 'Reply Denied');}
				}
			});
		} else {
			const embed = new MessageEmbed()
				.setColor(client.colors[0][2])
				.setTitle('🥚  ' + interaction.user.username + ' did something dumb!  🥚')
				// eslint-disable-next-line spaced-comment
				//.setThumbnail(user.defaultAvatarURL)
				.setDescription('⠀\nThey tried to give their egg to their imaginary friend but it turned out the imaginary friend was a thief and ran off with the egg.\n⠀')
				.setFooter('They lose the egg!');

			try{await interaction.editReply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, 'Bag Command', 'Duplicate Reply'));}
			catch{client.extra.log_error_g(client.logger, interaction.guild, 'Bag Command', 'Reply Denied');}
		}
	},
};
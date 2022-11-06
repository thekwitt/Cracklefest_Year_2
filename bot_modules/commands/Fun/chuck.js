const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'chuck',
	cdid: 1,
	description: 'Chuck an egg at someone!',
	data: new SlashCommandBuilder()
		.setName('chuck')
		.setDescription('Chuck an egg at someone!')
		.addUserOption(option => option.setName('target').setDescription('The card of that user.').setRequired(true)),
	async execute(interaction, client) {

		const target = interaction.options.getUser('target');

		if (target != undefined) {
			await client.pool.query('INSERT INTO user_data (Guild_ID, Member_ID) VALUES ($1, $2) ON CONFLICT DO NOTHING;', [interaction.guildId, target.id]);
			await client.pool.query('INSERT INTO user_stats (Guild_ID, Member_ID) VALUES ($1, $2) ON CONFLICT DO NOTHING;', [interaction.guildId, target.id]);
		}

		const guildId = interaction.guildId;

		const data_u = await client.pool.query('SELECT * FROM user_data WHERE member_id = $1 AND Guild_ID = $2;', [interaction.user.id, guildId]);
		const user_bag = data_u.rows[0];

		const data_t = await client.pool.query('SELECT * FROM user_data WHERE member_id = $1 AND Guild_ID = $2;', [target.id, guildId]);
		const target_bag = data_t.rows[0];

		if(user_bag.basket_eggs.length <= 0)
		{
			interaction.reset_cooldown = true;
			try{return await interaction.reply({ content: 'You don\'t have any eggs!', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'No eggs Warning Reply'));}
			catch (err) {client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied');}
		}

		if(target.id == interaction.user.id) {
			let amount = client.extra.random(1, 6);

			if(amount > user_bag.basket_eggs.length) amount = user_bag.basket_eggs.length;

			if(amount == user_bag.basket_eggs.length) user_bag.basket_eggs = Array(0);
			else user_bag.basket_eggs = client.extra.shuffle(user_bag.basket_eggs).slice(0, user_bag.basket_eggs.length - amount);


			await client.pool.query('UPDATE user_data SET basket_eggs = $1 WHERE Guild_ID = $3 AND Member_ID = $2;', [user_bag.basket_eggs, interaction.user.id, guildId]);
			const embed = new MessageEmbed()
				.setColor(client.colors[0][2])
				.setTitle(interaction.user.username + ' chucked eggs at themselves!')
				// eslint-disable-next-line spaced-comment
				//.setThumbnail(user.defaultAvatarURL)
				.setDescription('⠀\n' + client.extra.getRandom(['They decide to eat a random egg from their basket, however they started choking on the egg and fell down on their basket!']) + '\n\n**They lost ' + amount + ' eggs from their basket**\n⠀')
				.setFooter({ text: 'Check them out with /basket!' });
			try { return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'First Step Reply')); }
			catch (err) { client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied'); }
		}

		if(target.bot == true) {
			let amount = client.extra.random(1, 6);

			if(amount > user_bag.basket_eggs.length) amount = user_bag.basket_eggs.length;

			if(amount == user_bag.basket_eggs.length) user_bag.basket_eggs = Array(0);
			else user_bag.basket_eggs = client.extra.shuffle(user_bag.basket_eggs).slice(0, user_bag.basket_eggs.length - amount);


			await client.pool.query('UPDATE user_data SET basket_eggs = $1 WHERE Guild_ID = $3 AND Member_ID = $2;', [user_bag.basket_eggs, interaction.user.id, guildId]);
			const embed = new MessageEmbed()
				.setColor(client.colors[0][2])
				.setTitle(interaction.user.username + ' chucked eggs at a bot!')
				// eslint-disable-next-line spaced-comment
				//.setThumbnail(user.defaultAvatarURL)
				.setDescription('⠀\n' + client.extra.getRandom(['They thought it would be funny if they threw eggs at a bot but unknownly to them, the bot was programmed for such actions and threw the eggs back at them! This caused them to lose some eggs!']) + '\n\n**They lost ' + amount + ' eggs from their basket**\n⠀')
				.setFooter({ text: 'Check them out with /basket!' });
			try { return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'First Step Reply')); }
			catch (err) { client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied'); }
		}


		const rand = client.extra.random(0, 101);

		if(rand < 50) {
			user_bag.basket_eggs = client.extra.shuffle(user_bag.basket_eggs).slice(0, user_bag.basket_eggs.length - 1);
			await client.pool.query('UPDATE user_data SET basket_eggs = $1 WHERE Guild_ID = $3 AND Member_ID = $2;', [user_bag.basket_eggs, interaction.user.id, guildId]);
			const embed = new MessageEmbed()
				.setColor(client.colors[0][2])
				.setTitle(interaction.user.username + ' chucked an egg at ' + target.username + '!')
				// eslint-disable-next-line spaced-comment
				//.setThumbnail(user.defaultAvatarURL)
				.setDescription('⠀\n' + client.extra.getRandom([interaction.user.username + ' felt angry at ' + target.username + ' and chucked an egg at them!', interaction.user.username + ' waged war towards ' + target.username + ' by throwing an egg at them!']) + '\n⠀')
				.setFooter({ text: '/chuck them back!' });
			try { return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'First Step Reply')); }
			catch (err) {
				client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ', 'Reply Denied - ' + String(err));
				interaction.failed = true;
			}
		} else if (rand < 60) { // Catch
			const egg = client.extra.getRandom(user_bag.basket_eggs);
			client.extra.removeElementArray(user_bag.basket_eggs, egg);
			await client.pool.query('UPDATE user_data SET basket_eggs = $1 WHERE Guild_ID = $3 AND Member_ID = $2;', [user_bag.basket_eggs, interaction.user.id, guildId]);
			await client.pool.query('UPDATE user_data SET basket_eggs = array_append(basket_eggs, $1) WHERE Guild_ID = $3 AND Member_ID = $2;', [egg, target.id, guildId]);

			const embed = new MessageEmbed()
				.setColor(client.colors[0][2])
				.setTitle(interaction.user.username + ' chucked an egg at ' + target.username + '!')
				// eslint-disable-next-line spaced-comment
				//.setThumbnail(user.defaultAvatarURL)
				.setDescription('⠀\n' + client.extra.getRandom([interaction.user.username + ' felt angry at ' + target.username + ' and chucked an egg at them but they caught it and added it to their basket!', interaction.user.username + ' waged war towards ' + target.username + ' by throwing an egg at them but they caught it and added it to their basket!']) + '\n⠀')
				.setFooter({ text: '/chuck them back!' });
			try { return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'First Step Reply')); }
			catch (err) {
				client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ', 'Reply Denied - ' + String(err));
				interaction.failed = true;
			}
		} else if (rand >= 60) {
			if(target_bag.basket_eggs.length > 0) {
				let amount = client.extra.random(Math.ceil(target_bag.basket_eggs.length * 0.01), Math.ceil(target_bag.basket_eggs.length * 0.05));

				if(amount > target_bag.basket_eggs.length) amount = target_bag.basket_eggs.length;

				if(amount == target_bag.basket_eggs.length) target_bag.basket_eggs = Array(0);
				else target_bag.basket_eggs = client.extra.shuffle(target_bag.basket_eggs).slice(0, target_bag.basket_eggs.length - amount);

				user_bag.basket_eggs = client.extra.shuffle(user_bag.basket_eggs).slice(0, user_bag.basket_eggs.length - 1);
				await client.pool.query('UPDATE user_data SET basket_eggs = $1 WHERE Guild_ID = $3 AND Member_ID = $2;', [user_bag.basket_eggs, interaction.user.id, guildId]);
				await client.pool.query('UPDATE user_data SET basket_eggs = $1 WHERE Guild_ID = $3 AND Member_ID = $2;', [target_bag.basket_eggs, target.id, guildId]);

				const embed = new MessageEmbed()
					.setColor(client.colors[0][2])
					.setTitle(interaction.user.username + ' chucked an egg at ' + target.username + '!')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription('⠀\n' + client.extra.getRandom([interaction.user.username + ' felt angry at ' + target.username + ' and chucked an egg at them!', interaction.user.username + ' waged war towards ' + target.username + ' by throwing an egg at them!']) + '\n\n**They lost ' + amount + ' eggs from their basket**\n⠀')
					.setFooter({ text: '/chuck them back!' });
				try { return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'First Step Reply')); }
				catch (err) {
					client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ', 'Reply Denied - ' + String(err));
					interaction.failed = true;
				}
			} else {
				user_bag.basket_eggs = client.extra.shuffle(user_bag.basket_eggs).slice(0, user_bag.basket_eggs.length - 1);
				await client.pool.query('UPDATE user_data SET basket_eggs = $1 WHERE Guild_ID = $3 AND Member_ID = $2;', [user_bag.basket_eggs, interaction.user.id, guildId]);
				const embed = new MessageEmbed()
					.setColor(client.colors[0][2])
					.setTitle(interaction.user.username + ' chucked an egg at ' + target.username + '!')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription('⠀\n' + client.extra.getRandom([interaction.user.username + ' felt angry at ' + target.username + ' and chucked an egg at them!', interaction.user.username + ' waged war towards ' + target.username + ' by throwing an egg at them!']) + '\n⠀')
					.setFooter({ text: '/chuck them back!' });
				try { return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'First Step Reply')); }
				catch (err) {
					client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ', 'Reply Denied - ' + String(err));
					interaction.failed = true;
				}
			}
		}
	},
};
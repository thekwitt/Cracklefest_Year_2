const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
	name: 'fillbasket',
	description: 'Fill eggs to someone\'s basket!',
	data: new SlashCommandBuilder()
		.setName('fillbasket')
		.setDescription('Fill eggs to someone\'s basket!')
		.addSubcommand(subcommand =>
			subcommand
				.setName('user')
				.setDescription('Add eggs to a user.')
				.addUserOption(option => option.setName('target').setDescription('The Person you want to add eggs to.').setRequired(true))),
	permission: 'MANAGE_CHANNELS',
	async execute(interaction, client) {
		const guildId = interaction.guildId;

		const subcommand = interaction.options.getSubcommand('subcommand');
		const target = interaction.options.getUser('target');
		const role = interaction.options.getRole('role');
		const rarity = interaction.options.getString('egg_type');

		if(subcommand == 'user') {
			if(target.bot) {
				interaction.reset_cooldown = true;
				try{return await interaction.reply({ content: target.username + ' is a bot. It doesn\'t need gifts since the greatest gift is you using the bot!', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'No gift Warning Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied');}
			}

			await client.pool.query('INSERT INTO user_data (Guild_ID, Member_ID) VALUES ($1, $2) ON CONFLICT DO NOTHING;', [guildId, target.id]);

			const data_u = await client.pool.query('SELECT * FROM user_data WHERE member_id = $1 AND Guild_ID = $2;', [target.id, guildId]);

			const user = data_u.rows[0];


			if(user.basket_eggs.length == client.extra.eggCapacity(user.basket_level)) {
				interaction.reset_cooldown = true;
				try{return await interaction.reply({ content: 'You don\'t have enough room for anymore eggs! Sell some eggs by using **/sell** to keep hunting!', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'No Clusters Warning Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied');}
			}
			const amount = client.extra.eggCapacity(user.basket_level) - user.basket_eggs.length;


			let temp = [];
			let name = '';

			name = 'Random Regular';
			const reg_types = [['Solid', 'Triangle', 'Castle', 'Unique'], ['Waves', 'ZigZag', 'Water', 'Mix 1'], ['Food', 'Melted', 'Cream'], ['Dotted', 'Swirl', 'Diamonds'], ['Cow', 'Zebra', 'Tiger', 'Reptile', 'Giraffe', 'Flowers'], ['Glass', 'Hexigons', 'Clouds', 'Stars'], ['Void', 'Spell', 'Fury']];
			const restricted = client.extra.eggLevelRestrictions.filter(l => l <= user.basket_level).length;
			let restrictedTypes = [];
			for(let i = 0; i < restricted; i++) restrictedTypes = [...restrictedTypes, ...reg_types[i]];
			const eggs = client.extra.eggs.regular_eggs.filter(e => restrictedTypes.includes(e.type));
			for(let i = 0; i < amount; i++) temp.push(client.extra.getRandom(eggs));
			temp = temp.map(a => a.id);


			await client.pool.query('UPDATE user_data SET basket_eggs = array_cat(basket_eggs, $1) WHERE Guild_ID = $3 AND Member_ID = $2;', [temp, target.id, guildId]);

			const embed = new MessageEmbed()
				.setColor(client.colors[0][2])
				.setTitle(target.username + ' got ' + amount + ' new ' + name + ' ' + (client.extra.random(0, 101) == 100 ? 'oog' : 'egg') + (amount > 1 ? 's' : '') + '!')
				// eslint-disable-next-line spaced-comment
				//.setThumbnail(user.defaultAvatarURL)
				.setDescription('⠀\n' + target.username + ' got ' + amount + ' new ' + name + ' ' + (client.extra.random(0, 101) == 100 ? 'oog' : 'egg') + (amount > 1 ? 's' : '') + '!\n\nNow that is some hardcore egging!\n⠀')
				.setFooter('Check them out with /inventory!');

			try { return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'Gave ID Reply')); }
			catch (err) { client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied'); }
		} else if (subcommand == 'role') {

			const premium = await client.extra.getPremium(interaction, client);
			if(premium == false) {
				const row = new MessageActionRow()
					.addComponents(
						new MessageButton()
							.setLabel('Patreon Link')
							.setStyle('LINK')
							.setURL('https://www.patreon.com/thekwitt'),
					);

				const e = new MessageEmbed()
					.setColor('#EA2B2B')
					.setTitle('This is a patreon only feature.')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription('⠀\nLooks like you haven\'t purchased the patreon package! For only **$2** You can use this command and many others along with other servers who have premium as well!. Check out the link for more info especially if you haven\'t purchased it yet.\n⠀')
					.setFooter('If you have already purchased it, try out /premium verify');

				try{return await interaction.reply({ embeds: [e], components: [row] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'Bot Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - ' + this.name + ' Command', 'Reply Denied');}
			}

			const members = Array.from(role.members.values());
			const ids = [];

			for(let i = 0; i < members.length; i++) {
				if(members[i].user.bot == false) {
					ids.push(members[i].user.id);
				}
			}

			if(ids.length == 0) {
				interaction.reset_cooldown = true;
				try{return await interaction.reply({ content: 'Looks like this role has no humans! Try again with another role!', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'No gift Warning Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied');}
			}

			await client.pool.query('INSERT INTO user_data (Guild_ID, Member_ID) VALUES ($1, UNNEST($2::bigint[])) ON CONFLICT DO NOTHING;', [guildId, ids]);

			let temp = [];
			let name = '';

			if(rarity.toLowerCase() == 'regular') {
				name = 'Random Regular';
				for(let i = 0; i < amount; i++) temp.push(client.extra.getRandom(client.extra.eggs.regular_eggs));
				temp = temp.map(a => a.id);
			} else if(rarity.toLowerCase() == 'rare') {
				name = 'Random Rare';
				for(let i = 0; i < amount; i++) temp.push(client.extra.getRandom(client.extra.eggs.collectible_eggs));
				temp = temp.map(a => a.id);
			}

			await client.pool.query('UPDATE user_data SET basket_eggs = array_cat(basket_eggs, $1) WHERE Guild_ID = $3 AND Member_ID = ANY($2);', [temp, ids, guildId]);

			const embed = new MessageEmbed()
				.setColor(client.colors[0][2])
				.setTitle('A mod gave some presents away!')
				// eslint-disable-next-line spaced-comment
				//.setThumbnail(user.defaultAvatarURL)
				.setDescription('⠀\nEveryone who has the ' + role.name + ' role got ' + amount + ' new ' + name + ' Gift' + (amount > 1 ? 's' : '') + '!' + '\n\nNow that is some hardcore crackling!\n⠀')
				.setFooter('Check them out with /inventory!');

			try { return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'Gave ID Reply')); }
			catch (err) { client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied'); }

		}
	},
};
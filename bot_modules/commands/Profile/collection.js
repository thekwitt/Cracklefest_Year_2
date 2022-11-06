const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

// eslint-disable-next-line no-unused-vars

module.exports = {
	name: 'collection',
	description: 'Check out your rare eggs!',
	data: new SlashCommandBuilder()
		.setName('collection')
		.setDescription('Check out your rare eggs!')
		.addUserOption(option => option.setName('target').setDescription('The bag of that user.')),
	// eslint-disable-next-line no-unused-vars
	async execute(interaction, client) {
		let user = interaction.user;
		const target = interaction.options.getUser('target');
		if (target && !target.bot)
		{
			user = target;
			await client.pool.query('INSERT INTO user_data (Guild_ID, Member_ID) VALUES ($1, $2) ON CONFLICT DO NOTHING;', [interaction.guildId, interaction.user.id]);
		}
		else if (target && target.bot) {
			try{return await interaction.reply(target.username + ' is a bot. It doesn\'t like candy.').then(client.extra.log_g(client.logger, interaction.guild, 'Bag Command', 'Duplicate Reply'));}
			catch{client.extra.log_error_g(client.logger, interaction.guild, 'Bag Command', 'Reply Denied');}
		}
		const user_id = user.id;

		const data_u = await client.pool.query('SELECT * FROM user_data WHERE member_id = $1 AND Guild_ID = $2;', [user_id, interaction.guildId]);
		const u = data_u.rows[0];
		const user_bag = u.collection_eggs;

		const data = [...new Set(user_bag)].sort();

		const eggs = [];
		for(let i = 0; i < client.extra.eggs.collectible_eggs.length; i++)
		{
			const egg = data.filter(candy => candy == client.extra.eggs.collectible_eggs[i].id)[0];
			if(egg != undefined) {
				const emoji = client.extra.eggs.collectible_eggs.filter(candy => candy.id == egg)[0];
				eggs.push(emoji);
			} else { eggs.push({ emoji: '<:emptyegg:951721836251611137>' }); }
		}

		const length = data.length;
		let string = '';
		let count = '';

		for(let i = 0; i < 30; i++) {
			if (eggs[i] == undefined) break;
			count++;
			string += eggs[i].emoji + '⠀';
			if(count == 5) {
				count = 0;
				string += '\n\n';
			}
		}

		const embed = new MessageEmbed()
			.setColor(client.colors[0][2])
			.setTitle('🥚  ' + user.username + '\'s Rare Collection 🥚')
			// eslint-disable-next-line spaced-comment
			//.setThumbnail(user.defaultAvatarURL)
			.setDescription('⠀\nCollection: `' + length + ' / 30`⠀\n\n\n' + string + '\n⠀⠀')
			.setFooter('They have ' + length + ' / 30 Collectible Eggs!');

		try{await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, 'Bag Command', 'Duplicate Reply'));}
		catch{client.extra.log_error_g(client.logger, interaction.guild, 'Bag Command', 'Reply Denied');}
	},
};
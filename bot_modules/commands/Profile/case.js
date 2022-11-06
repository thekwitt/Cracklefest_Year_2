const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

// eslint-disable-next-line no-unused-vars

module.exports = {
	name: 'case',
	description: 'Check out your critically selected eggs!',
	data: new SlashCommandBuilder()
		.setName('case')
		.setDescription('Check out your critically selected eggs!')
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
			try{return await interaction.reply(target.username + ' is a bot. It can\'t use eggs.').then(client.extra.log_g(client.logger, interaction.guild, 'Bag Command', 'Duplicate Reply'));}
			catch{client.extra.log_error_g(client.logger, interaction.guild, 'Bag Command', 'Reply Denied');}
		}

		const user_id = user.id;

		const data_u = await client.pool.query('SELECT * FROM user_data WHERE member_id = $1 AND Guild_ID = $2;', [user_id, interaction.guildId]);
		const u = data_u.rows[0];
		const user_bag = u.case_eggs;

		const data = user_bag;
		const list = [...client.extra.eggs.regular_eggs, ...client.extra.eggs.collectible_eggs];
		const eggs = [];
		for(let i = 0; i < data.length; i++)
		{
			const egg = list.filter(candy => Number(candy.id) == data[i])[0];
			if(egg != undefined) {
				eggs.push(egg);
			}
		}

		const length = data.length;
		let string = '';
		let count = '';

		const premium = await client.extra.getPremium(interaction, client);
		const max = (premium == true ? 30 : 20);

		for(let i = 0; i < max; i++) {
			count++;
			if (eggs[i] == undefined) string += '<:emptyegg:951721836251611137>⠀';
			else string += eggs[i].emoji + '⠀';
			if(count == 10) {
				count = 0;
				string += '\n\n';
			}
		}

		const embed = new MessageEmbed()
			.setColor(client.colors[0][2])
			.setTitle('🥚  ' + user.username + '\'s Case 🥚')
			// eslint-disable-next-line spaced-comment
			//.setThumbnail(user.defaultAvatarURL)
			.setDescription('⠀\nOccupied: `' + length + ' / ' + max + '`⠀\n\n\n' + string + '\n⠀⠀')
			.setFooter('They have ' + length + ' / ' + max + ' Eggs on Display!');

		try{await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, 'Bag Command', 'Duplicate Reply'));}
		catch{client.extra.log_error_g(client.logger, interaction.guild, 'Bag Command', 'Reply Denied');}
	},
};
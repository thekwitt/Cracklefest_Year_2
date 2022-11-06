const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

// eslint-disable-next-line no-unused-vars

module.exports = {
	name: 'vote',
	description: 'Vote for my bot!',
	data: new SlashCommandBuilder()
		.setName('vote')
		.setDescription('Vote for my bot!'),
	// eslint-disable-next-line no-unused-vars
	async execute(interaction, client) {

		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setLabel('Vote Link')
					.setStyle('LINK')
					.setURL('https://top.gg/bot/819714651184693259/vote'),
			);

		const embed = new MessageEmbed()
			.setColor(client.colors[0][0])
			.setTitle('💵   Vote The Bot!   💵')
			// eslint-disable-next-line spaced-comment
			//.setThumbnail(user.defaultAvatarURL)
			.setDescription('⠀\nHelp my bot reach as many cracklefesters as possible by giving it a vote! Each vote helps! You can also get access to **/dailybox** if you vote! You can vote every 12 hours!\n⠀')
			.setFooter('For any questions/concerns please visit the official TheKWitt server! https://discord.gg/BYVD4AGmYR');

		try{return await interaction.reply({ embeds: [embed], components: [row] }).then(client.extra.log_g(client.logger, interaction.guild, 'Donation Command', 'Bot Reply'));}
		catch{client.extra.log_error_g(client.logger, interaction.guild, 'Donation Command', 'Reply Denied');}
	},
};
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

// eslint-disable-next-line no-unused-vars

module.exports = {
	name: 'patreon',
	description: 'Check out bot\'s patreon for exclusive perks for your server!',
	data: new SlashCommandBuilder()
		.setName('patreon')
		.setDescription('Check out bot\'s patreon for exclusive perks for your server!'),
	// eslint-disable-next-line no-unused-vars
	async execute(interaction, client) {

		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setLabel('Patreon Link')
					.setStyle('LINK')
					.setURL('https://www.patreon.com/thekwitt'),
			)
			.addComponents(
				new MessageButton()
					.setLabel('Vote / Review Link')
					.setStyle('LINK')
					.setURL('https://top.gg/bot/771198190447230986'),
			);

		const embed = new MessageEmbed()
			.setColor(client.colors[0][0])
			.setTitle('💵   Patreon Premium Page   💵')
			// eslint-disable-next-line spaced-comment
			//.setThumbnail(user.defaultAvatarURL)
			.setDescription('⠀\nAs you may have guessed, running and maintaining bots everyone to enjoy is not cheap. With your help, it is possibly to keep this train rolling and make greater things along the way!\n\nUse the button below to visit the patreon so not only you can help support the project but also get some sweet perks to maximize the usage of this bot and future ones as well! You can also support me for free by leaving a review and/or giving a vote! Every vote and review helps a lot!\n⠀')
			.setFooter('For any questions/concerns please visit the official TheKWitt server! https://discord.gg/BYVD4AGmYR');

		try{return await interaction.reply({ embeds: [embed], components: [row] }).then(client.extra.log_g(client.logger, interaction.guild, 'Donation Command', 'Bot Reply'));}
		catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' Command', 'Reply Denied');}
	},
};
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

// eslint-disable-next-line no-unused-vars

module.exports = {
	name: 'reloaddrop',
	description: 'Is the drop stuck? Reload with this command.',
	data: new SlashCommandBuilder()
		.setName('reloaddrop')
		.setDescription('Is the drop stuck? Reload with this command.'),
	permission: 'MANAGE_CHANNELS',
	// eslint-disable-next-line no-unused-vars
	async execute(interaction, client) {
		await client.extra.reloadMessageDrop(interaction.guild, client);

		try{return await interaction.reply('The drop has been reloaded').then(client.extra.log_g(client.logger, interaction.guild, 'About Command', 'Bot Reply'));}
		catch{client.extra.log_error_g(client.logger, interaction.guild, 'About Command', 'Reply Denied');}
	},
};
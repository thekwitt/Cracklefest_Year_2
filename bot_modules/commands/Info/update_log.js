const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

// eslint-disable-next-line no-unused-vars

module.exports = {
	name: 'update_log',
	description: 'Check out the newest update notes!',
	data: new SlashCommandBuilder()
		.setName('update_log')
		.setDescription('Check out the newest update notes!'),
	// eslint-disable-next-line no-unused-vars
	async execute(interaction, client) {

		const embed = new MessageEmbed()
			.setColor(client.colors[0][0])
			.setTitle('📖   Major Update!   📖')
			// eslint-disable-next-line spaced-comment
			//.setThumbnail(user.defaultAvatarURL)
			.addField('Bug Fixes!', '- Clusters will no longer stall from delay buffer\n- Bosses will no longer crash the boss from new users chucking eggs. A safety check has been put in place from now on.\n- More grammar fixes have been implemented.\n- Spawning Clusters and Bosses will no longer reset the drop clock for your server. It can only be one at a time.\n⠀')
			.addField('New Features & Changes!', '- Lottery has been revamped! Roll a 10 sided die for rare eggs or play scratch off cards to get more coins!\n- You can now change how much of a basket is lost when chucked at! Check out **/settings advanced set_lost_chuck_percentage**\n- Bosses got a new entrance for a fresh new fight every time!\n- /bossindex will now show if a user has defeated the boss or not\n- See what eggs you discovered with **/eggdex**! (For admins and mods, check out **/admindex**)\n- 30+ New Skull Eggs will now appear for people who defeated the Crimson Wizard! See the souls that escaped the arcane void and collect them all!\n⠀')
			.setFooter('For any questions/concerns please visit the official TheKWitt server! https://discord.gg/BYVD4AGmYR');

		try{await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, ' Interaction Create Event', 'Error Reply'));}
		catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' Interaction Create Event', 'Reply Denied');}
	},
};
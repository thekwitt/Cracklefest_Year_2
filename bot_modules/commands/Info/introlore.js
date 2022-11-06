const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

// eslint-disable-next-line no-unused-vars

module.exports = {
	name: 'introlore',
	description: 'Check out bot\'s patreon for exclusive perks for your server!',
	data: new SlashCommandBuilder()
		.setName('introlore')
		.setDescription('Check out bot\'s patreon for exclusive perks for your server!'),
	// eslint-disable-next-line no-unused-vars
	async execute(interaction, client) {

		const embed = new MessageEmbed()
			.setColor(client.colors[0][0])
			.setTitle('📖   The Beginning   📖')
			// eslint-disable-next-line spaced-comment
			//.setThumbnail(user.defaultAvatarURL)
			.setDescription('⠀\nLong ago, an almighty being known as the Crimson Wizard swept the lands of Coneyford, an enchanted and thriving continent, with a terrifying storm. A storm so powerful that it caused mass destruction and chaos, terra-forming and corrupting places that the people residing came to know.\n\nThe people of the land, the Conoras, sought wisdom and guidance from the King, Jethro. But alas, there was not much more that could be done. Their fate was almost sealed as his people struggled to survive. As a last-ditch effort, Jethro sent a letter to a faraway land towards the unknown with the last of his magical power.\n\nThen, years later, heroes from the unknown came with passion and fury to help! By collecting eggs of holy power, they managed to purify the lands and help Jethro seal the Crimson Wizard away temporarily while the new heroes and the people of Coneyford prepare for the final battle once more.\n\n**You stand as one of these heroes.**\n⠀')
			.setFooter('For any questions/concerns please visit the official TheKWitt server! https://discord.gg/BYVD4AGmYR');

		try{return await interaction.reply({ embeds: [embed], ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, 'Donation Command', 'Bot Reply'));}
		catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' Command', 'Reply Denied');}
	},
};
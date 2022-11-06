const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

// eslint-disable-next-line no-unused-vars

module.exports = {
	name: 'atlasindex',
	description: 'Look at the atlas or an area\'s details!',
	data: new SlashCommandBuilder()
		.setName('atlasindex')
		.setDescription('Look at the atlas or the area\'s lore!')
		.addStringOption(option => option.setName('location').setDescription('Where do you want to hunt for more eggs?')
			.addChoice('The Cottontail Valley', '1')
			.addChoice('The Oracle Streams', '2')
			.addChoice('The Hulking Fields', '3')
			.addChoice('The Harewing Jungle', '4')
			.addChoice('The Ethereal Gardens', '5')
			.addChoice('The Crimson Grove', '6')
			.addChoice('The Arcane Void', '7')),
	async execute(interaction, client) {

		const data = await client.pool.query('SELECT * FROM guild_settings WHERE Guild_ID = $1', [interaction.guildId]);
		const setting = data.rows[0];

		const guildId = interaction.guildId;

		const indexLoc = Number(interaction.options.getString('location')) - 1;

		const data_u = await client.pool.query('SELECT * FROM user_data WHERE member_id = $1 AND Guild_ID = $2;', [interaction.user.id, guildId]);
		const user = data_u.rows[0];

		if(indexLoc == -1) {
			const embed = new MessageEmbed()
				.setColor(client.colors[0][2])
				.setTitle('🗺️   Coneyford   🗺️')
				// eslint-disable-next-line spaced-comment
				//.setThumbnail(user.defaultAvatarURL)
				.setDescription('⠀\n' + (client.extra.eggLevelRestrictions[0] <= user.basket_level ? '**The Cottontail Valley** - Level ' + client.extra.eggLevelRestrictions[0] + ' | Accessable' : '**The Cottontail Valley** - Level ' + client.extra.eggLevelRestrictions[0] + ' | Not Accessable') + '\n\n' + (client.extra.eggLevelRestrictions[1] <= user.basket_level ? '**The Oracle Streams** - Level ' + client.extra.eggLevelRestrictions[1] + ' | Accessable' : '**The Oracle Streams** - Level ' + client.extra.eggLevelRestrictions[1] + ' | Not Accessable') + '\n\n' + (client.extra.eggLevelRestrictions[2] <= user.basket_level ? '**The Hulking Fields** - Level ' + client.extra.eggLevelRestrictions[2] + ' | Accessable' : '**The Hulking Fields** - Level ' + client.extra.eggLevelRestrictions[2] + ' | Not Accessable') + '\n\n' + (client.extra.eggLevelRestrictions[3] <= user.basket_level ? '**The Harewing Jungle** - Level ' + client.extra.eggLevelRestrictions[3] + ' | Accessable' : '**The Harewing Jungle** - Level ' + client.extra.eggLevelRestrictions[3] + ' | Not Accessable') + '\n\n' + (client.extra.eggLevelRestrictions[4] <= user.basket_level ? '**The Ethereal Gardens** - Level ' + client.extra.eggLevelRestrictions[4] + ' | Accessable' : '**The Ethereal Gardens** - Level ' + client.extra.eggLevelRestrictions[4] + ' | Not Accessable') + '\n\n' + (client.extra.eggLevelRestrictions[5] <= user.basket_level ? '**The Crimson Grove** - Level ' + client.extra.eggLevelRestrictions[5] + ' | Accessable' : '**The Crimson Grove** - Level ' + client.extra.eggLevelRestrictions[5] + ' | Not Accessable') + '\n\n' + (user.arcane_key == true ? '**The Arcane Void** - Accessable' : '**The Arcane Void** - *Not Accessable | Get The Key*') + '\n⠀')
				.setImage('https://cdn.discordapp.com/attachments/782835367085998080/960335063042650132/Coneyford_2_2.jpg')
				.setFooter({ text: 'Check them out with /basket!' });

			try { return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'First Step Reply')); }
			catch (err) { client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied'); }
		} else {
			if(indexLoc == 6 && user.arcane_key == false) {
				interaction.reset_cooldown = true;
				try{return await interaction.reply({ content: 'You are trying to view something that is not real.. atleast not yet.', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'No Clusters Warning Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied');}
			}

			const titles = ['The Cottontail Valley', 'The Oracle Streams', 'The Hulking Fields', 'The Harewing Jungle', 'The Ethereal Gardens', 'The Crimson Grove', 'The Arcane Void'];
			const atlas = [client.extra.atlas.coney, client.extra.atlas.oracle, client.extra.atlas.hulking, client.extra.atlas.woodlands, client.extra.atlas.ethereal, client.extra.atlas.crimson, client.extra.atlas.void];

			if(client.extra.eggLevelRestrictions[indexLoc] > user.basket_level) {
				interaction.reset_cooldown = true;
				try{return await interaction.reply({ content: 'Looks like you don\'t have the required level to view this area. Level up to see all the details about it.', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'No Clusters Warning Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied');}
			}

			const embed = new MessageEmbed()
				.setColor(client.colors[0][2])
				.setTitle('🗺️   ' + titles[indexLoc] + '!   🗺️')
				// eslint-disable-next-line spaced-comment
				//.setThumbnail(user.defaultAvatarURL)
				.setDescription('⠀\n' + atlas[indexLoc].description + '\n⠀')
				.setFooter({ text: 'Check them out with /basket!' });

			try { return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'First Step Reply')); }
			catch (err) { client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied'); }
		}
	},
};
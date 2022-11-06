const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

// eslint-disable-next-line no-unused-vars

module.exports = {
	name: 'bossindex',
	description: 'Look at the details of a boss!',
	data: new SlashCommandBuilder()
		.setName('bossindex')
		.setDescription('Look at the details of a boss!')
		.addStringOption(option => option.setName('boss').setDescription('Where do you want to hunt for more eggs?').setRequired(true)
			.addChoice('Corrupted Giant Chicken', '1')
			.addChoice('Arcane Sentinel', '2')
			.addChoice('Crystal Guardian', '3')
			.addChoice('Rabbit Chad', '4')
			.addChoice('The Crimson Wizard', '5')),
	async execute(interaction, client) {

		const data = await client.pool.query('SELECT * FROM guild_settings WHERE Guild_ID = $1', [interaction.guildId]);
		const setting = data.rows[0];

		const data_2 = await client.pool.query('SELECT * FROM guild_stats WHERE Guild_ID = $1', [interaction.guildId]);
		const stats = data_2.rows[0];
		
		const data_u = await client.pool.query('SELECT * FROM user_stats WHERE member_id = $1 AND Guild_ID = $2;', [interaction.user.id, interaction.guildId]);
		const u = data_u.rows[0];

		const guildId = interaction.guildId;

		const indexLoc = Number(interaction.options.getString('boss')) - 1;

		const bosses = [client.extra.boss_index.chicken, client.extra.boss_index.sentinel, client.extra.boss_index.guardian, client.extra.boss_index.chad, client.extra.boss_index.crimson];

		if(stats.boss_spawned[indexLoc] == false) {
			interaction.reset_cooldown = true;
			try{return await interaction.reply({ content: 'Looks like this server has not encountered this boss yet! Fight it atleast once to get details about it!', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'No Clusters Warning Reply'));}
			catch (err) {client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied');}
		}

		const embed = new MessageEmbed()
			.setColor(client.colors[0][2])
			.setTitle('🗺️   ' + bosses[indexLoc].name + '!   🗺️')
			// eslint-disable-next-line spaced-comment
			//.setThumbnail(user.defaultAvatarURL)
			.addField('Lore', bosses[indexLoc].description + '\n⠀')
			.addField('Guide', bosses[indexLoc].cheatsheet + '\n⠀')
			.addField('Boss Status', (u.boss_spawned[indexLoc] == true ? 'Defeated' : 'Not Defeated'))
			.setImage(bosses[indexLoc].image)
			.setFooter({ text: 'Check them out with /basket!' });
			
		try { return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'First Step Reply')); }
		catch (err) { client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied'); }

	},
};
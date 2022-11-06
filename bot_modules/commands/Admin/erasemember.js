const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	name: 'erasemember',
	description: 'Erase a member from your server\'s database. (CANNOT UNDO)',
	data: new SlashCommandBuilder()
		.setName('erasemember')
		.setDescription('Erase a member from your server\'s database. (CANNOT UNDO)')
		.addUserOption(option => option.setName('target').setDescription('The Person you want to remove. (CANNOT UNDO)').setRequired(true)),
	permission: 'MANAGE_CHANNELS',
	async execute(interaction, client) {
		const target = interaction.options.getUser('target');

		if(target.bot) {
			interaction.reset_cooldown = true;
			try{return await interaction.reply({ content: target.username + ' is a bot. It doesn\'t have anything in the database.', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, 'Give Command', 'No Present Warning Reply'));}
			catch{client.extra.log_error_g(client.logger, interaction.guild, 'Give Command', 'Reply Denied');}
		}

		await client.pool.query('DELETE from user_data WHERE Guild_ID = $2 AND Member_ID = $1;', [target.id, interaction.guildId]);

		try { return await interaction.reply({ content: target.username + ' has been removed. This action cannot be undone.', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, 'Give Command', 'Gave ID Reply')); }
		catch{ client.extra.log_error_g(client.logger, interaction.guild, 'Give Command', 'Reply Denied'); }
	},
};
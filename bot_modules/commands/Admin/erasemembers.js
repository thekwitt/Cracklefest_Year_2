const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	name: 'erasemembers',
	description: 'Erase members with a certain role from your server\'s database. (CANNOT UNDO)',
	data: new SlashCommandBuilder()
		.setName('erasemembers')
		.setDescription('Erase members with a certain role from your server\'s database. (CANNOT UNDO)')
		.addRoleOption(option => option.setName('target').setDescription('The Role of People you want to remove. (CANNOT UNDO)').setRequired(true)),
	permission: 'MANAGE_CHANNELS',
	async execute(interaction, client) {
		const target = interaction.options.getRole('target');

		if(target.bot) {
			interaction.reset_cooldown = true;
			try{return await interaction.reply({ content: target.username + ' is a bot. It doesn\'t have anything in the database.', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, 'Give Command', 'No Present Warning Reply'));}
			catch{client.extra.log_error_g(client.logger, interaction.guild, 'Give Command', 'Reply Denied');}
		}

		const ids = target.members.map(t => t.id);

		if(ids.length == 0) {
			try{return await interaction.reply({ content: 'Looks like this role has no one in it! Try another one!', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, 'Give Command', 'No Present Warning Reply'));}
			catch{client.extra.log_error_g(client.logger, interaction.guild, 'Give Command', 'Reply Denied');}
		}

		await client.pool.query('DELETE from user_data WHERE Guild_ID = $2 AND Member_ID = ANY($1);', [ids, interaction.guildId]);

		try { return await interaction.reply({ content: 'Members with the role **' + target.name + '** have been removed. This action cannot be undone.', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, 'Give Command', 'Gave ID Reply')); }
		catch{ client.extra.log_error_g(client.logger, interaction.guild, 'Give Command', 'Reply Denied'); }
	},
};
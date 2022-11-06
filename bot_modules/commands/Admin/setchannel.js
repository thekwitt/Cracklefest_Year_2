// eslint-disable-next-line no-unused-vars
const { CommandInteraction, SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	name: 'setchannel',
	description: 'Set the Channel for present spawns and activate bot!',
	data: new SlashCommandBuilder()
		.setName('setchannel')
		.setDescription('Set the Channel for present spawns and activate bot!')
		.addChannelOption(option =>
			option.setName('text_channel')
				.setDescription('The text channel to set the bot with.').setRequired(true)),
	permission: 'MANAGE_CHANNELS',

	/**
	 *
	 * @param {CommandInteraction} interaction
	 */

	async execute(interaction, client) {
		const c = interaction.options.getChannel('text_channel');
		const data = await client.pool.query('SELECT * FROM guild_settings WHERE Guild_ID = $1', [interaction.guild.id]);
		const setting = data.rows[0];
		let role = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === 'cracklefest\'s champion');
		if(role == undefined) {
			try { await interaction.guild.roles.create({ name: 'Cracklefest\'s Champion', color: client.colors[1][0] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'Role Created.')); }
			catch (err) {
				client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command', 'Role Permission Denied.');
				try {
					return await interaction.reply('Looks like this bot doesn\'t havep perms to manage roles. Please give it perms to do so and try this command again.');
				} catch { return; }
			}
		}


		role = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === 'cracklefest\'s collector');
		if(role == undefined) {
			try { await interaction.guild.roles.create({ name: 'Cracklefest\'s Collector', color: client.colors[1][1] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'Role Created.')); }
			catch (err) {
				client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command', 'Role Permission Denied.');
				try {
					return await interaction.reply('Looks like this bot doesn\'t havep perms to manage roles. Please give it perms to do so and try this command again.');
				} catch { return; }
			}
		}

		if(setting.channel_set == c.id) {
			try { return await interaction.reply('You already set that channel!').then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'Already Set Reply')); }
			catch (err) { client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - Set Channel Command', 'Reply Denied'); }
		}

		if(c.type != 'GUILD_TEXT') {
			try { return await interaction.reply('That channel isn\'t a text channel!').then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'Not Text Reply')); }
			catch (err) { client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - Set Channel Command', 'Reply Denied'); }
		}

		await client.pool.query('UPDATE guild_settings SET channel_set = $1 WHERE Guild_ID = $2', [c.id, interaction.guild.id]);
		await client.extra.reloadMessageDrop(interaction.guild, client);
		try{ return await interaction.reply(c.name + ' is now the channel!').then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'Confirm Reply')); }
		catch (err) { client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - Set Channel Command', 'Reply Denied'); }
	},
};
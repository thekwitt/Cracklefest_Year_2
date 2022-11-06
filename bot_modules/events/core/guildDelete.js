module.exports = {
	name: 'guildDelete',
	async execute(guild, client) {
		client.extra.log(client.logger, guild, ' Left the Database!');
	},
};
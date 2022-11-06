module.exports = {
	name: 'guildCreate',
	async execute(guild, client) {
		client.extra.log(client.logger, guild, ' has joined us! Configuring database now!');
		client.extra.addGuildStuff(guild.id, client);
	},
};
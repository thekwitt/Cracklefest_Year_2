/* eslint-disable max-statements-per-line */
const fs = require('fs');

const { Client, Collection, Intents } = require('discord.js');
const { token, topKey,poolPW,poolUser } = require('./token.json');
const { Pool } = require('pg');
const extra = require('./extra_script');
const Topgg = require('@top-gg/sdk');
const settings = require('./bot_modules/commands/Admin/settings');
const topapi = new Topgg.Api(topKey);

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS] });

client.topapi = topapi;
client.logger = fs.createWriteStream('./logs/' + Date.now() + '.txt', { flags : 'w' });
client.commands = new Collection();
client.colors = [['#f9ceee', '#e0cdff', '#c1f0fb'], ['#dcf9a8', '#ffebaf']];
client.commands_array = [];
client.messages = new Collection();
client.cooldown_names = [];
client.ready = [false, false];
client.mailboxes = new Map();
// client.voters = [];
client.extra = extra;

const pool = new Pool({
	database: 'easter',
	user: poolUser,
	password: poolPW,
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 2000,
});

const patreon = new Pool({
	database: 'patreon',
	user: poolUser,
	password: poolPW,
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 2000,
});


const votes = new Pool({
	database: 'vote_log',
	user: poolUser,
	password: poolPW,
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 2000,
});

client.votes = votes;
client.pool = pool;
client.patreon = patreon;
// client.votes = votes;

['Commands'].forEach(handler => {
	require('./bot_modules/handlers/' + handler)(client, token);
});


// Events
fs.readdirSync('./bot_modules/events/').forEach((dir) => {
	const eventFiles = fs
		.readdirSync(`./bot_modules/events/${dir}/`)
		.filter((file) => file.endsWith('.js'));
	eventFiles.forEach(async (file) => {
		const event = require(`./bot_modules/events/${dir}/${file}`);
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args, client));
		} else {
			client.on(event.name, (...args) => event.execute(...args, client));
		}
	});
});

/*
// Commands
fs.readdirSync('./bot_modules/commands/').forEach((dir) => {
	const commandFiles = fs
		.readdirSync(`./bot_modules/commands/${dir}/`)
		.filter((file) => file.endsWith('.js'));
	commandFiles.forEach(async (file) => {
		const command = require(`./bot_modules/commands/${dir}/${file}`);
		commands.push(command.data.toJSON());
		client.commands.set(command.data.name, command);
	});
});
*/

/*
ap.on('posted', () => {
	client.extra.simple_log(client.logger, 'Top.gg stats posted!');
});
*/

async function status() {
	if(client.ready.every(v => v === true))
	{
		const data = await client.pool.query('SELECT SUM(eggs_collected) AS collected, SUM(cluster_spawns) AS clusters FROM guild_stats');
		const stats = data.rows[0];
		// eslint-disable-next-line max-statements-per-line
		const rand = client.extra.random(0, 2);
		let firstPart = client.guilds.cache.size + ' servers';
		if(client.extra.random(0, 100) % 3 == 1) firstPart = client.extra.nFormatter(client.guilds.cache.reduce((sum, g) => sum + g.memberCount, 0)).toString() + ' members ';

		if(rand == 0) try{ await client.user.setActivity(firstPart + ' collect ' + client.extra.nFormatter(stats.collected, 1) + ' eggs!', { type: 'WATCHING' });} catch {console.error;}
		else if(rand == 1) try{ await client.user.setActivity(firstPart + ' spawned ' + client.extra.nFormatter(stats.clusters, 1) + ' clusters!', { type: 'WATCHING' });} catch {console.error;}

	}
}

async function checkMessages() {
	const messages = client.messages;

	const data = await client.pool.query('SELECT * FROM guild_settings');
	const data_s = data.rows;

	for (let [key, value] of messages.entries()) {
		const timestamp = data_s.find(s => s.guild_id == key).drop_duration;
		if(Math.floor(Date.now() / 1000) - value.timestamp + 300000 > timestamp && value.activeMessage == true) {
			extra.reloadMessageDrop(client.guilds.cache.find(g => g.id == key), client);
		}
	}
}

setInterval(async function() {checkMessages();}, 60000);


setInterval(async function() {status();}, 300000);

client.login(token);
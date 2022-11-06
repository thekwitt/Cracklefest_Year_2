const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const eggs = require('./bot_modules/json/Eggs.json');
const dialogues = require('./bot_modules/json/Dialogue.json');
const atlas = require('./bot_modules/json/Atlas.json');
const boss_index = require('./bot_modules/json/Bosses.json');
const lot_cards = [fs.readFileSync('./bot_modules/lottery/bad_cards.txt').toString().split(','), fs.readFileSync('./bot_modules/lottery/good_cards.txt').toString().split(','), fs.readFileSync('./bot_modules/lottery/great_cards.txt').toString().split(','), fs.readFileSync('./bot_modules/lottery/amazing_cards.txt').toString().split(',')];
const cluster = require('./bot_modules/drops/cluster');
const bosses = [];

let quick_update = fs.readFileSync('message.txt', 'utf8');

fs.readdirSync('./bot_modules/bosses/').forEach((file) => {
	bosses.push(require('./bot_modules/bosses/' + file));
});

const finalboss = require('./bot_modules/bosses/final.js');

const summon_cluster = require('./bot_modules/summons/drops/cluster');
const summon_bosses = [];

fs.readdirSync('./bot_modules/summons/bosses/').forEach((file) => {
	summon_bosses.push(require('./bot_modules/summons/bosses/' + file));
});

const summon_finalboss = require('./bot_modules/summons/bosses/final.js');

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function deleteMessageAfterTime(client, message, time)
{
	try {
		setTimeout(async () => {

			if(message == undefined) return;

			if(message.channel == undefined) return;

			try { await message.delete(); }
			catch { return; }

		}, time);
	} catch {
		return;
	}
}

// eslint-disable-next-line no-unused-vars
// Recheck this later
async function organize_roles(client, channel, guild)
{
	const temp_role = guild.roles.cache.find(r => r.name.toLowerCase() === 'cracklefest\'s champion');

	const stas = await client.pool.query('SELECT * FROM guild_settings WHERE Guild_ID = $1', [guild.id]);
	const setting = stas.rows[0];


	let list = guild.members.cache;
	if (guild.memberCount > list.size)
	{
		try{list = await guild.members.fetch().then(client.extra.log_g(client.logger, guild, 'Role Swap', 'Member Fetch'));}
		catch (err) { client.extra.log_error_g(client.logger, guild, String(err) + ' - Role Swap', 'Fetch Denied');}
	}

	if(temp_role != undefined) {
		const raw_data = await client.pool.query('SELECT * FROM user_data WHERE Guild_ID = $1;', [guild.id]);
		let data = raw_data.rows;

		const raw_stats = await client.pool.query('SELECT * FROM user_stats WHERE Guild_ID = $1;', [guild.id]);
		const stats = raw_stats.rows;

		if(setting.rank_type == 0) data = client.extra.playOrganizer(data, 1);
		else if (setting.rank_type == 1) data = client.extra.playOrganizer(data, 8);
		else if (setting.rank_type == 2) data = client.extra.playOrganizer(stats, 3);

		// Reduce size if over 100
		if(data.length > 100)
		{
			data = data.slice(0, 100);
		}

		// Get Index of 2nd
		let temp_count = 0;

		for(let i = 1; i < data.length; i++) {
			if(data[0][1] != data[i][1]) break;
			temp_count++;
		}

		for(let i = 0; i < temp_count + 1; i++) {
			let user = undefined;
			try {
				const raw_user = data[i][0];
				const pre_user = list.get(raw_user);
				user = pre_user;
			} catch {
				// eslint-disable-next-line spaced-comment
				//pass
			}

			if(user != undefined) {
				const u_role = user.roles.cache.find(r => r.name.toLowerCase() === 'cracklefest\'s champion');
				if(u_role == undefined) {
					try {
						await user.roles.add(temp_role);
					} catch {
						const bucketEmbed = new MessageEmbed()
							.setColor('#FFCC00')
							.setTitle('Attention Server Staff!')
							.setDescription('⠀\nLooks like the **Cracklefest\'s Champion** role is higher than the bot role!\nPlease assign a bot role or the included bot role to have manage channel, messages and role perms to this bot that is higher than **Cracklefest\'s Champion**.' + '!\n⠀')
							.setFooter('If you encounter anymore problems, please join https://discord.gg/BYVD4AGmYR and tag TheKWitt!');
						// eslint-disable-next-line max-statements-per-line
						try { await channel.send({ embeds: [bucketEmbed] }); } catch (err) {client.extra.log_error_g(client.logger, channel.guild, 'Role Control', 'Warning Reply Denied');}
					}
				}
			}
		}
		for(let i = temp_count + 1; i < data.length; i++) {
			let user = undefined;
			try {
				const raw_user = data[i][0];
				const pre_user = list.get(raw_user);
				user = pre_user;
			} catch {
				// eslint-disable-next-line spaced-comment
				//pass
			}

			if(user != undefined) {
				const u_role = user.roles.cache.find(r => r.name.toLowerCase() === 'cracklefest\'s champion');
				if(u_role != undefined) {
					try {
						await user.roles.remove(temp_role);
					} catch {
						// eslint-disable-next-line spaced-comment
						//pass
					}
				}
			}
		}
	}
}

function nFormatter(num, digits) {
	const lookup = [
		{ value: 1, symbol: '' },
		{ value: 1e3, symbol: 'k' },
		{ value: 1e6, symbol: 'M' },
		{ value: 1e9, symbol: 'B' },
		{ value: 1e12, symbol: 'T' },
		{ value: 1e15, symbol: 'P' },
		{ value: 1e18, symbol: 'E' },
	];
	const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
	// eslint-disable-next-line no-shadow
	const item = lookup.slice().reverse().find(function(item) {
		return num >= item.value;
	});
	return item ? (num / item.value).toFixed(digits).replace(rx, '$1') + item.symbol : '0';
}

function zfill(number, digits) {
	if (number >= 0) {
		return number.toString().padStart(digits, '0');
	} else {
		return '-' + Math.abs(number).toString().padStart(digits, '0');
	}
}

// Redo
function playOrganizer(list, type) {
	const ranks = [];
	switch (type) {
	case 1:
		for (let x = 0; x < list.length; x++) {
			if(list[x].basket_eggs.length != 0) {
				ranks.push([list[x].member_id, list[x].basket_eggs.length]);
			}
		}
		break;
	case 2:
		for (let x = 0; x < list.length; x++) {
			if(list[x].collection_eggs.length != 0) {
				ranks.push([list[x].member_id, list[x].collection_eggs.length]);
			}
		}
		break;
	case 3:
		for (let x = 0; x < list.length; x++) {
			if(list[x].eggs_collected != 0) {
				ranks.push([list[x].member_id, list[x].eggs_collected]);
			}
		}
		break;
	case 4:
		for (let x = 0; x < list.length; x++) {
			if(list[x].to_give != 0) {
				ranks.push([list[x].member_id, list[x].areas_explored]);
			}
		}
		break;
	case 5:
		for (let x = 0; x < list.length; x++) {
			if(list[x].from_gift != 0) {
				ranks.push([list[x].member_id, list[x].eggs_sold]);
			}
		}
		break;
	case 6:
		for (let x = 0; x < list.length; x++) {
			if(list[x].collected != 0) {
				ranks.push([list[x].member_id, list[x].lottery_results[0]]);
			}
		}
		break;
	case 7:
		for (let x = 0; x < list.length; x++) {
			if(list[x].arrows_shot != 0) {
				ranks.push([list[x].member_id, list[x].lottery_results[1]]);
			}
		}
		break;
	case 8:
		for (let x = 0; x < list.length; x++) {
			if(list[x].basket_level != 0) {
				ranks.push([list[x].member_id, list[x].basket_level]);
			}
		}
		break;
	case 9:
		for (let x = 0; x < list.length; x++) {
			if(list[x].arrows_receieved != 0) {
				ranks.push([list[x].member_id, list[x].clusters_collected]);
			}
		}
		break;
	}

	ranks.sort(sortFunction);

	return ranks;
}

function sortFunction(a, b) {
	if (a[1] === b[1]) {
		return 0;
	}
	else {
		return (a[1] > b[1]) ? -1 : 1;
	}
}

function inBetween(min, max, num) {
	if(num > min && max > num) return true;
	return false;
}

function popArray(array, index) {
	if (index > -1) {
		return array.splice(index, 1);
	}
}

function removeElementArray(array, element) {
	const index = array.indexOf(element);
	if (index > -1) {
		return array.splice(index, 1);
	}
	return undefined;
}

async function getJson(json) {
	return JSON.parse(fs.readFileSync('./bot_modules/json/' + json + '.json', 'utf8'));
}

async function getPremium(interaction, client) {
	const dedicated_json = await client.extra.getJson('premium');
	const dedicated = dedicated_json.premium;

	const data = await client.patreon.query('SELECT * FROM existing');
	const exist_data = data.rows;

	const existing = exist_data.filter(obj => obj.guild_id == interaction.guildId);

	if(existing.length == 0 && dedicated.filter(obj => obj.guild_id == interaction.guildId).length == 0) {
		return false;
	} else if(existing.length != 0 || dedicated.filter(obj => obj.guild_id == interaction.guildId).length != 0) {
		return true;
	}
}

async function addGuildStuff(guild, client) {
	await client.pool.query('INSERT INTO guild_settings (Guild_ID) VALUES ($1) ON CONFLICT DO NOTHING;', [guild.id]);
	await client.pool.query('INSERT INTO guild_stats (Guild_ID) VALUES ($1) ON CONFLICT DO NOTHING;', [guild.id]);
}

async function reloadMessageDrop(guild, client) {
	try {
		const data = await client.pool.query('SELECT * FROM guild_settings WHERE Guild_ID = $1', [guild.id]);
		const setting = data.rows[0];
		const timestamp = Math.floor(Date.now() / 1000) + setting.drop_time_count;
		client.extra.log(client.logger, guild, 'Guild message drop was reset!');
		client.messages.set(guild.id, new Map([['messageCount', setting.drop_message_count], ['timestamp', timestamp], ['activeMessage', false]]));
	} catch {
		client.extra.log(client.logger, guild, 'Guild message failed to reset!');
	}
}

function shuffle(array) {
	let currentIndex = array.length, randomIndex;

	// While there remain elements to shuffle...
	while (currentIndex != 0) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;
		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [
			array[randomIndex], array[currentIndex]];
	}
	return array;
}

function simple_log(logger, message) {
	logger.write('\ufeff' + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' | ' + message + '\n');
}

function log(logger, guild, message) {
	try {
		logger.write('\ufeff' + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' | ' + guild.name + ' [' + guild.memberCount + '] (' + guild.id.toString() + ') ' + ' - ' + message + '\n');
	} catch {
		simple_log(logger, message);
	}
}

function log_error(logger, guild, message) {
	try {
		logger.write('\ufeff' + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' | 🔸 ERROR ' + guild.name + ' [' + guild.memberCount + '] (' + guild.id.toString() + ') ' + ' - ' + message + '\n');
	} catch {
		simple_log(logger, message);
	}
}

function log_g(logger, guild, message, group) {
	try{
		logger.write('\ufeff' + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' | ' + guild.name + ' [' + guild.memberCount + '] (' + guild.id.toString() + ') ' + ' - ' + group + ': ' + message + '\n');
	} catch {
		simple_log(logger, message);
	}
}

function log_error_g(logger, guild, message, group) {
	try {
		logger.write('\ufeff' + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' | 🔸 ERROR ' + guild.name + ' [' + guild.memberCount + '] (' + guild.id.toString() + ') ' + ' - ' + group + ': ' + message + '\n');
	} catch {
		simple_log(logger, message);
	}
}

function printBoolean(bool, response) {
	if(bool) return response[0];
	else return response[1];
}

const eggLevelRestrictions = [1, 5, 10, 15, 20, 25];

const eggCapacity = (level) => 50 + (level - 1) * 25;

const eggRequirement = (level, setting) => Math.floor(5 + (level - 1) + Math.floor((0.01 * (setting / 100)) * Math.pow(level, 2)));

const random = (min, max) => Math.floor(Math.random() * (max - min)) + min;

const getRandom = (items) => items[Math.floor(Math.random() * items.length)];

function getMessage() {
	return quick_update.replaceAll('\\n', '\n');
}

fs.watch('message.txt', function(eventType, filename) {
	quick_update = fs.readFileSync('message.txt', 'utf8');
});

module.exports = { getMessage, lot_cards, boss_index, summon_cluster, summon_bosses, summon_finalboss, eggLevelRestrictions, atlas, eggRequirement, eggCapacity, eggs, dialogues, cluster, bosses, finalboss, getPremium, getJson, printBoolean, popArray, removeElementArray, inBetween, reloadMessageDrop, organize_roles, log, log_error, log_g, log_error_g, simple_log, nFormatter, getRandom, shuffle, random, addGuildStuff, sleep, playOrganizer, zfill, sortFunction, deleteMessageAfterTime };
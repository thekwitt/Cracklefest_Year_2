const { MessageEmbed } = require('discord.js');

async function drop_handler(message, client, channel_id, messageSpawn) {

	const data = await client.pool.query('SELECT * FROM guild_settings WHERE Guild_ID = $1', [message.guildId]);
	const setting = data.rows[0];

	const chance = client.extra.random(0, 101);
	if(setting.drop_boss_chance > chance) {
		if(setting.drop_finalboss_left == 0) {
			await client.extra.finalboss.execute(message, client, channel_id, messageSpawn);
			await client.pool.query('UPDATE guild_settings SET drop_finalboss_left = Drop_FinalBoss_Standard WHERE Guild_ID = $1', [message.guildId]);
		} else {
			await client.extra.bosses[client.extra.getRandom([0, 1, 3, 4])].execute(message, client, channel_id, messageSpawn);

			await client.extra.sleep(5000);

			const data2 = await client.pool.query('SELECT * FROM guild_settings WHERE Guild_ID = $1', [message.guildId]);
			const setting2 = data2.rows[0];

			if(setting2.drop_finalboss_left == 0) {
				const embed = new MessageEmbed()
					.setColor('#8620d4')
					.setTitle('You feel uneasy..')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription('*You hear a voice in your head.*\n\n**"My time has finally come mortals. Will you strike me down and end this war? We shall see.."**')
					.setFooter({ text: 'A powerful boss fight awaits you.' });

				let channel = undefined;
				channel = message.guild.channels.cache.get(channel_id.toString());

				try{ await channel.send({ embeds: [embed] }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Fear Send'));}
				catch (err) {
					client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Send Denied - ' + err.toString());
				}
			}
		}
	} else {
		await client.extra.cluster.execute(message, client, channel_id, messageSpawn);
	}
}

async function fuck(setting, message, client, channel_id) {
	const messageSpawn = client.messages.get(message.guildId);

	if (messageSpawn == undefined) {
		client.extra.reloadMessageDrop(message.guild, client);
		return await client.extra.addGuildStuff(message.guild, client);
	}

	if (messageSpawn.get('timestamp') < Math.floor(Date.now() / 1000) && messageSpawn.get('messageCount') <= 1 && messageSpawn.get('activeMessage') == false) {
		messageSpawn.set('activeMessage', true);
		messageSpawn.set('timestamp', Math.floor(Date.now() / 1000));
		client.messages.set(message.guildId, messageSpawn);
		await drop_handler(message, client, channel_id, messageSpawn);
		client.extra.reloadMessageDrop(message.guild, client);
	}
	else if (messageSpawn.get('activeMessage') == false) {
		messageSpawn.set('messageCount', messageSpawn.get('messageCount') - 1);
		client.messages.set(message.guildId, messageSpawn);
	}
}

module.exports = {
	name: 'messageCreate',
	async execute(message, client) {
		if(message != undefined && message.author != null && message.author.bot == false)
		{
			await client.pool.query('INSERT INTO user_data (Guild_ID, Member_ID) VALUES ($1, $2) ON CONFLICT DO NOTHING;', [message.guildId, message.author.id]);
			await client.pool.query('INSERT INTO user_stats (Guild_ID, Member_ID) VALUES ($1, $2) ON CONFLICT DO NOTHING;', [message.guildId, message.author.id]);
			const data = await client.pool.query('SELECT * FROM guild_settings WHERE Guild_ID = $1', [message.guildId]);
			const setting = data.rows[0];
			if(setting == undefined) return await client.extra.addGuildStuff(message.guild, client);
			if(!client.messages.has(message.guildId)) client.extra.reloadMessageDrop(message.guild, client);
			// Check Channel ID
			const list = message.guild.channels.cache.filter(c => c.type === 'GUILD_TEXT');
			if(!list.has(setting.channel_set) && setting.channel_set != 0) {
				await client.pool.query('UPDATE guild_settings SET channel_set = 0 WHERE Guild_ID = $1', [message.guildId]);
			}

			if(setting.channel_set != 0) {
				if(setting.trigger_drop_outside) {
					if(client.ready.every(v => v === true) && message.member.user.bot == false) {
						try {
							await fuck(setting, message, client, setting.channel_set);
						} catch (err) {
							client.extra.reloadMessageDrop(message.guild, client);
							client.extra.log_error_g(client.logger, message.guild, this.name - ' - Look Below', 'Message Event Failed ');
							client.extra.simple_log(client.logger, String(err));
						}
					}
				} else if (message.channel.id == setting.channel_set) {
					if(client.ready.every(v => v === true) && message.member.user.bot == false) {
						try {
							await fuck(setting, message, client, setting.channel_set);
						} catch (err) {
							client.extra.reloadMessageDrop(message.guild, client);
							client.extra.log_error_g(client.logger, message.guild, this.name - ' - Look Below', ' Event Failed ');
							client.extra.simple_log(client.logger, String(err));
						}
					}
				}
			}
		}
	},
};
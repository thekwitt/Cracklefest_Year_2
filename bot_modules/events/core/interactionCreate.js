// eslint-disable-next-line no-unused-vars
const { Client, CommandInteraction, Collection, MessageEmbed } = require('discord.js');
const cooldowns = new Map();

function nth(i) {
	const j = i % 10,
		k = i % 100;
	if (j == 1 && k != 11) {
		return i + 'st';
	}
	if (j == 2 && k != 12) {
		return i + 'nd';
	}
	if (j == 3 && k != 13) {
		return i + 'rd';
	}
	return i + 'th';
}

function getTime(time, mode) {
	time = Math.floor(time / 1000) + 1;
	if(mode == 1) return time % 60;
	else if (mode == 2) return Math.floor(time / 60) % 60;
	else if (mode == 3) return Math.floor(time / 3600);
}

module.exports = {
	name: 'interactionCreate',

	/**
	 *
	 * @param {CommandInteraction} interaction
	 * @param {Client} client
	 */

	async execute(interaction, client) {
		if(client.ready.every(v => v === true)) {
			if (!interaction.guild) return;
			const guildID = interaction.guildId;
			await client.extra.addGuildStuff(interaction.guild, client);
			if(!client.messages.has(guildID)) client.extra.reloadMessageDrop(interaction.guild, client);

			const data = await client.pool.query('SELECT * FROM guild_settings WHERE Guild_ID = $1', [guildID]);

			const setting = data.rows[0];

			if (interaction.componentType === 'BUTTON' && interaction.user.bot != true) {
				await client.pool.query('INSERT INTO user_data (Guild_ID, Member_ID) VALUES ($1, $2) ON CONFLICT DO NOTHING;', [interaction.guildId, interaction.user.id]);
				await client.pool.query('INSERT INTO user_stats (Guild_ID, Member_ID) VALUES ($1, $2) ON CONFLICT DO NOTHING;', [interaction.guildId, interaction.user.id]);
				// eslint-disable-next-line max-statements-per-line
			} else if(interaction.inGuild() && interaction.guild != undefined) {
				if (!interaction.isCommand()) return;

				const { commandName } = interaction;

				if (!client.commands.has(commandName)) return;

				const authorPerms = interaction.channel.permissionsFor(interaction.member);

				const command = client.commands.get(interaction.commandName);

				if ((!authorPerms || !authorPerms.has('MANAGE_CHANNELS')) && setting.channels_exclude_commands.includes(interaction.channelId)) {
					try{return await interaction.reply({ content: 'Looks like this channel is locked from using slash commands on this bot! Try another channel.', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, ' Interaction Create Event', 'No Channel Reply'));}
					catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' Interaction Create Event', 'Reply Denied');}
				}
				if(interaction.user.bot != true) {
					await client.pool.query('INSERT INTO user_data (Guild_ID, Member_ID) VALUES ($1, $2) ON CONFLICT DO NOTHING;', [interaction.guildId, interaction.user.id]);
					await client.pool.query('INSERT INTO user_stats (Guild_ID, Member_ID) VALUES ($1, $2) ON CONFLICT DO NOTHING;', [interaction.guildId, interaction.user.id]);
				}

				const collector_role = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === 'cracklefest\'s collector');

				const data_u = await client.pool.query('SELECT * FROM user_data WHERE member_id = $1 AND Guild_ID = $2;', [interaction.user.id, interaction.guildId]);
				const user_data = data_u.rows[0];

				// eslint-disable-next-line max-statements-per-line
				if(user_data.collection_eggs.length >= 30) try{ await interaction.member.roles.add(collector_role); } catch (err) { client.extra.log_error_g(client.logger, interaction.guild, String(err), 'Collector Role Denied'); }

				try { if(setting.manage_role == true) await client.extra.organize_roles(client, interaction.channel, interaction.guild); }
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err), 'organize role Denied');}

				// Check Channel ID
				const list = interaction.guild.channels.cache.filter(c => c.type === 'GUILD_TEXT');

				if(!list.has(setting.channel_set) && setting.channel_set != 0) {

					await client.pool.query('UPDATE guild_settings SET channel_set = 0 WHERE Guild_ID = $1', [guildID]);
				}

				if(!cooldowns.has(commandName)) {
					cooldowns.set(commandName, new Collection());
				}

				const current_time = Date.now();
				const time_stamps = cooldowns.get(commandName);
				let cooldown_amount = (command.cooldown) * 1000;
				if(command.cdid != undefined) cooldown_amount = setting.command_cooldowns[command.cdid] * 1000;

				// Check Member ID + Guild ID
				if(time_stamps.has(interaction.member.id + '' + guildID)) {
					const expire_time = time_stamps.get(interaction.member.id + '' + guildID) + cooldown_amount;

					if(current_time < expire_time) {
						// eslint-disable-next-line no-unused-vars
						const time_left = expire_time - current_time;
						if(getTime(time_left, 3) > 0) {
							try{return await interaction.reply({ content: 'Looks like you\'ve used this command lately! Please wait ' + getTime(time_left, 3) + ' hours ' + getTime(time_left, 2) + ' minutes ' + getTime(time_left, 1) + ' seconds!', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, ' Interaction Create Event', 'Cooldown Reply'));}
							catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' Interaction Create Event', 'Reply Denied');}
						}
						try{return await interaction.reply({ content: 'Looks like you\'ve used this command lately! Please wait ' + getTime(time_left, 2) + ' minutes ' + getTime(time_left, 1) + ' seconds!', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, ' Interaction Create Event', 'Cooldown Reply'));}
						catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' Interaction Create Event', 'Reply Denied');}
					}
				}

				time_stamps.set(interaction.member.id + '' + guildID, current_time);
				cooldowns.set(commandName, time_stamps);
				setTimeout(() => time_stamps.delete(interaction.member.id + '' + interaction.guildId), cooldown_amount);

				// Mailbox Handler
				/*
				if(commandName == 'mailbox') {
					if(client.mailboxes.has(interaction.member.id + '' + guildID)) {
						const mailbox_data = client.mailboxes.get(interaction.member.id + '' + guildID);
						try {
							const channel = await interaction.guild.channels.fetch(mailbox_data[0]);
							const message = await channel.messages.fetch(mailbox_data[1]);
							await message.edit({ content: 'This mailbox is now closed. Please see the new one you spawned below.', embeds: [], components: [], attachments: [], files: [] });
						} catch {
							client.extra.log_error_g(client.logger, interaction.guild, 'Mailbox Overwrite Failed');
						}
					}
				}*/

				try {
					// eslint-disable-next-line prefer-const

					if(setting.channel_set == 0 && (commandName != 'setchannel' && commandName != 'help')) {
						try{return await interaction.reply({ content: 'Looks like you don\'t have a channel set or your old channel is gone. To start using the bot, please have a moderator or admin use the /setchannel command on a channel to (re)initialize the bot. (The bot must have role, external emoji, embed, send message, and read message perms for that channel and the bot role)' }).then(client.extra.log_g(client.logger, interaction.guild, ' Interaction Create Event', 'No Channel Reply'));}
						catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' Interaction Create Event', 'Reply Denied');}
					}
					else if(((commandName === 'setchannel' || commandName === 'help') && setting.channel_set == 0) || (setting.channel_set != 0)) {
						if(interaction.member.id == 198305088203128832) {
							try{ await command.execute(interaction, client).then(client.extra.log_g(client.logger, interaction.guild, ' Interaction Create Event', commandName + ' - Execution')); }
							catch(err) {

								if(commandName == 'spawnboss') client.extra.reloadMessageDrop(interaction.guild, client);

								time_stamps.delete(interaction.member.id + '' + guildID);
								client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' Interaction Create Event - Look Below', commandName + ' - Execution Failed ');
								client.extra.simple_log(client.logger, String(err));
								await interaction.reply({ content: 'There was an error while executing this command Please try again!', ephemeral: true });
							}
						} else if(command.permission) {
							if(!authorPerms || !authorPerms.has(command.permission)) {
								const bucketEmbed = new MessageEmbed()
									.setColor('RED')
									.setTitle('You don\'t have permission to use this command.')
									.setDescription('You need the ability to ' + command.permission + ' to use this!')
									.setFooter('If you encounter anymore problems, please join https://discord.gg/BYVD4AGmYR and tag TheKWitt!');
								try{await interaction.reply({ embeds: [bucketEmbed] }).then(client.extra.log_g(client.logger, interaction.guild, ' Interaction Create Event', 'Invalid Perms Reply'));}
								catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' Interaction Create Event', 'Reply Denied');}

							// eslint-disable-next-line max-statements-per-line
							} else {
								try{ await command.execute(interaction, client).then(client.extra.log_g(client.logger, interaction.guild, ' Interaction Create Event', commandName + ' - Execution')); }
								catch(err) {
									if(commandName == 'spawnboss') client.extra.reloadMessageDrop(interaction.guild, client);

									time_stamps.delete(interaction.member.id + '' + guildID);
									client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' Interaction Create Event - Look Below', commandName + ' - Execution Failed ');
									client.extra.simple_log(client.logger, String(err));
									await interaction.reply({ content: 'There was an error while executing this command Please try again!', ephemeral: true });
								}
							}
						// eslint-disable-next-line max-statements-per-line
						} else {
							try{ await command.execute(interaction, client).then(client.extra.log_g(client.logger, interaction.guild, ' Interaction Create Event', commandName + ' - Execution')); }
							catch (err) {

								if(commandName == 'spawnboss') client.extra.reloadMessageDrop(interaction.guild, client);

								time_stamps.delete(interaction.member.id + '' + guildID);
								client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' Interaction Create Event - Look Below', commandName + ' - Execution Failed ');
								client.extra.simple_log(client.logger, String(err));
								await interaction.reply({ content: 'There was an error while executing this command Please try again!', ephemeral: true });
							}
						}
					}

					if (interaction.reset_cooldown) time_stamps.delete(interaction.member.id + '' + guildID);

				} catch (error) {
					console.error(error);
					try{await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, ' Interaction Create Event', 'Error Reply'));}
					catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' Interaction Create Event', 'Reply Denied');}
				}

				if(user_data.first_time == false) {
					await client.pool.query('UPDATE user_data SET first_time = true WHERE member_id = $1 AND Guild_ID = $2;', [interaction.user.id, interaction.guildId]);
					try{await interaction.followUp({ content: 'Looks like you are using the bot for the first time! Check out the **/help quickguide** AND **/loreintro** to get started!', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, ' Interaction Create Event', 'Error Reply'));}
					catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' Interaction Create Event', 'Reply Denied');}
				} else if(user_data.new_update == false) {

					const d = await client.pool.query('SELECT * FROM user_data WHERE new_update = TRUE;');
					const u = d.rows;

					const e = new MessageEmbed()
						.setColor(client.colors[0][0])
						.setTitle('📖   Major Update!   📖')
						// eslint-disable-next-line spaced-comment
						//.setThumbnail(user.defaultAvatarURL)
						.addField('Bug Fixes!', '\n⠀')
						.setFooter({ text: 'You are the ' + nth(u.length + 1) + ' person to view this update!\nCheers!' });

					try{await interaction.followUp({ embeds: [e], ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, ' Interaction Create Event', 'Error Reply'));}
					catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' Interaction Create Event', 'Reply Denied');}
					await client.pool.query('UPDATE user_data SET new_update = true WHERE member_id = $1 AND Guild_ID = $2;', [interaction.user.id, interaction.guildId]);
				} else if(user_data.quick_update == false) {

					const d = await client.pool.query('SELECT * FROM user_data WHERE quick_update = TRUE;');
					const u = d.rows;

					const e = new MessageEmbed()
						.setColor(client.colors[0][0])
						.setTitle('📖   Quick Dev Update!   📖')
						// eslint-disable-next-line spaced-comment
						//.setThumbnail(user.defaultAvatarURL)
						.setDescription('⠀\n' + client.extra.getMessage() + '\n⠀')
						.setFooter({ text: 'You are the ' + nth(u.length + 1) + ' person to view this update!\nCheers!' });

					try{await interaction.followUp({ embeds: [e], ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, ' Interaction Create Event', 'Error Reply'));}
					catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' Interaction Create Event', 'Reply Denied');}
					await client.pool.query('UPDATE user_data SET new_update = true WHERE member_id = $1 AND Guild_ID = $2;', [interaction.user.id, interaction.guildId]);
				}



				if(interaction.failed) time_stamps.delete(interaction.member.id + '' + guildID);

			}
		} else {
			try{await interaction.reply({ content: 'The bot is restarting! Please wait 10 seconds.', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, ' Interaction Create Event', 'Restarting Reply'));}
			catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' Interaction Create Event', 'Reply Denied');}
		}
	},
};
/* eslint-disable prefer-const */
/* eslint-disable no-case-declarations */
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

async function rewarder(users, guildId, client) {

	await client.pool.query('UPDATE guild_settings SET drop_finalboss_left = drop_finalboss_left - 1 WHERE Guild_ID = $1', [guildId]);
	await client.pool.query('UPDATE user_stats SET boss_spawned[2] = TRUE WHERE Guild_ID = $2 AND Member_ID = ANY($1);', [users, guildId]);

	if(users.length == 1) {
		await client.pool.query('UPDATE user_data SET Clusters = Clusters + 3 WHERE Guild_ID = $2 AND Member_ID = $1;', [users[0], guildId]);
	} else if(users.length == 2) {
		await client.pool.query('UPDATE user_data SET Clusters = Clusters + 3 WHERE Guild_ID = $2 AND Member_ID = $1;', [users[0], guildId]);
		await client.pool.query('UPDATE user_data SET Clusters = Clusters + 2 WHERE Guild_ID = $2 AND Member_ID = $1;', [users[1], guildId]);
	} else if(users.length == 3) {
		await client.pool.query('UPDATE user_data SET Clusters = Clusters + 3 WHERE Guild_ID = $2 AND Member_ID = $1;', [users[0], guildId]);
		await client.pool.query('UPDATE user_data SET Clusters = Clusters + 2 WHERE Guild_ID = $2 AND Member_ID = $1;', [users[1], guildId]);
		await client.pool.query('UPDATE user_data SET Clusters = Clusters + 1 WHERE Guild_ID = $2 AND Member_ID = $1;', [users[2], guildId]);
	} else {
		await client.pool.query('UPDATE user_data SET Clusters = Clusters + 4 WHERE Guild_ID = $2 AND Member_ID = $1;', [users[0], guildId]);
		await client.pool.query('UPDATE user_data SET Clusters = Clusters + 3 WHERE Guild_ID = $2 AND Member_ID = $1;', [users[1], guildId]);
		await client.pool.query('UPDATE user_data SET Clusters = Clusters + 2 WHERE Guild_ID = $2 AND Member_ID = $1;', [users[2], guildId]);

		await client.pool.query('UPDATE user_data SET Clusters = Clusters + 1 WHERE Guild_ID = $2 AND Member_ID = ANY($1);', [users.slice(3), guildId]);
	}
}


function get_clock(timestamp, max) {

	const time = (1 - ((max - (timestamp - (Date.now() / 1000))) / max)) * 100;

	if(time > 90) return '🕐';
	else if(time > 80) return '🕑';
	else if(time > 70) return '🕓';
	else if(time > 60) return '🕔';
	else if(time > 50) return '🕕';
	else if(time > 40) return '🕗';
	else if(time > 30) return '🕘';
	else if(time > 20) return '🕙';
	else if(time > 10) return '🕚';
	else return '🕛';
}

function rowReturn(type, client) {
	switch(type) {
	case 0: // Regular 3 Button
		const target0 = client.extra.random(0, 3);
		const rows0 = new MessageActionRow();
		for(let i = 0; i < 3; i++) {
			if(i == target0) rows0.addComponents(new MessageButton().setCustomId('hit').setLabel('Hit! ').setStyle('DANGER'));
			else rows0.addComponents(new MessageButton().setCustomId('miss' + i).setLabel('Miss!').setStyle('SECONDARY'));
		}

		if(client.extra.random(0, 100) > 90) rows0.addComponents(new MessageButton().setCustomId('superhit').setLabel('Super Hit!').setStyle('PRIMARY'));
		return [rows0];

	case 1: // Regular 5 Button
		const target1 = client.extra.random(0, 5);
		const rows1 = new MessageActionRow();
		for(let i = 0; i < 5; i++) {
			if(i == target1) rows1.addComponents(new MessageButton().setCustomId('hit').setLabel('Hit! ').setStyle('DANGER'));
			else if(i == 4 && client.extra.random(0, 100) > 90) rows1.addComponents(new MessageButton().setCustomId('superhit').setLabel('Super Hit!').setStyle('PRIMARY'));
			else rows1.addComponents(new MessageButton().setCustomId('miss' + i).setLabel('Miss!').setStyle('SECONDARY'));
		}

		return [rows1];

	case 2: // Cast
		const target2 = client.extra.random(0, 5);
		const rows2 = new MessageActionRow();
		for(let i = 0; i < 5; i++) {
			if(i == target2) rows2.addComponents(new MessageButton().setCustomId('interrupt').setLabel('Interrupt! ').setStyle('PRIMARY'));
			else rows2.addComponents(new MessageButton().setCustomId('mess' + i).setLabel('Miss!').setStyle('SECONDARY'));
		}

		// if(client.extra.random(0, 100) > 95) rows.addComponents(new MessageButton().setCustomId('superhit').setLabel('Super Hit!').setStyle('PRIMARY'));
		return [rows2];
	}
}

module.exports = {
	name: 'Crystal Guardian',
	async execute(interaction, client, channel_id, messageSpawn) {

		const data = await client.pool.query('SELECT * FROM guild_settings WHERE Guild_ID = $1', [interaction.guildId]);
		const setting = data.rows[0];
		const guildId = interaction.guildId;


		await client.pool.query('UPDATE guild_stats SET boss_spawned[2] = TRUE WHERE Guild_ID = $1', [guildId]);

		const health = [40, 60, 90, 100][setting.boss_difficulty];
		let embed = undefined;

		this.active = true;

		let rows = rowReturn(0, client);

		const ambushRow = [
			new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId('ambush')
						.setLabel('Chuck Egg!')
						.setStyle('DANGER'),
				)];

		let phase = 0;
		const ambush = [];
		let combatEmbed = undefined;
		let cast_yes = [];
		let cast_no = [];
		const image_urls = ['https://cdn.discordapp.com/attachments/782835367085998080/958617815525507102/Crystal_Boss_1.png', 'https://cdn.discordapp.com/attachments/782835367085998080/958617815223525376/Crystal_Boss_2.png'];
		let users = new Map();
		const user_damage = new Map();
		const user_miss = new Map();
		let damage = 0;
		let sec_limit = client.extra.random(7, 11);
		embed = new MessageEmbed()
			.setColor(client.colors[0][2])
			.setTitle('A boss has appeared!')
			// eslint-disable-next-line spaced-comment
			//.setThumbnail(user.defaultAvatarURL)
			.setDescription('"Intruders detected. Engaging protective protocols."')
			.setImage('https://cdn.discordapp.com/attachments/782835367085998080/963229003823583272/crystal.png');

		let channel = undefined;
		channel = await interaction.guild.channels.cache.get(channel_id.toString());
		let interactionMessage = undefined;
		try{ interactionMessage = await channel.send({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, 'Spawn Boss Event', 'First Send'));}
		catch (err) {
			client.extra.log_error_g(client.logger, interaction.guild, 'Spawn Boss Event', 'Send Denied - ' + err.toString());
			messageSpawn.set('messageCount', setting.drop_message_count).set('timestamp', Math.floor(Date.now() / 1000) + setting.drop_time_count).set('activeMessage', false);
			client.messages.set(interaction.guildId, messageSpawn);
		}

		await client.pool.query('UPDATE guild_stats SET Cluster_Spawns = Cluster_Spawns + 1 WHERE Guild_ID = $1', [interaction.guildId]);

		if(interactionMessage == undefined) {
			messageSpawn.set('messageCount', setting.drop_message_count).set('timestamp', Math.floor(Date.now() / 1000) + setting.drop_time_count).set('activeMessage', false);
			client.messages.set(interaction.guildId, messageSpawn);
		}

		if(setting.delete_ot) {
			try { await client.extra.deleteMessageAfterTime(client, interactionMessage, 300000 + setting.drop_duration); }
			catch (error) { client.extra.log_error_g(client.logger, interaction.guild, 'Spawn Boss Event', 'Delete Denied'); }
		}

		const filter = i => {
			if(interactionMessage != undefined) return i.message.id == interactionMessage.id;
		};

		await client.extra.sleep(5000);

		embed = new MessageEmbed()
			.setColor(client.colors[0][1])
			.setImage(image_urls[0]);

		const title = new MessageEmbed()
			.setColor('#ff003c')
			.setTitle(this.name)
			.setAuthor('Guardians of the Void');

		try{await interactionMessage.edit({ embeds: [title, embed] }).then(client.extra.log_g(client.logger, interaction.guild, 'Spawn Boss Event', 'Expired Edit'));}
		catch (err) {client.extra.log_error_g(client.logger, interaction.guild, 'Spawn Boss Event', 'Edit Denied - ' + String(err));}

		await client.extra.sleep(5000);


		embed = new MessageEmbed()
			.setColor(client.colors[0][2])
			.setTitle(this.name)
			// eslint-disable-next-line spaced-comment
			//.setThumbnail(user.defaultAvatarURL)
			.setDescription('"Protocols Configured. Beginning Execution."')
			.setImage(image_urls[0])
			.setFooter({ text: 'Chuck an egg from your basket to do extra damage as an ambush!' });


		try{await interactionMessage.edit({ embeds: [embed], components: ambushRow }).then(client.extra.log_g(client.logger, interaction.guild, 'Spawn Boss Event', 'Expired Edit'));}
		catch (err) {client.extra.log_error_g(client.logger, interaction.guild, 'Spawn Boss Event', 'Edit Denied - ' + String(err));}

		let endts = (Date.now() / 1000) + 125;
		const collector = await channel.createMessageComponentCollector({ filter, time: 1000 * 125 });

		collector.on('collect', async i => {
			await client.pool.query('INSERT INTO user_data (Guild_ID, Member_ID) VALUES ($1, $2) ON CONFLICT DO NOTHING;', [guildId, i.user.id]);
			if(phase == 0) {
				if(i.customId === 'ambush') {
					const data_u = await client.pool.query('SELECT * FROM user_data WHERE member_id = $1 AND Guild_ID = $2;', [i.user.id, guildId]);
					const user = data_u.rows[0];

					try {
						if(ambush.includes(i.user.id)) {
							if((100 - Math.floor((damage / health) * 100)) < 95) {
								try{ await i.reply({ content: this.name + ' has taken 5% already for the ambush! Get ready for the main boss fight!', ephemeral: true }); }
								catch {client.extra.log_error_g(client.logger, interaction.guild, 'Boss Event', 'Miss Reminder Denied');}
							} else if(user.basket_eggs.length <= 0) {
								try{ await i.reply({ content: 'You ran out of eggs! Get ready for the main boss fight!', ephemeral: true }); }
								catch {client.extra.log_error_g(client.logger, interaction.guild, 'Boss Event', 'Miss Reminder Denied');}
							} else {
								const x = ambush.length;
								damage += x * 0.5;
								user.basket_eggs = client.extra.shuffle(user.basket_eggs).slice(0, user.basket_eggs.length - 1);
								await client.pool.query('UPDATE user_data SET basket_eggs = $1 WHERE Guild_ID = $3 AND Member_ID = $2;', [user.basket_eggs, i.user.id, guildId]);
								try { await i.deferUpdate(); }
								catch {client.extra.log_error_g(client.logger, interaction.guild, 'Boss Event', 'Hit Denied');}
							}

						} else {
							// eslint-disable-next-line max-statements-per-line
							if((100 - Math.floor((damage / health) * 100)) < 95) {
								try{ await i.reply({ content: this.name + ' has taken 5% already for the ambush! Get ready for the main boss fight!', ephemeral: true }); }
								catch {client.extra.log_error_g(client.logger, interaction.guild, 'Boss Event', 'Miss Reminder Denied');}
							} else if(user.basket_eggs.length <= 0) {
								try{ await i.reply({ content: 'You ran out of eggs! Get ready for the main boss fight!', ephemeral: true }); }
								catch {client.extra.log_error_g(client.logger, interaction.guild, 'Boss Event', 'Miss Reminder Denied');}
							} else {
								const x = ambush.length;
								damage += x * 0.5;
								user.basket_eggs = client.extra.shuffle(user.basket_eggs).slice(0, user.basket_eggs.length - 1);
								await client.pool.query('UPDATE user_data SET basket_eggs = $1 WHERE Guild_ID = $3 AND Member_ID = $2;', [user.basket_eggs, i.user.id, guildId]);
								try { await i.deferUpdate(); }
								catch {client.extra.log_error_g(client.logger, interaction.guild, 'Boss Event', 'Hit Denied');}
							}

							ambush.push(i.user.id);
						}
					} catch {
						try { await i.deferUpdate(); }
						catch {client.extra.log_error_g(client.logger, interaction.guild, 'Boss Event', 'Hit Denied');}
					}
				}
			} else {
				users.set(i.user.id, (Date.now() / 1000) + 3);
				if(!user_miss.has(i.user.id)) user_miss.set(i.user.id, 0);
				if (i.customId === 'hit' || i.customId === 'superhit') {
					let x = users.size;

					if(x == 0) x = 1;

					let hit = 1 / x;

					if(i.customId === 'superhit') hit = 0.03 * health;

					if(!user_damage.has(i.user.id)) user_damage.set(i.user.id, hit);
					else user_damage.set(i.user.id, user_damage.get(i.user.id) + hit);

					damage += hit;
					if(damage >= health) {
						try { await i.deferUpdate(); }
						catch {client.extra.log_error_g(client.logger, interaction.guild, 'Boss Event', 'Ended Hit');}
						collector.stop();
					} else {
						// eslint-disable-next-line no-lonely-if
						if(i.customId === 'hit') {
							try { await i.deferUpdate(); }
							catch {client.extra.log_error_g(client.logger, interaction.guild, 'Boss Event', 'Hit Denied');}
						} else if(i.customId === 'superhit') {
							try{ await i.reply({ content: 'Nice! You super hit ' + this.name + ' for 3% !', ephemeral: true }); }
							catch {client.extra.log_error_g(client.logger, interaction.guild, 'Boss Event', 'Miss Reminder Denied');}
							rows[0].components[rows[0].components.length - 1].setDisabled(true);
							if(damage < health) {
								try{await interactionMessage.edit({ embeds: [embed, combatEmbed], components: rows }).then(client.extra.log_g(client.logger, interaction.guild, 'Spawn Boss Event', 'Boss Super Attack Edit'));}
								catch (err) {client.extra.log_error_g(client.logger, interaction.guild, 'Spawn Boss Event', 'Attack Edit Denied - ' + String(err));}
							}
						}
					}
				} else if(i.customId.startsWith('miss')) {
					// eslint-disable-next-line no-lonely-if
					let x = users.size;

					if(x == 0) x = 1;

					const hit = 1 / x;

					damage -= hit * 2;
					user_miss.set(i.user.id, user_miss.get(i.user.id) + 1);
					try{ await i.reply({ content: 'You missed an attack and ' + this.name + ' had a chance to heal up! Be careful next time!', ephemeral: true }); }
					catch {client.extra.log_error_g(client.logger, interaction.guild, 'Boss Event', 'Miss Attacik Denied');}
				} else if(i.customId.startsWith('mess')) {
					if(!cast_yes.includes(i.user.id) && !cast_no.includes(i.user.id)) {
						cast_no.push(i.user.id);
						user_miss.set(i.user.id, user_miss.get(i.user.id) + 1);
						try{ await i.reply({ content: 'You miss the chance to interrupt the cast!', ephemeral: true }); }
						catch {client.extra.log_error_g(client.logger, interaction.guild, 'Boss Event', 'Miss Attacik Denied');}
					} else {
						try{ await i.reply({ content: 'You already tried to interrupt the cast! Wait for the next button swap to do another!', ephemeral: true }); }
						catch {client.extra.log_error_g(client.logger, interaction.guild, 'Boss Event', 'Miss Attacik Denied');}
					}

				} else if(i.customId.startsWith('interrupt')) {
					if(!cast_yes.includes(i.user.id) && !cast_no.includes(i.user.id)) {
						cast_yes.push(i.user.id);
						// eslint-disable-next-line max-statements-per-line
						try {
							try{ await i.reply({ content: 'You helped interrupt the cast! ', ephemeral: true }); }
							catch {client.extra.log_error_g(client.logger, interaction.guild, 'Boss Event', 'Miss Attacik Denied');}
						} catch {client.extra.log_error_g(client.logger, interaction.guild, 'Boss Event', 'Ended Hit');}

					} else {
						try{ await i.reply({ content: 'You already tried to interrupt the cast! Wait for the next button swap to do another!', ephemeral: true }); }
						catch {client.extra.log_error_g(client.logger, interaction.guild, 'Boss Event', 'Miss Attacik Denied');}
					}

				}
			}
		});

		try {
		// eslint-disable-next-line no-unused-vars
			collector.on('end', async i => {
				const sortedDamage = new Map([...user_damage.entries()].sort((a, b) => b[1] - a[1]));
				const arraySortedDamage = Array.from(sortedDamage.keys());

				if(user_damage.size == 0) {
					const end = new MessageEmbed()
						.setColor(client.colors[0][1])
						.setTitle('' + this.name + ' Left!')
						// eslint-disable-next-line spaced-comment
						//.setThumbnail(user.defaultAvatarURL)
						.setDescription('⠀\n**No one tried to stop ' + this.name + ' and claimed victory over the server!**\n⠀')
						.setFooter('Try to fight it next time!')
						.setImage();
					try{await interactionMessage.edit({ embeds: [end], components: [] }).then(client.extra.log_g(client.logger, interaction.guild, 'Spawn Boss Event', 'Boss Empty Edit'));}
					catch{client.extra.log_error_g(client.logger, interaction.guild, 'Spawn Boss Event', 'Edit Denied');}
				} else {
					let string = 'Oh no! ' + this.name + ' couldn\'t be defeated in time and claimed victory over the server!!**';
					let members = channel.guild.members.cache;

					if (channel.guild.memberCount > members.size)
					{
						try{members = await channel.guild.members.fetch().then(client.extra.log_g(client.logger, channel.guild, 'LB Command', 'Member Fetch'));}
						catch {client.extra.log_error_g(client.logger, channel.guild, 'LB Command', 'Fetch Denied');}
					}
					if(damage >= health) {
						let dmgString = '```css\n[Rank] | {.Dmg / Miss.} | Degen\n==========================================\n';
						string = '*The Crystal Guardian starts to malfunction, cracking and distorting. Slowly, the guardian starts to break apart and fall on the ground.*\n\n' + (user_damage.size == 1 ? 'Winner! - 3 Clusters' : (user_damage.size == 2 ? '1st - 3 Clusters\n2nd - 2 Clusters' : (user_damage.size == 3 ? '1st - 3 Clusters\n2nd - 2 Clusters\n3rd - 1 Cluster' : '1st - 4 Clusters\n2nd - 3 Clusters\n3rd - 2 Clusters\n4th and Below - 1 Cluster')));

						let limit = user_damage.size;
						if (limit > 10) limit = 10;

						for(let x = 0; x < limit; x++) {
							try { dmgString += ' ' + '[' + (x + 1).toString().padStart(2, '0') + ']' + '  |  ' + sortedDamage.get(arraySortedDamage[x]).toFixed(2).toString().padStart(5, '0') + ' / ' + user_miss.get(arraySortedDamage[x]).toString().padStart(3, '0') + '   | ' + members.get(arraySortedDamage[x].toString()).user.username.substring(0, 15) + '\n'; }
							catch { ; }
						}

						await rewarder(arraySortedDamage, interaction.guildId, client);

						dmgString += '```';
						const end = new MessageEmbed()
							.setColor(client.colors[0][1])
							.setTitle('' + this.name + ' is defeated!')
							// eslint-disable-next-line spaced-comment
							//.setThumbnail(user.defaultAvatarURL)
							.setDescription('⠀\n' + string + '\n⠀')
							.setFooter('Enjoy the glory!')
							.setImage();


						const dmgBoard = new MessageEmbed()
							.setColor(client.colors[0][2])
							.setTitle('Damage Leaderboard')
							// eslint-disable-next-line spaced-comment
							//.setThumbnail(user.defaultAvatarURL)
							.setDescription('⠀\n' + dmgString + '\n⠀')
							.setFooter('Enjoy the glory!')
							.setImage();


						const viewfilter = j => {
							if(interactionMessage != undefined) return j.interaction.id == interactionMessage.id;
						};

						if(viewfilter == undefined) {
							try{await interactionMessage.edit({ embeds: [end, dmgBoard], components: [] }).then(client.extra.log_g(client.logger, interaction.guild, 'Spawn Boss Event', 'Boss Win 6 Edit'));}
							catch{client.extra.log_error_g(client.logger, interaction.guild, 'Spawn Boss Event', 'Edit Denied');}
						}

						const button = new MessageActionRow()
							.addComponents(
								new MessageButton()
									.setCustomId('view')
									.setLabel('View your stats!')
									.setStyle('PRIMARY'),
							);

						try{await interactionMessage.edit({ embeds: [end, dmgBoard], components: [button] }).then(client.extra.log_g(client.logger, interaction.guild, 'Spawn Boss Event', 'Boss Win 5 Edit'));}
						catch{client.extra.log_error_g(client.logger, interaction.guild, 'Spawn Boss Event', 'Edit Denied');}

						const viewcollector = await channel.createMessageComponentCollector({ filter, time: 300000 });

						viewcollector.on('collect', async j => {
							if(j.customId === 'view') {
								if(!arraySortedDamage.includes(j.user.id)) {
									try{ await j.reply({ content: 'Looks like you weren\'t in this boss fight!', ephemeral: true }); }
									catch {client.extra.log_error_g(client.logger, interaction.guild, 'Boss Event', 'View Denied');}
								} else {
									const r = arraySortedDamage.indexOf(j.user.id);

									try{ await j.reply({ content: 'You did ' + sortedDamage.get(arraySortedDamage[r]).toFixed(2).toString() + ' damage, missed ' + user_miss.get(arraySortedDamage[r]).toString() + ' times and were ranked #' + (r + 1), ephemeral: true }); }
									catch (err) {client.extra.log_error_g(client.logger, interaction.guild, 'Boss Event', 'View Denied - ' + err.toString());}
								}
							}
						});
						try {
							// eslint-disable-next-line no-unused-vars
							viewcollector.on('end', async j => {
								return;
							});
						} catch { return; }

					} else {
						let dmgString = '```css\n[Rank] | {.Dmg / Miss.} | Degen\n==========================================\n';

						let limit = user_damage.size;
						if (limit > 10) limit = 10;

						for(let x = 0; x < limit; x++) {
							dmgString += ' ' + '[' + (x + 1).toString().padStart(2, '0') + ']' + '  |  ' + sortedDamage.get(arraySortedDamage[x]).toFixed(2).toString().padStart(5, '0') + ' / ' + user_miss.get(arraySortedDamage[x]).toString().padStart(3, '0') + '   | ' + members.get(arraySortedDamage[x].toString()).user.username.substring(0, 15) + '\n';
						}

						dmgString += '```';

						const end = new MessageEmbed()
							.setColor(client.colors[0][1])
							.setTitle('' + this.name + ' defeated the server!')
							// eslint-disable-next-line spaced-comment
							//.setThumbnail(user.defaultAvatarURL)
							.setDescription('⠀\n**' + string + '\n⠀')
							.setFooter('Next time work together to defeat ' + this.name + '!')
							.setImage();


						const dmgBoard = new MessageEmbed()
							.setColor(client.colors[0][2])
							.setTitle('Damage Leaderboard')
							// eslint-disable-next-line spaced-comment
							//.setThumbnail(user.defaultAvatarURL)
							.setDescription('⠀\n' + dmgString + '\n⠀')
							.setFooter('Enjoy the glory!')
							.setImage();


						const viewfilter = j => {
							if(interactionMessage != undefined) return j.interaction.id == interactionMessage.id;
						};

						if(viewfilter == undefined) {
							try{await interactionMessage.edit({ embeds: [end, dmgBoard], components: [] }).then(client.extra.log_g(client.logger, interaction.guild, 'Spawn Boss Event', 'Boss Defeated 6 Edit'));}
							catch{client.extra.log_error_g(client.logger, interaction.guild, 'Spawn Boss Event', 'Edit Denied');}

						}

						const button = new MessageActionRow()
							.addComponents(
								new MessageButton()
									.setCustomId('view')
									.setLabel('View your stats!')
									.setStyle('PRIMARY'),
							);

						try{await interactionMessage.edit({ embeds: [end, dmgBoard], components: [button] }).then(client.extra.log_g(client.logger, interaction.guild, 'Spawn Boss Event', 'Boss Defeated 5 Edit'));}
						catch{client.extra.log_error_g(client.logger, interaction.guild, 'Spawn Boss Event', 'Edit Denied');}

						const viewcollector = await channel.createMessageComponentCollector({ filter, time: 300000 });

						viewcollector.on('collect', async j => {
							if(j.customId === 'view') {
								if(!arraySortedDamage.includes(j.user.id)) {
									try{ await j.reply({ content: 'Looks like you weren\'t in this boss fight!', ephemeral: true }); }
									catch {client.extra.log_error_g(client.logger, interaction.guild, 'Boss Event', 'View Denied');}
								} else {
									const r = arraySortedDamage.indexOf(j.user.id);

									try{ await j.reply({ content: 'You did ' + sortedDamage.get(arraySortedDamage[r]).toFixed(2).toString() + ' damage, missed ' + user_miss.get(arraySortedDamage[r]).toString() + ' times and were ranked #' + (r + 1), ephemeral: true }); }
									catch (err) {client.extra.log_error_g(client.logger, interaction.guild, 'Boss Event', 'View Denied - ' + err.toString());}
								}
							}
						});
						try {
							// eslint-disable-next-line no-unused-vars
							viewcollector.on('end', async j => {
								return;
							});
						} catch { return; }
					}
				}
				
				return;

			});
		} catch {
			
			client.extra.log_error_g(client.logger, interaction.guild, 'Spawn Boss Event', 'Edit Failed From No Cache');
		}

		let second = 0;
		let cast = 0;

		while (damage < health && collector.ended == false) {
			if(phase == 1 && (100 - Math.floor((damage / health) * 100)) < 60) {
				second = 0;
				phase = 2;

				const time = endts - (Date.now() / 1000) + 6;

				collector.resetTimer({ time: (time + 15) * 1000 });

				embed = new MessageEmbed()
					.setColor(client.colors[0][0])
					.setTitle(this.name)
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription('"Damage Severe. Raising Aggression."')
					.setImage(image_urls[0]);

				try{await interactionMessage.edit({ embeds: [embed], components: [] }).then(client.extra.log_g(client.logger, interaction.guild, 'Spawn Boss Event', 'Boss Attack Edit'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, 'Spawn Boss Event', 'Attack Edit Denied - ' + String(err));}

				await client.extra.sleep(5000);

				embed = new MessageEmbed()
					.setColor(client.colors[0][0])
					.setTitle(this.name)
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription('"Aggression Rasied. Attack Mode Activated."')
					.setFooter('Get ready for the next phase!')
					.setImage(image_urls[1]);

				try{await interactionMessage.edit({ embeds: [embed], components: [] }).then(client.extra.log_g(client.logger, interaction.guild, 'Spawn Boss Event', 'Boss Attack Edit'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, 'Spawn Boss Event', 'Attack Edit Denied - ' + String(err));}

				await client.extra.sleep(5000);

				endts = (Date.now() / 1000) + time;
				collector.resetTimer({ time: time * 1000 });

				sec_limit = client.extra.random(5, 8);
				combatEmbed = new MessageEmbed()
					.setColor(client.colors[0][1])
					.setTitle('Action Belt')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.addFields(
						{ name: 'Health', value: (100 - Math.floor((damage / health) * 100)) + '% remaining', inline: true },
						{ name: 'Time', value: get_clock(endts, 125), inline: true },
					)
					.setDescription('Press the **Hit!** button to attack ' + this.name + '!')
					.setFooter('Next Button Swap is in ' + sec_limit + ' seconds.');

				embed = new MessageEmbed()
					.setColor(client.colors[0][2])
					.setTitle(this.name)
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription(client.extra.getRandom(['Recalculating Counter Attack.', 'Detecting Weakness.', 'Grilling Chicken Sandwich']))
					.setFooter({ text: '(Hint: 5 clicks per 5 seconds before it tells you to slow down!)' })
					.setImage(image_urls[1]);

				rows = rowReturn(1, client);

				try{await interactionMessage.edit({ embeds: [embed, combatEmbed], components: rows }).then(client.extra.log_g(client.logger, interaction.guild, 'Spawn Boss Event', 'Boss Attack Edit'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, 'Spawn Boss Event', 'Attack Edit Denied - ' + String(err));}
			}
			else if(phase == 2) {

				await client.extra.sleep(1000);

				if(this.active == false) break;

				second++;
				for(let [key, value] of users.entries()) {
					if(value < (Date.now() / 1000)) {
						users.delete(key);
					}
				}

				if(damage < health && collector.ended == false) {
					if(second >= sec_limit && cast < 2) {
						sec_limit = client.extra.random(5, 8);
						second = 0;
						cast++;
						rows = rowReturn(1, client);

						embed = new MessageEmbed()
							.setColor(client.colors[0][2])
							.setTitle(this.name)
							// eslint-disable-next-line spaced-comment
							//.setThumbnail(user.defaultAvatarURL)
							.setDescription(client.extra.getRandom(['Recalculating Counter Attack.', 'Detecting Weakness.', 'Grilling Chicken Sandwich']))
							.setFooter({ text: '(Hint: 5 clicks per 5 seconds before it tells you to slow down!)' })
							.setImage(image_urls[1]);

						combatEmbed = new MessageEmbed()
							.setColor(client.colors[0][1])
							.setTitle('Action Belt')
							// eslint-disable-next-line spaced-comment
							//.setThumbnail(user.defaultAvatarURL)
							.addFields(
								{ name: 'Health', value: (100 - Math.floor((damage / health) * 100)) + '% remaining', inline: true },
								{ name: 'Time', value: get_clock(endts, 125), inline: true },
							)
							.setDescription('Press the **Hit!** button to attack ' + this.name + '!')
							.setFooter('Next Button Swap is in ' + sec_limit + ' seconds.');

						if(damage < health && collector.ended == false) {
							try{await interactionMessage.edit({ embeds: [embed, combatEmbed], components: rows }).then(client.extra.log_g(client.logger, interaction.guild, 'Spawn Boss Event', 'Boss Attack Edit'));}
							catch (err) {client.extra.log_error_g(client.logger, interaction.guild, 'Spawn Boss Event', 'Attack Edit Denied - ' + String(err));}
						}
					} else if(second >= sec_limit && cast >= 2) {
						cast = 0;
						cast_no = [];
						cast_yes = [];
						sec_limit = client.extra.random(5, 8);
						second = 0;
						let u = Math.floor(users.size * 0.7);

						if(u < 1) u = 1;

						embed.setDescription(client.extra.getRandom(['Recalculating Counter Attack.', 'Detecting Weakness.', 'Grilling Chicken Sandwich']));
						rows = rowReturn(2, client);
						combatEmbed = new MessageEmbed()
							.setColor(client.colors[0][1])
							.setTitle('Action Belt')
							// eslint-disable-next-line spaced-comment
							//.setThumbnail(user.defaultAvatarURL)
							.addFields(
								{ name: 'Health', value: (100 - Math.floor((damage / health) * 100)) + '% remaining', inline: true },
								{ name: 'Time', value: get_clock(endts, 125), inline: true },
							)
							.setDescription(this.name + ' is casting a blast! **Interrupt it!**')
							.setFooter('You have 5 seconds to stop the cast! You need a total of ' + Number(u) + ' users to stop the cast!');

						if(damage < health && collector.ended == false) {
							try{await interactionMessage.edit({ embeds: [embed, combatEmbed], components: rows }).then(client.extra.log_g(client.logger, interaction.guild, 'Spawn Boss Event', 'Boss Attack Edit'));}
							catch (err) {client.extra.log_error_g(client.logger, interaction.guild, 'Spawn Boss Event', 'Attack Edit Denied - ' + String(err));}
						}

						const time = endts - (Date.now() / 1000);
						endts = (Date.now() / 1000) + time + 6;
						collector.resetTimer({ time: time * 1000 });

						await client.extra.sleep(6000);

						if(cast_yes.length >= u) {
							rows = rowReturn(1, client);

							damage += (1 / u) * cast_yes.length;

							combatEmbed = new MessageEmbed()
								.setColor(client.colors[0][1])
								.setTitle('Action Belt')
								// eslint-disable-next-line spaced-comment
								//.setThumbnail(user.defaultAvatarURL)
								.addFields(
									{ name: 'Health', value: (100 - Math.floor((damage / health) * 100)) + '% remaining', inline: true },
									{ name: 'Time', value: get_clock(endts, 125), inline: true },
								)
								.setDescription('The blast was interrupted! And it took damage from it!')
								.setFooter('Next Button Swap is in ' + sec_limit + ' seconds.');

							if(damage < health && collector.ended == false) {
								try{await interactionMessage.edit({ embeds: [embed, combatEmbed], components: rows }).then(client.extra.log_g(client.logger, interaction.guild, 'Spawn Boss Event', 'Boss Attack Edit'));}
								catch (err) {client.extra.log_error_g(client.logger, interaction.guild, 'Spawn Boss Event', 'Attack Edit Denied - ' + String(err));}
							}
						} else {
							combatEmbed = new MessageEmbed()
								.setColor(client.colors[0][1])
								.setTitle('Action Belt')
								// eslint-disable-next-line spaced-comment
								//.setThumbnail(user.defaultAvatarURL)
								.addFields(
									{ name: 'Health', value: (100 - Math.floor((damage / health) * 100)) + '% remaining', inline: true },
									{ name: 'Time', value: get_clock(endts, 125), inline: true },
								)
								.setDescription('The blast hit the group! They are unable to attack for ' + sec_limit + ' seconds!')
								.setFooter('Next Button Swap is in ' + sec_limit + ' seconds.');

							if(damage < health && collector.ended == false) {
								try{await interactionMessage.edit({ embeds: [embed, combatEmbed], components: [] }).then(client.extra.log_g(client.logger, interaction.guild, 'Spawn Boss Event', 'Boss Attack Edit'));}
								catch (err) {client.extra.log_error_g(client.logger, interaction.guild, 'Spawn Boss Event', 'Attack Edit Denied - ' + String(err));}
							}
						}

						embed.setDescription(client.extra.getRandom(['Recalculating Counter Attack.', 'Detecting Weakness.', 'Grilling Chicken Sandwich']));

						if (damage >= health) {
							collector.stop();
							break;
						}
					}
				} else {break;}
			} else if(phase == 1) {
				await client.extra.sleep(1000);

				if(this.active == false) break;

				second++;
				for(let [key, value] of users.entries()) {
					if(value < (Date.now() / 1000)) {
						users.delete(key);
					}
				}

				if(damage < health && collector.ended == false) {
					if(second >= sec_limit) {
						sec_limit = client.extra.random(7, 11);
						second = 0;
						rows = rowReturn(0, client);

						embed = new MessageEmbed()
							.setColor(client.colors[0][2])
							.setTitle(this.name)
							// eslint-disable-next-line spaced-comment
							//.setThumbnail(user.defaultAvatarURL)
							.setDescription(client.extra.getRandom(['Recalculating Counter Attack.', 'Detecting Weakness.', 'Grilling Chicken Sandwich']))
							.setFooter({ text: '(Hint: 5 clicks per 5 seconds before it tells you to slow down!)' })
							.setImage(image_urls[0]);

						combatEmbed = new MessageEmbed()
							.setColor(client.colors[0][1])
							.setTitle('Action Belt')
							// eslint-disable-next-line spaced-comment
							//.setThumbnail(user.defaultAvatarURL)
							.addFields(
								{ name: 'Health', value: (100 - Math.floor((damage / health) * 100)) + '% remaining', inline: true },
								{ name: 'Time', value: get_clock(endts, 125), inline: true },
							)
							.setDescription('Press the **Hit!** button to attack ' + this.name + '!')
							.setFooter('Next Button Swap is in ' + sec_limit + ' seconds.');

						if(damage < health && collector.ended == false) {
							try{await interactionMessage.edit({ embeds: [embed, combatEmbed], components: rows }).then(client.extra.log_g(client.logger, interaction.guild, 'Spawn Boss Event', 'Boss Attack Edit'));}
							catch (err) {client.extra.log_error_g(client.logger, interaction.guild, 'Spawn Boss Event', 'Attack Edit Denied - ' + String(err));}
						}
					}
				} else {break;}
			} else if (phase == 0) {
				await client.extra.sleep(8000);
				endts = (Date.now() / 1000) + 130;
				collector.resetTimer({ time: 130 * 1000 });

				embed = new MessageEmbed()
					.setColor(client.colors[0][2])
					.setTitle(this.name)
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription(client.extra.getRandom(['Recalculating Counter Attack.', 'Detecting Weakness.', 'Grilling Chicken Sandwich']))
					.setFooter({ text: '(Hint: 5 clicks per 5 seconds before it tells you to slow down!)' })
					.setImage(image_urls[0]);

				combatEmbed = new MessageEmbed()
					.setColor(client.colors[0][1])
					.setTitle('Action Belt')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.addFields(
						{ name: 'Health', value: (100 - Math.floor((damage / health) * 100)) + '% remaining', inline: true },
						{ name: 'Time', value: get_clock(endts, 130), inline: true },
					)
					.setDescription('The battle is starting! Prepare yourself!')
					.setFooter('Get ready!');

				phase = 1;

				if(ambush.length >= 1) {
					for(let j = 0; j < ambush.length; j++) {
						let x = ambush.length;
						let hit = 1 / x;
						if(!user_damage.has(ambush[j])) user_damage.set(ambush[j], hit);
						else user_damage.set(ambush[j], user_damage.get(ambush[j]) + hit);

						users.set(ambush[j], (Date.now() / 1000) + 3);
					}
				}

				try{await interactionMessage.edit({ embeds: [embed, combatEmbed], components: [] }).then(client.extra.log_g(client.logger, interaction.guild, 'Spawn Boss Event', 'Boss Attack Edit'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, 'Spawn Boss Event', 'Attack Edit Denied - ' + String(err));}

			}

			if(damage > health) {
				collector.stop();
				break;
			}
		}
	},
};
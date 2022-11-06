/* eslint-disable prefer-const */
/* eslint-disable no-case-declarations */
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

async function rewarder(users, guildId, client) {

	await client.pool.query('UPDATE guild_settings SET drop_finalboss_left = drop_finalboss_left - 1 WHERE Guild_ID = $1', [guildId]);
	await client.pool.query('UPDATE user_stats SET boss_spawned[3] = TRUE WHERE Guild_ID = $2 AND Member_ID = ANY($1);', [users, guildId]);

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

function rowReturn(type, client, disable) {

	if(disable == undefined) disable = false;

	switch(type) {
	case 0: // Punch n Counter
		const target0 = client.extra.random(0, 4);
		const output0 = [];
		for(let j = 0; j < 2; j++) {
			const rows0 = new MessageActionRow();
			for(let i = 0; i < 2; i++) {
				if((j * 2) + i == target0) rows0.addComponents(new MessageButton().setCustomId('counter').setLabel('Counter!').setStyle('PRIMARY'));
				else rows0.addComponents(new MessageButton().setCustomId('mess' + (j * 2) + i).setLabel('⠀Miss!⠀').setStyle('SECONDARY'));
			}
			output0.push(rows0);
		}

		// if(client.extra.random(0, 100) > 95) rows.addComponents(new MessageButton().setCustomId('superhit').setLabel('Super Hit!').setStyle('PRIMARY'));
		return output0;

	case 1: // Regular 4 Button
		const target1 = client.extra.random(0, 4);
		const rows1 = new MessageActionRow();
		for(let i = 0; i < 4; i++) {
			if(i == target1) rows1.addComponents(new MessageButton().setCustomId('hit').setLabel('Hit! ').setStyle('DANGER').setDisabled(disable));
			else rows1.addComponents(new MessageButton().setCustomId('miss' + i).setLabel('Miss!').setStyle('SECONDARY').setDisabled(disable));
		}

		if(client.extra.random(0, 100) > 90) rows1.addComponents(new MessageButton().setCustomId('superhit').setLabel('Super Hit!').setStyle('PRIMARY').setDisabled(disable));
		return [rows1];

	case 2: // Dodge
		const rows2 = new MessageActionRow();
		for(let i = 0; i < 3; i++) {
			rows2.addComponents(new MessageButton().setCustomId('hit' + i).setLabel('Hit!').setStyle('DANGER').setDisabled(disable));
		}

		// if(client.extra.random(0, 100) > 95) rows.addComponents(new MessageButton().setCustomId('superhit').setLabel('Super Hit!').setStyle('PRIMARY'));
		return [rows2];
	}
}

module.exports = {
	name: 'Rabbit Chad',
	async execute(message, client, channel_id, messageSpawn) {

		const data = await client.pool.query('SELECT * FROM guild_settings WHERE Guild_ID = $1', [message.guildId]);
		const setting = data.rows[0];
		const guildId = message.guildId;


		await client.pool.query('UPDATE guild_stats SET boss_spawned[3] = TRUE WHERE Guild_ID = $1', [guildId]);

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
		let stunned = [];
		let cast_yes = [];
		let cast_no = [];
		let cast_name = [];
		const stun = new Map();
		let users = new Map();
		const user_damage = new Map();
		const user_miss = new Map();
		let damage = 0;
		let sec_limit = 5;

		const image_urls = ['https://cdn.discordapp.com/attachments/782835367085998080/958617816569888828/Chad_Bunny_1.png', 'https://cdn.discordapp.com/attachments/782835367085998080/958617816242741278/Chad_Bunny_2.png'];

		let combatEmbed = undefined;

		embed = new MessageEmbed()
			.setColor(client.colors[0][2])
			.setTitle('A boss has appeared!')
			// eslint-disable-next-line spaced-comment
			//.setThumbnail(user.defaultAvatarURL)
			.setDescription('"So these are the **Warriors of Coneyford**? I expected more than this."')
			.setImage('https://cdn.discordapp.com/attachments/782835367085998080/963229003332853840/chad.png');

		let channel = undefined;
		channel = await message.guild.channels.cache.get(channel_id.toString());
		let interactionMessage = undefined;
		try{ interactionMessage = await channel.send({ embeds: [embed] }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'First Send'));}
		catch (err) {
			client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Send Denied - ' + err.toString());
			messageSpawn.set('messageCount', setting.drop_message_count).set('timestamp', Math.floor(Date.now() / 1000) + setting.drop_time_count).set('activeMessage', false);
			client.messages.set(message.guildId, messageSpawn);
		}

		await client.pool.query('UPDATE guild_stats SET Cluster_Spawns = Cluster_Spawns + 1 WHERE Guild_ID = $1', [message.guildId]);

		if(interactionMessage == undefined) {
			messageSpawn.set('messageCount', setting.drop_message_count).set('timestamp', Math.floor(Date.now() / 1000) + setting.drop_time_count).set('activeMessage', false);
			client.messages.set(message.guildId, messageSpawn);
		}

		if(setting.delete_ot) {
			try { await client.extra.deleteMessageAfterTime(client, interactionMessage, 600000 + setting.drop_duration); }
			catch (error) { client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Delete Denied'); }
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
			.setAuthor('Lone Betrayed Bartender');


		try{await interactionMessage.edit({ embeds: [title, embed] }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Expired Edit'));}
		catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Edit Denied - ' + String(err));}

		await client.extra.sleep(5000);

		embed = new MessageEmbed()
			.setColor(client.colors[0][2])
			.setTitle(this.name)
			// eslint-disable-next-line spaced-comment
			//.setThumbnail(user.defaultAvatarURL)
			.setDescription('"Well then, ready yourself! My muscles thrist for a good battle!"')
			.setImage(image_urls[0])
			.setFooter({ text: 'Chuck an egg from your basket to do extra damage as an ambush!' });


		try{await interactionMessage.edit({ embeds: [embed], components: ambushRow }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Expired Edit'));}
		catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Edit Denied - ' + String(err));}

		let endts = (Date.now() / 1000) + 125;
		const collector = await channel.createMessageComponentCollector({ filter, time: 1000 * 125 });

		collector.on('collect', async i => {
			await client.pool.query('INSERT INTO user_data (Guild_ID, Member_ID) VALUES ($1, $2) ON CONFLICT DO NOTHING;', [guildId, i.user.id]);
			if(phase == 0) {
				if(i.customId === 'ambush') {
					const data_u = await client.pool.query('SELECT * FROM user_data WHERE member_id = $1 AND Guild_ID = $2;', [i.user.id, guildId]);
					const user = data_u.rows[0];

					if(ambush.includes(i.user.id)) {
						try {
							if((100 - Math.floor((damage / health) * 100)) < 95) {
								try{ await i.reply({ content: this.name + ' has taken 5% already for the ambush! Get ready for the main boss fight!', ephemeral: true }); }
								catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Miss Reminder Denied');}
							} else if(user.basket_eggs.length <= 0) {
								try{ await i.reply({ content: 'You ran out of eggs! Get ready for the main boss fight!', ephemeral: true }); }
								catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Miss Reminder Denied');}
							} else {
								const x = ambush.length;
								damage += x * 0.5;
								user.basket_eggs = client.extra.shuffle(user.basket_eggs).slice(0, user.basket_eggs.length - 1);
								await client.pool.query('UPDATE user_data SET basket_eggs = $1 WHERE Guild_ID = $3 AND Member_ID = $2;', [user.basket_eggs, i.user.id, guildId]);
								try { await i.deferUpdate(); }
								catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Hit Denied');}
							}
						} catch {
							try { await i.deferUpdate(); }
							catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Hit Denied');}
						}
					} else {
						try {
							// eslint-disable-next-line max-statements-per-line
							if((100 - Math.floor((damage / health) * 100)) < 95) {
								try{ await i.reply({ content: this.name + ' has taken 5% already for the ambush! Get ready for the main boss fight!', ephemeral: true }); }
								catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Miss Reminder Denied');}
							} else if(user.basket_eggs.length <= 0) {
								try{ await i.reply({ content: 'You ran out of eggs! Get ready for the main boss fight!', ephemeral: true }); }
								catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Miss Reminder Denied');}
							} else {
								const x = ambush.length;
								damage += x * 0.5;
								user.basket_eggs = client.extra.shuffle(user.basket_eggs).slice(0, user.basket_eggs.length - 1);
								await client.pool.query('UPDATE user_data SET basket_eggs = $1 WHERE Guild_ID = $3 AND Member_ID = $2;', [user.basket_eggs, i.user.id, guildId]);
								try { await i.deferUpdate(); }
								catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Hit Denied');}
							}

							ambush.push(i.user.id);
						} catch {
							try { await i.deferUpdate(); }
							catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Hit Denied');}
						}
					}
				}
			} else {
				users.set(i.user.id, (Date.now() / 1000) + 3);
				if(!user_miss.has(i.user.id)) user_miss.set(i.user.id, 0);
				if (i.customId.startsWith('hit') || i.customId === 'superhit') {
					if(stun.has(i.user.id)) {
						if(stun.get(i.user.id) - Math.floor(Date.now() / 1000) <= 0) {
							stun.delete(i.user.id);

							let x = users.size;

							if(x == 0) x = 1;

							let hit = 1 / x;

							if(i.customId === 'superhit') hit = 0.03 * health;

							if(!user_damage.has(i.user.id)) user_damage.set(i.user.id, hit);
							else user_damage.set(i.user.id, user_damage.get(i.user.id) + hit);

							damage += hit;
							if(damage >= health) {
								try { await i.deferUpdate(); }
								catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Ended Hit');}
								collector.stop();
							} else {
								// eslint-disable-next-line no-lonely-if
								if(i.customId.startsWith('hit')) {
									try { await i.deferUpdate(); }
									catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Hit Denied');}
								} else if(i.customId === 'superhit') {
									try{ await i.reply({ content: 'Nice! You super hit ' + this.name + ' for 3% !', ephemeral: true }); }
									catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Miss Reminder Denied');}
									rows[0].components[rows[0].components.length - 1].setDisabled(true);
									if(damage < health) {
										try{await interactionMessage.edit({ embeds: [embed, combatEmbed], components: rows }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Boss Super Attack Edit'));}
										catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Attack Edit Denied - ' + String(err));}
									}
								}
							}
						} else if (stun.get(i.user.id) - Math.floor(Date.now() / 1000) > 0) {
							try{ await i.reply({ content: 'You can\'t attack for ' + (stun.get(i.user.id) - Math.floor(Date.now() / 1000)) + ' more seconds!', ephemeral: true }); }
							catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Miss Reminder Denied');}
						}
					} else {
						let x = users.size;
						if(x == 0) x = 1;
						let hit = 1 / x;
						if(i.customId === 'superhit') hit = 0.03 * health;
						if(!user_damage.has(i.user.id)) user_damage.set(i.user.id, hit);
						else user_damage.set(i.user.id, user_damage.get(i.user.id) + hit);

						damage += hit;
						if(damage >= health) {
							try { await i.deferUpdate(); }
							catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Ended Hit');}
							collector.stop();
						} else {
							// eslint-disable-next-line no-lonely-if
							if(i.customId.startsWith('hit')) {
								try { await i.deferUpdate(); }
								catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Hit Denied');}
							} else if(i.customId === 'superhit') {
								try{ await i.reply({ content: 'Nice! You super hit ' + this.name + ' for 3% !', ephemeral: true }); }
								catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Miss Reminder Denied');}
								rows[0].components[rows[0].components.length - 1].setDisabled(true);
								if(damage < health) {
									try{await interactionMessage.edit({ embeds: [embed, combatEmbed], components: rows }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Boss Super Attack Edit'));}
									catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Attack Edit Denied - ' + String(err));}
								}
							}
						}
					}
				} else if(i.customId.startsWith('miss')) {
					if(stun.has(i.user.id) && stun.get(i.user.id) - Math.floor(Date.now() / 1000) > 0) {
						try{ await i.reply({ content: 'You can\'t attack for ' + (stun.get(i.user.id) - Math.floor(Date.now() / 1000)) + ' more seconds!', ephemeral: true }); }
						catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Miss Reminder Denied');}
					} else {
						stun.set(i.user.id, Math.floor(Date.now() / 1000) + 4);
						setTimeout(() => stun.delete(i.user.id), 3000);
						user_miss.set(i.user.id, user_miss.get(i.user.id) + 1);
						try{ await i.reply({ content: 'You missed an attack and got knocked out for three seconds! You have to wait three seconds before you can attack again!', ephemeral: true }); }
						catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Miss Attacik Denied');}
					}
				} else if(i.customId.startsWith('mess')) {
					if (stunned.includes(i.user.id)) {
						try{ await i.reply({ content: 'You are knocked out from the last attack. Wait until the next attack to counter!', ephemeral: true }); }
						catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Miss Reminder Denied');}
					} else if(!cast_yes.includes(i.user.id) && !cast_no.includes(i.user.id)) {
						cast_no.push(i.user.id);
						user_miss.set(i.user.id, user_miss.get(i.user.id) + 1);
						try{ await i.reply({ content: 'You failed to counter and were left wide open for the attack! Brace yourself!', ephemeral: true }); }
						catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Miss Attacik Denied');}
					} else {
						try{ await i.reply({ content: 'You already tried countering! Wait for the next button swap to do another!', ephemeral: true }); }
						catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Miss Attacik Denied');}
					}

				} else if(i.customId.startsWith('counter')) {
					if (stunned.includes(i.user.id)) {
						try{ await i.reply({ content: 'You are knocked out from the last attack. Wait until the next attack to counter!', ephemeral: true }); }
						catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Miss Reminder Denied');}
					} else if(!cast_yes.includes(i.user.id) && !cast_no.includes(i.user.id)) {
						cast_yes.push(i.user.id);
						cast_name.push(i.user.username);
						// eslint-disable-next-line max-statements-per-line
						try{ await i.reply({ content: 'You successfully got into a counter stance! Chad will receive damage when he attacks! ', ephemeral: true }); }
						catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Miss Attacik Denied');}
					} else {
						try{ await i.reply({ content: 'You already tried countering! Wait for the next button swap to do another!', ephemeral: true }); }
						catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Miss Attacik Denied');}
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
						.setColor(client.colors[1][1])
						.setTitle(this.name + ' Left!')
						// eslint-disable-next-line spaced-comment
						//.setThumbnail(user.defaultAvatarURL)
						.setDescription('⠀\n**No one tried to stop ' + this.name + ' and claimed victory over the server!**\n⠀')
						.setFooter('Try to fight it next time!')
						.setImage();
					try{await interactionMessage.edit({ embeds: [end], components: [] }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Boss Empty Edit'));}
					catch{client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Edit Denied');}
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
						string = '*Rabbit Chad falls on his knees. He looks at his hands in his blurry vision, confused on how he was defeated by warriors that don\'t even match half his power. Seconds later he falls onto the ground.*\n\n' + user_damage.size + ' members participated in the battle!\n\n' + (user_damage.size == 1 ? 'Winner! - 3 Clusters' : (user_damage.size == 2 ? '1st - 3 Clusters\n2nd - 2 Clusters' : (user_damage.size == 3 ? '1st - 3 Clusters\n2nd - 2 Clusters\n3rd - 1 Cluster' : '1st - 4 Clusters\n2nd - 3 Clusters\n3rd - 2 Clusters\n4th and Below - 1 Cluster')));

						let limit = user_damage.size;
						if (limit > 10) limit = 10;

						for(let x = 0; x < limit; x++) {
							try { dmgString += ' ' + '[' + (x + 1).toString().padStart(2, '0') + ']' + '  |  ' + sortedDamage.get(arraySortedDamage[x]).toFixed(2).toString().padStart(5, '0') + ' / ' + user_miss.get(arraySortedDamage[x]).toString().padStart(3, '0') + '   | ' + members.get(arraySortedDamage[x].toString()).user.username.substring(0, 15) + '\n'; }
							catch { ; }
						}

						await rewarder(arraySortedDamage, message.guildId, client);

						dmgString += '```';
						const end = new MessageEmbed()
							.setColor(client.colors[1][0])
							.setTitle(this.name + ' is defeated!')
							// eslint-disable-next-line spaced-comment
							//.setThumbnail(user.defaultAvatarURL)
							.setDescription('⠀\n' + string + '\n⠀')
							.setFooter('Enjoy the glory!')
							.setImage();


						const dmgBoard = new MessageEmbed()
							.setColor(client.colors[1][1])
							.setTitle('Damage Leaderboard')
							// eslint-disable-next-line spaced-comment
							//.setThumbnail(user.defaultAvatarURL)
							.setDescription('⠀\n' + dmgString + '\n⠀')
							.setFooter('Enjoy the glory!')
							.setImage();


						const viewfilter = j => {
							if(interactionMessage != undefined) return j.message.id == interactionMessage.id;
						};

						if(viewfilter == undefined) {
							try{await interactionMessage.edit({ embeds: [end, dmgBoard], components: [] }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Boss Win 6 Edit'));}
							catch{client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Edit Denied');}
						}

						const button = new MessageActionRow()
							.addComponents(
								new MessageButton()
									.setCustomId('view')
									.setLabel('View your stats!')
									.setStyle('PRIMARY'),
							);

						try{await interactionMessage.edit({ embeds: [end, dmgBoard], components: [button] }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Boss Win 5 Edit'));}
						catch{client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Edit Denied');}

						const viewcollector = await channel.createMessageComponentCollector({ filter, time: 300000 });

						viewcollector.on('collect', async j => {
							if(j.customId === 'view') {
								if(!arraySortedDamage.includes(j.user.id)) {
									try{ await j.reply({ content: 'Looks like you weren\'t in this boss fight!', ephemeral: true }); }
									catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'View Denied');}
								} else {
									const r = arraySortedDamage.indexOf(j.user.id);

									try{ await j.reply({ content: 'You did ' + sortedDamage.get(arraySortedDamage[r]).toFixed(2).toString() + ' damage, missed ' + user_miss.get(arraySortedDamage[r]).toString() + ' times and were ranked #' + (r + 1), ephemeral: true }); }
									catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'View Denied - ' + err.toString());}
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
							try { dmgString += ' ' + '[' + (x + 1).toString().padStart(2, '0') + ']' + '  |  ' + sortedDamage.get(arraySortedDamage[x]).toFixed(2).toString().padStart(5, '0') + ' / ' + user_miss.get(arraySortedDamage[x]).toString().padStart(3, '0') + '   | ' + members.get(arraySortedDamage[x].toString()).user.username.substring(0, 15) + '\n'; }
							catch { ; }
						}

						dmgString += '```';

						const end = new MessageEmbed()
							.setColor(client.colors[1][0])
							.setTitle(this.name + ' defeated the server!')
							// eslint-disable-next-line spaced-comment
							//.setThumbnail(user.defaultAvatarURL)
							.setDescription('⠀\n**' + string + '\n⠀')
							.setFooter('Next time work together to defeat ' + this.name + '!')
							.setImage();


						const dmgBoard = new MessageEmbed()
							.setColor(client.colors[1][1])
							.setTitle('Damage Leaderboard')
							// eslint-disable-next-line spaced-comment
							//.setThumbnail(user.defaultAvatarURL)
							.setDescription('⠀\n' + dmgString + '\n⠀')
							.setFooter('Enjoy the glory!')
							.setImage();


						const viewfilter = j => {
							if(interactionMessage != undefined) return j.message.id == interactionMessage.id;
						};

						if(viewfilter == undefined) {
							try{await interactionMessage.edit({ embeds: [end, dmgBoard], components: [] }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Boss Defeated 6 Edit'));}
							catch{client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Edit Denied');}

						}

						const button = new MessageActionRow()
							.addComponents(
								new MessageButton()
									.setCustomId('view')
									.setLabel('View your stats!')
									.setStyle('PRIMARY'),
							);

						try{await interactionMessage.edit({ embeds: [end, dmgBoard], components: [button] }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Boss Defeated 5 Edit'));}
						catch{client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Edit Denied');}

						const viewcollector = await channel.createMessageComponentCollector({ filter, time: 300000 });

						viewcollector.on('collect', async j => {
							if(j.customId === 'view') {
								if(!arraySortedDamage.includes(j.user.id)) {
									try{ await j.reply({ content: 'Looks like you weren\'t in this boss fight!', ephemeral: true }); }
									catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'View Denied');}
								} else {
									const r = arraySortedDamage.indexOf(j.user.id);

									try{ await j.reply({ content: 'You did ' + sortedDamage.get(arraySortedDamage[r]).toFixed(2).toString() + ' damage, missed ' + user_miss.get(arraySortedDamage[r]).toString() + ' times and were ranked #' + (r + 1), ephemeral: true }); }
									catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'View Denied - ' + err.toString());}
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
			client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Edit Failed From No Cache');
		}

		let second = 0;


		while (damage < health && collector.ended == false) {
			if(phase == 1 && (100 - Math.floor((damage / health) * 100)) < 55) {
				second = 0;
				phase = 2;

				const time = endts - (Date.now() / 1000) + 6;

				collector.resetTimer({ time: (time + 15) * 1000 });

				embed = new MessageEmbed()
					.setColor(client.colors[0][0])
					.setTitle(this.name)
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription('"Perhaps you\'re not so bad after all! Now I\'m starting to have fun!"')
					.setImage(image_urls[0]);

				try{await interactionMessage.edit({ embeds: [embed], components: [] }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Boss Attack Edit'));}
				catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Attack Edit Denied - ' + String(err));}

				await client.extra.sleep(5000);

				embed = new MessageEmbed()
					.setColor(client.colors[0][0])
					.setTitle(this.name)
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription('"Let me reward you with my full power! Don\'t disappoint me!"')
					.setFooter('Get ready for the next phase!')
					.setImage(image_urls[1]);

				try{await interactionMessage.edit({ embeds: [embed], components: [] }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Boss Attack Edit'));}
				catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Attack Edit Denied - ' + String(err));}

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
					.setDescription(client.extra.getRandom(['I feel the fury in your strikes! Keep going!', 'Now this is a battle!', 'You aren\'t tired now are you?']))
					.setFooter({ text: '(Hint: 5 clicks per 5 seconds before it tells you to slow down!)' })
					.setImage(image_urls[1]);

				rows = rowReturn(1, client);

				try{await interactionMessage.edit({ embeds: [embed, combatEmbed], components: rows }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Boss Attack Edit'));}
				catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Attack Edit Denied - ' + String(err));}
			}
			else if(phase == 1) {

				await client.extra.sleep(1000);
				if(this.active == false) break;

				second++;

				if(damage < health && collector.ended == false) {
					if(second >= sec_limit) {
						const tracked = Array.from(users.keys());
						let string = '';
						sec_limit = 1;
						if(cast_yes.length > 0) string = cast_name.join(', ') + ' countered the attack and ' + this.name + ' took some damage!\n\n';

						cast_no = [];
						cast_name = [];
						cast_yes = [];
						second = 0;
						rows = rowReturn(0, client);

						embed = new MessageEmbed()
							.setColor(client.colors[0][2])
							.setTitle(this.name)
							// eslint-disable-next-line spaced-comment
							//.setThumbnail(user.defaultAvatarURL)
							.setDescription(client.extra.getRandom(['You call that an attack?', 'Ha! Not a bad strike!', 'Come on! I know you have more in you!']))
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
							.setDescription(string + this.name + ' attacks! **Counter** it!')
							.setFooter('You have 5 seconds to counter.');

						if(damage < health && collector.ended == false) {
							try{await interactionMessage.edit({ embeds: [embed, combatEmbed], components: rows }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Boss Attack Edit'));}
							catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Attack Edit Denied - ' + String(err));}
						}

						await client.extra.sleep(5000);

						stunned = [];

						const size = (users.size > 0 ? users.size : 1);

						if(cast_yes.length > 0) damage += (1 / size) * 3 * cast_yes.length;

						for(const user of cast_yes) {
							if(!user_damage.has(user)) user_damage.set(user, (1 / size) * 3);
							else user_damage.set(user, user_damage.get(user) + (1 / size) * 3);
						}

						for(const user of tracked) {
							if(cast_yes.includes(user) == false) stunned.push(user);
						}

						for(const user of cast_no) {
							stunned.push(user);
						}

						for(let [key, value] of users.entries()) {
							if(value < (Date.now() / 1000)) {
								users.delete(key);
							}
						}

					}
				} else {break;}
			} else if(phase == 2) {
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
						sec_limit = client.extra.random(5, 8);
						second = 0;
						rows = rowReturn(1, client);

						embed = new MessageEmbed()
							.setColor(client.colors[0][2])
							.setTitle(this.name)
							// eslint-disable-next-line spaced-comment
							//.setThumbnail(user.defaultAvatarURL)
							.setDescription(client.extra.getRandom(['I feel the fury in your strikes! Keep going!', 'Now this is a battle!', 'You aren\'t tired now are you?']))
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
							try{await interactionMessage.edit({ embeds: [embed, combatEmbed], components: rows }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Boss Attack Edit'));}
							catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Attack Edit Denied - ' + String(err));}
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
					.setDescription(client.extra.getRandom(['You call that an attack?', 'Ha! Not a bad strike!', 'Come on! I know you have more in you!']))
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
					.setDescription(this.name + ' preparing a barage of attacks!')
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

				try{await interactionMessage.edit({ embeds: [embed, combatEmbed], components: [] }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Boss Attack Edit'));}
				catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Attack Edit Denied - ' + String(err));}
			}

			if(damage > health) {
				collector.stop();
				break;
			}
		}
	},
};
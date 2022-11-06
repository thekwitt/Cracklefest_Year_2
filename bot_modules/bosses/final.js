/* eslint-disable prefer-const */
/* eslint-disable no-case-declarations */
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

async function rewarder(users, guildId, client) {
	await client.pool.query('UPDATE user_stats SET boss_spawned[4] = TRUE WHERE Guild_ID = $2 AND Member_ID = ANY($1);', [users, guildId]);
	await client.pool.query('UPDATE user_data SET Clusters = Clusters + 3, Arcane_Key = True WHERE Guild_ID = $2 AND Member_ID = ANY($1);', [users, guildId]);
}


function get_clock(timestamp, max) {

	const time = (1 - ((max - (timestamp - (Date.now() / 1000) - 10)) / max)) * 100;

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
	case 0: // Punch n deflect
		const target0 = client.extra.random(0, 4);
		const output0 = [];
		for(let j = 0; j < 2; j++) {
			const rows0 = new MessageActionRow();
			for(let i = 0; i < 2; i++) {
				if((j * 2) + i == target0) rows0.addComponents(new MessageButton().setCustomId('deflect').setLabel('Deflect!').setStyle('PRIMARY'));
				else rows0.addComponents(new MessageButton().setCustomId('mess' + (j * 2) + i).setLabel('⠀Miss!⠀').setStyle('SECONDARY'));
			}
			output0.push(rows0);
		}

		// if(client.extra.random(0, 100) > 95) rows.addComponents(new MessageButton().setCustomId('superhit').setLabel('Super Hit!').setStyle('PRIMARY'));
		return output0;

	case 1: // 10 Grid Battle
		const target1 = client.extra.random(0, 5);
		const rows1 = new MessageActionRow();
		for(let i = 0; i < 5; i++) {
			if(i == target1) rows1.addComponents(new MessageButton().setCustomId('hit').setLabel('Hit! ').setStyle('DANGER').setDisabled(disable));
			else if(i == 4 && client.extra.random(0, 100) > 90 && disable != true) rows1.addComponents(new MessageButton().setCustomId('superhit').setLabel('Super Hit!').setStyle('PRIMARY'));
			else rows1.addComponents(new MessageButton().setCustomId('miss' + i).setLabel('Miss!').setStyle('SECONDARY').setDisabled(disable));
		}

		return [rows1];

	case 2: // Finish
		const target2 = client.extra.random(0, 9);
		const output2 = [];
		for(let j = 0; j < 3; j++) {
			const rows2 = new MessageActionRow();
			for(let i = 0; i < 3; i++) {
				if((j * 3) + i == target2) rows2.addComponents(new MessageButton().setCustomId('hit').setLabel('Hit! ').setStyle('DANGER'));
				else rows2.addComponents(new MessageButton().setCustomId('miss' + (j * 3) + i).setLabel('Miss!').setStyle('SECONDARY'));
			}
			output2.push(rows2);
		}
		return output2;
	}
}

module.exports = {
	name: 'Crimson Wizard',
	async execute(message, client, channel_id, messageSpawn) {

		const data = await client.pool.query('SELECT * FROM guild_settings WHERE Guild_ID = $1', [message.guildId]);
		const setting = data.rows[0];
		const guildId = message.guildId;


		await client.pool.query('UPDATE guild_stats SET boss_spawned[4] = TRUE WHERE Guild_ID = $1', [message.guildId]);

		const health = [60, 95, 140, 165][setting.boss_difficulty];
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
		let cast_no = [];0
		let cast_name = [];
		const stun = new Map();
		let users = new Map();
		const user_damage = new Map();
		const user_miss = new Map();
		let damage = 0;
		let sec_limit = 5;

		const image_urls = ['https://cdn.discordapp.com/attachments/782835367085998080/958617814980263966/Wizard_Boss_1.png', 'https://cdn.discordapp.com/attachments/782835367085998080/958617817215815680/Wizard_Boss_2.png', 'https://cdn.discordapp.com/attachments/782835367085998080/958617816884445184/Wizard_Boss_3.png'];

		let combatEmbed = undefined;


		embed = new MessageEmbed()
			.setColor(client.colors[0][2])
			.setTitle('A boss has appeared!')
			// eslint-disable-next-line spaced-comment
			//.setThumbnail(user.defaultAvatarURL)
			.setDescription('"You have done well champions of ' + message.guild.name + '. You have defeated the best of the best that I have to offer."')
			.setImage('https://cdn.discordapp.com/attachments/782835367085998080/963229004402409502/void.png');

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

		await client.extra.sleep(7000);

		embed = new MessageEmbed()
			.setColor(client.colors[0][1])
			.setImage(image_urls[0]);

		const title = new MessageEmbed()
			.setColor('#ff003c')
			.setTitle(this.name)
			.setAuthor('Essence of Chaos and Destruction');


		try{await interactionMessage.edit({ embeds: [title, embed] }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Expired Edit'));}
		catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Edit Denied - ' + String(err));}

		await client.extra.sleep(5000);

		embed = new MessageEmbed()
			.setColor(client.colors[0][2])
			.setTitle(this.name)
			// eslint-disable-next-line spaced-comment
			//.setThumbnail(user.defaultAvatarURL)
			.setDescription('"But this ends now. I will have complete control over the conoras and their precious eggs!"')
			.setImage(image_urls[0]);

		try{await interactionMessage.edit({ embeds: [embed], components: [] }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Expired Edit'));}
		catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Edit Denied - ' + String(err));}

		await client.extra.sleep(7000);

		embed = new MessageEmbed()
			.setColor(client.colors[0][2])
			.setTitle(this.name)
			// eslint-disable-next-line spaced-comment
			//.setThumbnail(user.defaultAvatarURL)
			.setDescription('"But let us have a little fun first. See if you can survive this!"')
			.setImage(image_urls[0])
			.setFooter({ text: 'Chuck an egg from your basket to do extra damage as an ambush!' });


		try{await interactionMessage.edit({ embeds: [embed], components: ambushRow }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Expired Edit'));}
		catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Edit Denied - ' + String(err));}

		let endts = (Date.now() / 1000) + 180;
		const collector = await channel.createMessageComponentCollector({ filter, time: 1000 * 180 });

		collector.on('collect', async i => {

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

							let hit = (phase == 2 ? 2 : 1) / x;

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
						let hit = (phase == 2 ? 2 : 1) / x;
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
						try{ await i.reply({ content: 'You are knocked out from the last attack. Wait until the next attack to deflect!', ephemeral: true }); }
						catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Miss Reminder Denied');}
					} else if(!cast_yes.includes(i.user.id) && !cast_no.includes(i.user.id)) {
						cast_no.push(i.user.id);
						user_miss.set(i.user.id, user_miss.get(i.user.id) + 1);
						try{ await i.reply({ content: 'You failed to deflect and were left wide open for the attack! Brace yourself!', ephemeral: true }); }
						catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Miss Attacik Denied');}
					} else {
						try{ await i.reply({ content: 'You already tried deflecting! Wait for the next button swap to do another!', ephemeral: true }); }
						catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Miss Attacik Denied');}
					}

				} else if(i.customId.startsWith('deflect')) {
					if (stunned.includes(i.user.id)) {
						try{ await i.reply({ content: 'You are knocked out from the last attack. Wait until the next attack to deflect!', ephemeral: true }); }
						catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Miss Reminder Denied');}
					} else if(!cast_yes.includes(i.user.id) && !cast_no.includes(i.user.id)) {
						cast_yes.push(i.user.id);
						cast_name.push(i.user.username);
						// eslint-disable-next-line max-statements-per-line
						try{ await i.reply({ content: 'You get ready to deflect the incoming magic!', ephemeral: true }); }
						catch {client.extra.log_error_g(client.logger, message.guild, 'Boss Event', 'Miss Attacik Denied');}
					} else {
						try{ await i.reply({ content: 'You already tried deflecting! Wait for the next button swap to do another!', ephemeral: true }); }
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
						.setColor(client.colors[0][1])
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
						embed = new MessageEmbed()
							.setColor(client.colors[0][2])
							.setTitle('Something is happening..')
							// eslint-disable-next-line spaced-comment
							//.setThumbnail(user.defaultAvatarURL)
							.setDescription('**"NOOOO THIISS CANN\'TT BEEEE..."**\n\n*As the wizard grasped it\'s last breath of air, he disappears into the arcane void before it closes for good. Though he left behind something.. strange.\n\nIt appears to be some sort of key to the arcane void.. who knows what secrets lie in that realm.*');

						try{await interactionMessage.edit({ embeds: [embed], components: [] }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Expired Edit'));}
						catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Edit Denied - ' + String(err));}

						await client.extra.sleep(20000);

						let dmgString = '```css\n[Rank] | {.Dmg / Miss.} | Degen\n==========================================\n';
						string = '**Everyone who participated gets 3 clusters and an arcane key that grants hunting access to The Arcane Void!**';

						let limit = user_damage.size;
						if (limit > 10) limit = 10;

						for(let x = 0; x < limit; x++) {
							try { dmgString += ' ' + '[' + (x + 1).toString().padStart(2, '0') + ']' + '  |  ' + sortedDamage.get(arraySortedDamage[x]).toFixed(2).toString().padStart(5, '0') + ' / ' + user_miss.get(arraySortedDamage[x]).toString().padStart(3, '0') + '   | ' + members.get(arraySortedDamage[x].toString()).user.username.substring(0, 15) + '\n'; }
							catch { ; }
						}

						await rewarder(arraySortedDamage, message.guildId, client);

						dmgString += '```';
						const end = new MessageEmbed()
							.setColor(client.colors[0][1])
							.setTitle(this.name + ' is defeated!')
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
							.setColor(client.colors[0][1])
							.setTitle(this.name + ' defeated the server!')
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
		let cast = 1;

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
					.setDescription('"Not half bad! I believe it is time to get serious!"')
					.setImage(image_urls[0]);

				try{await interactionMessage.edit({ embeds: [embed], components: [] }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Boss Attack Edit'));}
				catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Attack Edit Denied - ' + String(err));}

				await client.extra.sleep(5000);

				embed = new MessageEmbed()
					.setColor(client.colors[0][0])
					.setTitle(this.name)
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription('"Come heroes! I await your resilience against the inevitable!"')
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
						{ name: 'Time', value: get_clock(endts, 180), inline: true },
					)
					.setDescription('Press the **Hit!** button to attack ' + this.name + '!')
					.setFooter('Next Button Swap is in ' + sec_limit + ' seconds.');

				embed = new MessageEmbed()
					.setColor(client.colors[0][2])
					.setTitle(this.name)
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription(client.extra.getRandom(['Can you keep up?', 'I was over there! Now I\'m over here!', 'Too slow mortal!']))
					.setFooter({ text: '(Hint: 5 clicks per 5 seconds before it tells you to slow down!)' })
					.setImage(image_urls[1]);

				rows = rowReturn(1, client);

				try{await interactionMessage.edit({ embeds: [embed, combatEmbed], components: rows }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Boss Attack Edit'));}
				catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Attack Edit Denied - ' + String(err));}
			} if(phase == 2 && (100 - Math.floor((damage / health) * 100)) < 20) {
				second = 0;
				phase = 3;

				const time = endts - (Date.now() / 1000) + 6;

				collector.resetTimer({ time: (time + 15) * 1000 });

				embed = new MessageEmbed()
					.setColor(client.colors[0][0])
					.setTitle(this.name)
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription('"Argh! You think you\'ve won?!\n\nI̸ ̶a̶m̸ ̴a̶ ̸g̷o̶d̴!̴ \n\nTh̶e̷ ̵e̸m̸b̵o̷d̷i̷m̸e̵n̶t̴ ̴o̸f̵ ̸a̸r̴c̷a̸n̸e̸ ̵e̵n̶e̵r̵g̶y̵!̵\n\nT̶̫̥̅̆h̸͉̖̃̅̇ḙ̶̑̕͝ ̵̧̛̈́̍c̴̠͚̿̊̌ỏ̴̡͉͎̍͊ŕ̸͙̳̟͘r̷̜̦͖̐ǔ̵̫ͅp̶̻̃͝ṱ̸͆i̵̙̘̾̀͋͜ò̵̗̼n̸͎̳̿͒͘ ̵̲̑o̷̙̐f̸̧̘̈́́͒ ̶̻̈́a̵̪̿̀̏l̷̝̹̪̕l̴͈͚̅ ̵͍̾̿̂l̷̞͆̿͝i̶͎̞̽̎̑v̵̜̀̿̋i̴͓̙̯̍̏n̵̼̐g̸̢̟̩͂́ ̴̗͉́͝ọ̷͎͔͂̃͝r̷̙̈̽g̵̼͒͌̈́a̷̻̎n̶̡̨̔i̴̦̲̮͌̽͒s̶̳̞͖̓̈́m̶̺̠͑s̶̙̔!̵̼̜̾̾̽"')
					.setImage(image_urls[1]);

				try{await interactionMessage.edit({ embeds: [embed], components: [] }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Boss Attack Edit'));}
				catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Attack Edit Denied - ' + String(err));}

				await client.extra.sleep(8000);

				embed = new MessageEmbed()
					.setColor(client.colors[0][0])
					.setTitle(this.name)
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription('"T̶͓̫́̃̈ḣ̶̰̰̘̅̚ì̸̤̞̒ͅs̷̢̭͆̕͜ ̴̠̓i̶̫͌͜s̷̙̩̀̍͘ ̸̠̇m̴̱̪̿͋̕ỵ̷̘̤̌̕ ̶͎͓̀̀p̸͎̑l̶̮̤͐̚a̵̬̒̋n̵͓̹̕è̷̳̝͑͌ͅ ̴̧̮̻̽͘o̷̥̟̮͋f̶̝͚̹͑̀ ̴͕͓̜͝e̴̫̟̮̓̍x̷̨̢̟͗̇̾i̷̤̐͠s̴̽̌ͅt̵͖͎͆͋͒ȩ̷̱͌̆͗ͅn̴͎̂̚c̴͔̯̐e̷̜̳̔͗͝!̸̡̦͖̓ ̵͔͑͒̊\n\nF̵͓̥̝͗̾͝e̶̮͋̃ë̷̜́̒ļ̷̻̈́̓ ̴͓̾ṯ̷̢̼̈̾h̷͕̦̮͛́͌e̴̯͆̆͘ ̵̯̩͒̄́d̵̠̋́͊ͅä̴̝̱́r̶̦͓͕̉̏̀k̵͓̦̒n̸͖̊̓͗ẻ̴͙͙s̶̻̈́̌̍s̷͚͍̒͘͝ ̴̧͗̀c̸̝͊ŏ̶͖̮̞͆ņ̷̋ŝ̷̭̪ų̵͇̪͋̀̌m̶̛̖̺̈́̒ȩ̶̭̈́͝ ̶̣͎̠̊̉̐ỹ̴̧̯͋o̷̢͎͐ứ̴͈̺́ ̴͕̲́̇̎ấ̶̝́͜ͅl̵̬̜̔ľ̴̡̳̉̍!̵͔̊"')
					.setFooter('The final phase has begun! Get ready!')
					.setImage(image_urls[2]);

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
						{ name: 'Time', value: get_clock(endts, 180), inline: true },
					)
					.setDescription('Press the **Hit!** button to attack ' + this.name + '!')
					.setFooter('Next Button Swap is in ' + sec_limit + ' seconds.');

				embed = new MessageEmbed()
					.setColor(client.colors[0][2])
					.setTitle(this.name)
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription(client.extra.getRandom(['G̶̖͉̠̑̂́ĭ̵͓̈́̒͜v̵̨͙͋͜ẹ̵̃͊̚ ̴̝̉i̴͇͒͌ͅn̸͚̜̍ ̷̺̩͊t̸̲̠̯͂ṍ̴͇̜ ̶͉͙͓͆̌̈m̶̪̈́͠ỵ̴̱̈́ͅ ̴̛͔w̵̪͊o̴̙͍̓̓r̴͇͙̓́ḱ̴̻̝̋̽', 'R̷̹̟̄͌͒ê̷͎̓s̷̪̉̀͘ī̷̗͎ṧ̷͈̖͝ť̵͍͔̀ẻ̸͍̣̓̐ͅņ̷̛̩̇̚c̸̛̦͓̓́e̷͓̻̳͗͒̕ ̵̨̣̼͒i̸̢̗͋͗̐s̵͍͝ ̶̛͙̗̈́̃f̴̤̞̾a̶̙͛̕į̷̠̼̐l̸̟͖̓̾͘ǘ̸̖̙ŗ̴͙̭͂͠e̷̬̪̙͒', 'T̷̨͇͙͆h̵͓̤̓́̈ẻ̵͚̬ͅ ̸̢̹̭͋l̵͔̂ǐ̷̲̻ğ̶̮̋h̶̨̙͍̊͝t̸̘͕́͐ ̶̦͙̄͂í̷̠̲̖̑̈s̷̟̮̅̀ ̶̟̈́̕c̶͌̈́ͅo̶̧͆̿̿͜n̸̯̣̫̓s̴̱͇̣͝ų̵̼̕m̸̢̮̈͂e̷̮͖͐̃d̶̜̝̘̐͑ ̴̰̓̽b̶̲́ͅy̸̤̩̞̏ ̸̳͔͘ͅm̵̨̛̱̥̓̃y̸̯̒͊ ̸͖̜̩́̇̕p̸̝̰̑͗͝r̷͓̃̓ͅe̴̼͇̿s̸̩͖̋e̵̜̜̯̊̾̕ñ̵̖̣c̸͓̪̱̍e̵̹̼͌̈́͝']))
					.setFooter({ text: '(Hint: 5 clicks per 5 seconds before it tells you to slow down!)' })
					.setImage(image_urls[2]);

				rows = rowReturn(2, client);

				try{await interactionMessage.edit({ embeds: [embed, combatEmbed], components: rows }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Boss Attack Edit'));}
				catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Attack Edit Denied - ' + String(err));}
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
						const tracked = Array.from(users.keys());
						let string = '';
						sec_limit = 1;
						if(cast_yes.length > 0) string = cast_name.join(', ') + ' deflected the attack and ' + this.name + ' took some damage!\n\n';

						cast_no = [];
						cast_name = [];
						cast_yes = [];
						second = 0;
						rows = rowReturn(0, client);
						combatEmbed = new MessageEmbed()
							.setColor(client.colors[0][1])
							.setTitle('Action Belt')
							// eslint-disable-next-line spaced-comment
							//.setThumbnail(user.defaultAvatarURL)
							.addFields(
								{ name: 'Health', value: (100 - Math.floor((damage / health) * 100)) + '% remaining', inline: true },
								{ name: 'Time', value: get_clock(endts, 180), inline: true },
							)
							.setDescription(string + 'Magic rans from the sky! **Deflect** it to ' + this.name + '!')
							.setFooter('You have 5 seconds to deflect.');

						if(damage < health && collector.ended == false) {
							try{await interactionMessage.edit({ embeds: [embed, combatEmbed], components: rows }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Boss Attack Edit'));}
							catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Attack Edit Denied - ' + String(err));}
						}

						await client.extra.sleep(5000);

						stunned = [];

						const size = (users.size > 0 ? users.size : 1);

						if(cast_yes.length > 0) damage += (1 / size) * 5 * cast_yes.length;

						for(const user of cast_yes) {
							if(!user_damage.has(user)) user_damage.set(user, (1 / size) * 5);
							else user_damage.set(user, user_damage.get(user) + (1 / size) * 5);
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
					embed.setDescription(client.extra.getRandom(['Can you keep up?', 'I was over there! Now I\'m over here!', 'Too slow mortal!']));
					if(second >= sec_limit && cast < 1) {
						sec_limit = client.extra.random(6, 8);
						second = 0;
						cast = 1;
						rows = rowReturn(1, client);
						combatEmbed = new MessageEmbed()
							.setColor(client.colors[0][1])
							.setTitle('Action Belt')
							// eslint-disable-next-line spaced-comment
							//.setThumbnail(user.defaultAvatarURL)
							.addFields(
								{ name: 'Health', value: (100 - Math.floor((damage / health) * 100)) + '% remaining', inline: true },
								{ name: 'Time', value: get_clock(endts, 180), inline: true },
							)
							.setDescription('Press the **Hit!** button to attack ' + this.name + '!')
							.setFooter('Next Button Swap is in ' + sec_limit + ' seconds.');

						if(damage < health && collector.ended == false) {
							try{await interactionMessage.edit({ embeds: [embed, combatEmbed], components: rows }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Boss Attack Edit'));}
							catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Attack Edit Denied - ' + String(err));}
						}
					} else if(second >= sec_limit && cast >= 1) {
						cast = 0;
						cast_no = [];
						cast_name = [];
						cast_yes = [];
						second = 0;
						rows = rowReturn(1, client, true);
						combatEmbed = new MessageEmbed()
							.setColor('#848884')
							.setTitle('Action Belt')
							// eslint-disable-next-line spaced-comment
							//.setThumbnail(user.defaultAvatarURL)
							.addFields(
								{ name: 'Health', value: (100 - Math.floor((damage / health) * 100)) + '% remaining', inline: true },
								{ name: 'Time', value: get_clock(endts, 180), inline: true },
							)
							.setDescription(this.name + ' vanished! You can\'t attack it until it appears again!')
							.setFooter('You have 5 seconds to attack again.');

						if(damage < health && collector.ended == false) {
							try{await interactionMessage.edit({ embeds: [embed, combatEmbed], components: rows }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Boss Attack Edit'));}
							catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Attack Edit Denied - ' + String(err));}
						}

						await client.extra.sleep(5000);

						rows = rowReturn(1, client);

						combatEmbed = new MessageEmbed()
							.setColor(client.colors[0][1])
							.setTitle('Action Belt')
							// eslint-disable-next-line spaced-comment
							//.setThumbnail(user.defaultAvatarURL)
							.addFields(
								{ name: 'Health', value: (100 - Math.floor((damage / health) * 100)) + '% remaining', inline: true },
								{ name: 'Time', value: get_clock(endts, 180), inline: true },
							)
							.setDescription(this.name + ' appeared again! Give it all you got!')
							.setFooter('Next Button Swap is in ' + sec_limit + ' seconds.');
						cast = 1;
						if(damage < health && collector.ended == false) {
							try{await interactionMessage.edit({ embeds: [embed, combatEmbed], components: rows }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Boss Attack Edit'));}
							catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Attack Edit Denied - ' + String(err));}
						}
					}
				} else {break;}
			} else if(phase == 3) {
				await client.extra.sleep(1000);

				if(this.active == false) break;

				second++;
				for(let [key, value] of users.entries()) {
					if(value < (Date.now() / 1000)) {
						users.delete(key);
					}
				}

				if(damage < health && collector.ended == false) {
					embed.setDescription(client.extra.getRandom(['G̶̖͉̠̑̂́ĭ̵͓̈́̒͜v̵̨͙͋͜ẹ̵̃͊̚ ̴̝̉i̴͇͒͌ͅn̸͚̜̍ ̷̺̩͊t̸̲̠̯͂ṍ̴͇̜ ̶͉͙͓͆̌̈m̶̪̈́͠ỵ̴̱̈́ͅ ̴̛͔w̵̪͊o̴̙͍̓̓r̴͇͙̓́ḱ̴̻̝̋̽', 'R̷̹̟̄͌͒ê̷͎̓s̷̪̉̀͘ī̷̗͎ṧ̷͈̖͝ť̵͍͔̀ẻ̸͍̣̓̐ͅņ̷̛̩̇̚c̸̛̦͓̓́e̷͓̻̳͗͒̕ ̵̨̣̼͒i̸̢̗͋͗̐s̵͍͝ ̶̛͙̗̈́̃f̴̤̞̾a̶̙͛̕į̷̠̼̐l̸̟͖̓̾͘ǘ̸̖̙ŗ̴͙̭͂͠e̷̬̪̙͒', 'T̷̨͇͙͆h̵͓̤̓́̈ẻ̵͚̬ͅ ̸̢̹̭͋l̵͔̂ǐ̷̲̻ğ̶̮̋h̶̨̙͍̊͝t̸̘͕́͐ ̶̦͙̄͂í̷̠̲̖̑̈s̷̟̮̅̀ ̶̟̈́̕c̶͌̈́ͅo̶̧͆̿̿͜n̸̯̣̫̓s̴̱͇̣͝ų̵̼̕m̸̢̮̈͂e̷̮͖͐̃d̶̜̝̘̐͑ ̴̰̓̽b̶̲́ͅy̸̤̩̞̏ ̸̳͔͘ͅm̵̨̛̱̥̓̃y̸̯̒͊ ̸͖̜̩́̇̕p̸̝̰̑͗͝r̷͓̃̓ͅe̴̼͇̿s̸̩͖̋e̵̜̜̯̊̾̕ñ̵̖̣c̸͓̪̱̍e̵̹̼͌̈́͝']))
					if(second >= sec_limit) {
						sec_limit = client.extra.random(4, 7);
						second = 0;
						rows = rowReturn(2, client);
						combatEmbed = new MessageEmbed()
							.setColor(client.colors[0][1])
							.setTitle('Action Belt')
							// eslint-disable-next-line spaced-comment
							//.setThumbnail(user.defaultAvatarURL)
							.addFields(
								{ name: 'Health', value: (100 - Math.floor((damage / health) * 100)) + '% remaining', inline: true },
								{ name: 'Time', value: get_clock(endts, 180), inline: true },
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
				endts = (Date.now() / 1000) + 180;
				collector.resetTimer({ time: 180 * 1000 });

				embed = new MessageEmbed()
					.setColor(client.colors[0][2])
					.setTitle(this.name)
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription(client.extra.getRandom(['*The hellfire will eat you alive mortal!*']))
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
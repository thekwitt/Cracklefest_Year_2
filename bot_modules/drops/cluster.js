const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

const eggs = ['<:10003:820185236825964564>', '<:10004:820185236825440286>', '<:10005:820185236817313812>', '<:10006:820185236797259786>', '<:10001:820185236926496788>', '<:10010:820185236767113247>', '<:10011:820185236595671111>', '<:10009:820185236767375380>', '<:10008:820185236784152586>', '<:10007:820185236796735508>'];
const avatars = ['https://cdn.discordapp.com/attachments/782835367085998080/950951908720381953/Green.png', 'https://cdn.discordapp.com/attachments/782835367085998080/950951911010492456/Yellow.png', 'https://cdn.discordapp.com/attachments/782835367085998080/950951907944443924/Blue.png', 'https://cdn.discordapp.com/attachments/782835367085998080/950951910561697822/White.png', 'https://cdn.discordapp.com/attachments/782835367085998080/950951909286625341/Pink.png', 'https://cdn.discordapp.com/attachments/782835367085998080/950951909722828800/Purple.png', 'https://cdn.discordapp.com/attachments/782835367085998080/950951908456144936/Gold.png', 'https://cdn.discordapp.com/attachments/782835367085998080/950951908955291718/Orange.png', 'https://cdn.discordapp.com/attachments/782835367085998080/950951910125502494/Red.png', 'https://cdn.discordapp.com/attachments/782835367085998080/950951907390803998/Black.png'];

function rowReturn(client, disable, index) {

	if(disable == undefined) disable = false;

	const filtered_eggs = eggs.filter(e => e != eggs[index]);
	const max = client.extra.random(3, 6);
	const win = client.extra.random(0, max);

	const rows1 = new MessageActionRow();
	for(let i = 0; i < max; i++) {
		if(i != win) {
			rows1.addComponents(new MessageButton().setCustomId('egg' + i).setEmoji(client.extra.getRandom(filtered_eggs)).setStyle('SECONDARY').setDisabled(disable));
		} else {
			rows1.addComponents(new MessageButton().setCustomId('win').setEmoji(eggs[index]).setStyle('SECONDARY').setDisabled(disable));
		}
	}

	return [rows1];
}

module.exports = {
	async execute(message, client, channel_id, messageSpawn) {
		const ids = [];

		const data = await client.pool.query('SELECT * FROM guild_settings WHERE Guild_ID = $1', [message.guildId]);
		const setting = data.rows[0];

		const rand = client.extra.random(0, 10);

		let embed = new MessageEmbed()
			.setColor(client.colors[0][1])
			.setTitle('🥚   An egg cluster suddenly appeared!   🥚')
		// eslint-disable-next-line spaced-comment
		//.setThumbnail(user.defaultAvatarURL)
			.setThumbnail(avatars[rand])
			.setDescription('⠀\n**Take a look at the egg on the top right!\n\nThe buttons will appear on the bottom in five seconds for you to press that has that specific egg on it!**\n⠀')
			.setFooter({ text: 'You only have one chance to collect this egg cluster!' })
			.setImage('https://cdn.discordapp.com/attachments/782835367085998080/950989936880939058/Artboard_1.png');

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

		await client.extra.sleep(5000);

		embed.setDescription('Press the button with the correct egg!\n\n(Check the top right and match it!)');

		const row = rowReturn(client, false, rand);

		try{await interactionMessage.edit({ embeds: [embed], components: row }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Expired Edit'));}
		catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Edit Denied - ' + String(err));}

		const filter = i => {
			if(interactionMessage != undefined) return i.message.id == interactionMessage.id;
		};

		if(filter == undefined) {
			messageSpawn.set('messageCount', setting.drop_message_count).set('timestamp', Math.floor(Date.now() / 1000) + setting.drop_time_count).set('activeMessage', false);
			return client.messages.set(message.guildId, messageSpawn);
		}

		const wins = [];

		const loses = [];

		const collector = await channel.createMessageComponentCollector({ filter, time: setting.drop_duration * 1000, maxUsers: setting.drop_obtain_count });
		collector.on('collect', async i => {
			await client.pool.query('INSERT INTO user_data (Guild_ID, Member_ID) VALUES ($1, $2) ON CONFLICT DO NOTHING;', [message.guildId, message.author.id]);

			await client.extra.sleep(50);

			if (ids.includes(i.user.id)) {
				try{await i.reply({ content: 'You already tried to get an egg cluster!', ephemeral: true }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Already egg cluster Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Reply Denied - ' + String(err));}
			}
			else if (collector.users.size > setting.drop_obtain_count) {
				try{await i.reply({ content: 'Oh no! You were too late! Someone grabbed the last egg cluster.', ephemeral: true }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Too Late egg cluster Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Reply Denied - ' + String(err));}
			}
			else if (i.customId === 'win') {
				ids.push(i.user.id);
				wins.push(i.user.username);
				await client.pool.query('UPDATE user_data SET Clusters = Clusters + 1 WHERE Guild_ID = $2 AND Member_ID = $1;', [i.user.id, message.guildId]);
				await client.pool.query('UPDATE user_stats SET Clusters_Collected = Clusters_Collected + 1 WHERE Guild_ID = $2 AND Member_ID = $1;', [i.user.id, message.guildId]);
				// eslint-disable-next-line max-statements-per-line
				embed = new MessageEmbed()
					.setColor(client.colors[0][1])
					.setTitle('Very Nice! You snagged an egg cluster!')
				// eslint-disable-next-line spaced-comment
				//.setThumbnail(user.defaultAvatarURL)
					.setDescription('⠀\nNice! You got an egg cluster! You can crack it open by giving it to an eggsmith! Cool eggs from any area you have access to could be in it!\n⠀')
					.setFooter({ text: 'Crack it open with /uncluster!' });
				try{await i.reply({ embeds: [embed], ephemeral: true }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', i.user.username + ' - egg cluster Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Got Reply Denied - ' + String(err));}

			} else {
				ids.push(i.user.id);
				loses.push(i.user.username);

				const data_u = await client.pool.query('SELECT * FROM user_data WHERE member_id = $1 AND Guild_ID = $2;', [i.user.id, message.guildId]);
				const user_bag = data_u.rows[0];

				let amount = client.extra.random(1, 6);

				if(amount > user_bag.basket_eggs.length) amount = user_bag.basket_eggs.length;

				if(amount == user_bag.basket_eggs.length) user_bag.basket_eggs = Array(0);
				else user_bag.basket_eggs = client.extra.shuffle(user_bag.basket_eggs).slice(0, user_bag.basket_eggs.length - amount);

				await client.pool.query('UPDATE user_data SET basket_eggs = $1 WHERE Guild_ID = $3 AND Member_ID = $2;', [user_bag.basket_eggs, i.user.id, message.guildId]);

				embed = new MessageEmbed()
					.setColor(client.colors[0][1])
					.setTitle('Oh no! You picked the wrong egg!')
				// eslint-disable-next-line spaced-comment
				//.setThumbnail(user.defaultAvatarURL)
					.setDescription('⠀\n**You accidentally tripped while grabbing the cluster!**\n⠀')
					.setFooter({ text: 'Make sure to pay attention on the next drop!' });
				try{await i.reply({ embeds: [embed], ephemeral: true }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'egg cluster Failed Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Miss Reply Denied - ' + String(err));}
			}

		});
		// eslint-disable-next-line no-unused-vars
		try {
			// eslint-disable-next-line no-unused-vars
			collector.on('end', async i => {
				await client.extra.sleep(100);
				let print_users = '';
				if(wins.length != 0) print_users += wins.join(', ') + ' got an egg cluster! Look at them go!' + '\n\n';
				if(loses.length != 0) print_users += loses.join(', ') + ' guessed wrong! Oh no what have they done!' + '\n\n';

				if(wins.length == 0 && loses.length == 0) print_users = '\n\n';

				if(collector.users.size < setting.drop_obtain_count) {
					const strings = ['**The egg cluster morphed into the ground**'];
					embed = new MessageEmbed()
						.setColor(client.colors[0][1])
						.setTitle('The egg cluster vanished!')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
						.setDescription('⠀\n' + client.extra.getRandom(strings) + '\n\n' + print_users + '**Keep on talking for another one to appear!**\n⠀')
						.setFooter('Each drop only lasts ' + setting.drop_duration + ' seconds!');
					try{await interactionMessage.edit({ embeds: [embed], components: [] }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Expired Edit'));}
					catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Edit Denied - ' + String(err));}
				}
				else {
					embed = new MessageEmbed()
						.setColor(client.colors[0][1])
						.setTitle('Everyone took all the egg clusters! Holy Cow!')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
						.setDescription('⠀\n' + print_users + '**Keep on talking for another one to appear!**\n⠀')
						.setFooter('Each drop only lasts ' + setting.drop_duration + ' seconds!');
					try{await interactionMessage.edit({ embeds: [embed], components: [] }).then(client.extra.log_g(client.logger, message.guild, 'Message Create Event', 'Empty Edit'));}
					catch (err) {client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Edit Denied - ' + String(err));}
				}
				client.extra.reloadMessageDrop(message.guild, client);
			});
		} catch {
			client.extra.reloadMessageDrop(message.guild, client);
			client.extra.log_error_g(client.logger, message.guild, 'Message Create Event', 'Edit Failed From No Cache');
		}
	},
};
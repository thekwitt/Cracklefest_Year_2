const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

// eslint-disable-next-line no-unused-vars
function duplicates(arr, id) {
	let count = 0;
	for(let i = 0; i < arr.length; i++)
	{
		if (arr[i] === id) count++;
	}
	return count;
}

module.exports = {
	name: 'eggdex',
	description: 'See what egg\'s you\'ve collected before!!',
	data: new SlashCommandBuilder()
		.setName('eggdex')
		.setDescription('See what egg\'s you\'ve collected before!')
		.addUserOption(option => option.setName('target').setDescription('The bag of that user.')),
	// eslint-disable-next-line no-unused-vars
	async execute(interaction, client) {
		let user = interaction.user;
		const target = interaction.options.getUser('target');
		if (target && !target.bot)
		{
			user = target;
			await client.pool.query('INSERT INTO user_data (Guild_ID, Member_ID) VALUES ($1, $2) ON CONFLICT DO NOTHING;', [interaction.guildId, interaction.user.id]);
		}
		else if (target && target.bot) {
			try{return await interaction.reply(target.username + ' is a bot. It doesn\'t like candy.').then(client.extra.log_g(client.logger, interaction.guild, 'Bag Command', 'Duplicate Reply'));}
			catch{client.extra.log_error_g(client.logger, interaction.guild, 'Bag Command', 'Reply Denied');}
		}

		const user_id = user.id;

		const data_u = await client.pool.query('SELECT * FROM user_data WHERE member_id = $1 AND Guild_ID = $2;', [user_id, interaction.guildId]);
		const u = data_u.rows[0];
		const user_bag = u.eggdex;
		const length = user_bag.length;
		try{if(user_bag.length == 0) return await interaction.reply({ content: 'You have no eggs! Go hunt using **/hunt** or break some of your egg clusters with **/uncluster**!', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, 'Bag Command', 'Empty Reply'));}
		catch{client.extra.log_error_g(client.logger, interaction.guild, 'Bag Command', 'Reply Denied');}

		const data = [...new Set(user_bag)].sort();
		let page = 0;

		const titles = ['General Eggs', 'The Cottontail Valley', 'The Oracle Streams', 'The Hulking Fields', 'The Harewing Jungle', 'The Ethereal Gardens', 'The Crimson Grove', 'The Arcane Void'];
		const reg_types = [['Skull'], ['Solid', 'Triangle', 'Castle', 'Unique', 'Coney'], ['Waves', 'ZigZag', 'Water', 'Mix 1', 'Oracle'], ['Food', 'Melted', 'Cream', 'Hulking'], ['Dotted', 'Swirl', 'Diamonds', 'Woodlands'], ['Cow', 'Zebra', 'Tiger', 'Reptile', 'Giraffe', 'Flowers', 'Ethereal'], ['Glass', 'Hexigons', 'Clouds', 'Stars', 'Crimson'], ['Void', 'Spell', 'Fury']];


		const max_page = titles.length - 1;
		let string = '⠀\n';
		let count = 0;

		const eggs = [...client.extra.eggs.regular_eggs, ...client.extra.eggs.collectible_eggs];

		let embed = new MessageEmbed()
			.setColor(client.colors[0][0])
			.setTitle('🥚  ' + titles[page] + '  🥚')
			// eslint-disable-next-line spaced-comment
			//.setThumbnail(user.defaultAvatarURL)
			.setFooter({ text: 'Page ' + (page + 1) + '/' + (max_page + 1) + ' | Use Arrows to switch pages/rank' });

		for(let j = 0; j < reg_types[page].length; j++) {
			let array_eggs = [];
			const temp_eggs = eggs.filter(e => e.type == reg_types[page][j]);
			count = 0;
			for(const egg of temp_eggs) {
				count++;
				if(data.includes(Number(egg.id)) == true) {
					array_eggs.push(egg.emoji);
				} else { array_eggs.push('<:emptyegg:951721836251611137>'); }
				if(count > 20) {
					count = 0;
					embed.addField(reg_types[page][j].replace('Coney', 'Rare').replace('Oracle', 'Rare').replace('Hulking', 'Rare').replace('Woodlands', 'Rare').replace('Ethereal', 'Rare').replace('Crimson', 'Rare') + ' Eggs', array_eggs.join('  ') + '\n⠀');
					array_eggs = [];
				}
			}
			embed.addField(reg_types[page][j].replace('Coney', 'Rare').replace('Oracle', 'Rare').replace('Hulking', 'Rare').replace('Woodlands', 'Rare').replace('Ethereal', 'Rare').replace('Crimson', 'Rare') + ' Eggs', array_eggs.join('  ') + '\n⠀');
		}


		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('Left')
					.setLabel('⬅️')
					.setStyle('PRIMARY'),
			)
			.addComponents(
				new MessageButton()
					.setCustomId('Right')
					.setLabel('➡️')
					.setStyle('PRIMARY'),
			);

		try{await interaction.reply({ embeds: [embed], components: [row] }).then(client.extra.log_g(client.logger, interaction.guild, 'Bag Command', 'Duplicate Reply'));}
		catch(e) {client.extra.log_error_g(client.logger, interaction.guild, 'Bag Command', String(e) + ' Reply Denied');}
		let reply = undefined;
		try{ reply = await interaction.fetchReply().then(client.extra.log_g(client.logger, interaction.guild, 'Bag Command', 'Fetch Reply')).catch(client.extra.log_error_g(client.logger, interaction.guild, 'Bag Command', 'Fetch Reply Denied')); }
		catch{client.extra.log_error_g(client.logger, interaction.guild, 'Bag Command', 'Fetch Reply Denied');}
		if(reply == undefined) return ;
		const filter = f => {
			return f.user.id == interaction.user.id && f.message.id == reply.id;
		};
		const collector = interaction.channel.createMessageComponentCollector({ filter, time: 120000 });
		collector.on('collect', async f => {
			if(f.customId === 'Left') {
				if(page != 0) {
					page--;

					embed = new MessageEmbed()
						.setColor(client.colors[0][0])
						.setTitle('🥚  ' + titles[page] + '  🥚')
						// eslint-disable-next-line spaced-comment
						//.setThumbnail(user.defaultAvatarURL)
						.setFooter({ text: 'Page ' + (page + 1) + '/' + (max_page + 1) + ' | Use Arrows to switch pages/rank' });

					string = '⠀\n';
					for(let j = 0; j < reg_types[page].length; j++) {
						let array_eggs = [];
						const temp_eggs = eggs.filter(e => e.type == reg_types[page][j]);
						count = 0;
						for(const egg of temp_eggs) {
							count++;
							if(data.includes(Number(egg.id)) == true) {
								array_eggs.push(egg.emoji);
							} else { array_eggs.push('<:emptyegg:951721836251611137>'); }
							if(count > 20) {
								count = 0;
								embed.addField(reg_types[page][j].replace('Coney', 'Rare').replace('Oracle', 'Rare').replace('Hulking', 'Rare').replace('Woodlands', 'Rare').replace('Ethereal', 'Rare').replace('Crimson', 'Rare') + ' Eggs' , array_eggs.join('  ') + '\n⠀');
								array_eggs = [];
							}
						}
						embed.addField(reg_types[page][j].replace('Coney', 'Rare').replace('Oracle', 'Rare').replace('Hulking', 'Rare').replace('Woodlands', 'Rare').replace('Ethereal', 'Rare').replace('Crimson', 'Rare') + ' Eggs', array_eggs.join('  ') + '\n⠀');
					}

					try{await f.update({ embeds: [embed], components: [row] }).then(client.extra.log_g(client.logger, interaction.guild, 'Bag Command', 'Update Reply'));}
					catch{client.extra.log_error_g(client.logger, interaction.guild, 'Bag Command', 'Update Edit Denied');}
				} else {
					try{await f.reply({ content: 'You are already on the first page!', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, 'Bag Command', 'First Page Bag Reply'));}
					catch(e) {client.extra.log_error_g(client.logger, interaction.guild, 'Bag Command', String(e) + 'Reply Denied'); }
				}

			} else if(f.customId === 'Right') {
				if(page != max_page) {
					page++;

					embed = new MessageEmbed()
						.setColor(client.colors[0][0])
						.setTitle('🥚  ' + titles[page] + '  🥚')
						// eslint-disable-next-line spaced-comment
						//.setThumbnail(user.defaultAvatarURL)
						.setFooter({ text: 'Page ' + (page + 1) + '/' + (max_page + 1) + ' | Use Arrows to switch pages/rank' });

					string = '⠀\n';
					for(let j = 0; j < reg_types[page].length; j++) {
						let array_eggs = [];
						const temp_eggs = eggs.filter(e => e.type == reg_types[page][j]);
						count = 0;
						for(const egg of temp_eggs) {
							count++;
							if(data.includes(Number(egg.id)) == true) {
								array_eggs.push(egg.emoji);
							} else { array_eggs.push('<:emptyegg:951721836251611137>'); }
							if(count > 20) {
								count = 0;
								embed.addField(reg_types[page][j].replace('Coney', 'Rare').replace('Oracle', 'Rare').replace('Hulking', 'Rare').replace('Woodlands', 'Rare').replace('Ethereal', 'Rare').replace('Crimson', 'Rare') + ' Eggs', array_eggs.join('  ') + '\n⠀');
								array_eggs = [];
							}
						}
						embed.addField(reg_types[page][j].replace('Coney', 'Rare').replace('Oracle', 'Rare').replace('Hulking', 'Rare').replace('Woodlands', 'Rare').replace('Ethereal', 'Rare').replace('Crimson', 'Rare') + ' Eggs', array_eggs.join('  ') + '\n⠀');
					}
					try{await f.update({ embeds: [embed], components: [row] }).then(client.extra.log_g(client.logger, interaction.guild, 'Bag Command', 'Update Reply'));}
					catch{client.extra.log_error_g(client.logger, interaction.guild, 'Bag Command', 'Update Edit Denied');}
				} else {
					try{await f.reply({ content: 'You are already on the last page!', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, 'Bag Command', 'Last Page Bag Reply'));}
					catch{client.extra.log_error_g(client.logger, interaction.guild, 'Bag Command', 'Reply Denied'); }
				}
			}
		});
		collector.on('end', async () => {
			const finished_row = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId('Left')
						.setLabel('⬅️')
						.setStyle('PRIMARY')
						.setDisabled(true),
				)
				.addComponents(
					new MessageButton()
						.setCustomId('Right')
						.setLabel('➡️')
						.setStyle('PRIMARY')
						.setDisabled(true),
				);
			try{await reply.edit({ embed: embed, components: [finished_row] }).then(client.extra.log_g(client.logger, interaction.guild, 'Bag Command', 'End Bag Reply'));}
			catch{client.extra.log_error_g(client.logger, interaction.guild, 'Bag Command', 'Edit Denied');}
		});
	},
};
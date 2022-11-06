const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'hunt',
	cdid: 0,
	description: 'Search an area to gather eggs from!',
	data: new SlashCommandBuilder()
		.setName('hunt')
		.setDescription('Search an area to gather eggs from!')
		.addStringOption(option => option.setName('location').setDescription('Where do you want to hunt for more eggs?').setRequired(true)
			.addChoice('The Cottontail Valley', '1')
			.addChoice('The Oracle Streams', '2')
			.addChoice('The Hulking Fields', '3')
			.addChoice('The Harewing Jungle', '4')
			.addChoice('The Ethereal Gardens', '5')
			.addChoice('The Crimson Grove', '6')
			.addChoice('The Arcane Void', '7')),
	async execute(interaction, client) {

		const data = await client.pool.query('SELECT * FROM guild_settings WHERE Guild_ID = $1', [interaction.guildId]);
		const setting = data.rows[0];

		const guildId = interaction.guildId;

		const indexLoc = Number(interaction.options.getString('location')) - 1;

		const data_u = await client.pool.query('SELECT * FROM user_data WHERE member_id = $1 AND Guild_ID = $2;', [interaction.user.id, guildId]);
		const user = data_u.rows[0];

		if(indexLoc == 6 && user.arcane_key == false) {
			interaction.reset_cooldown = true;
			try{return await interaction.reply({ content: 'You are trying to access an area that doesn\'t exist.. seems like you are missing something that\'ll show you the truth.', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'No Clusters Warning Reply'));}
			catch (err) {client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied');}
		} else if(user.basket_eggs.length + 5 > client.extra.eggCapacity(user.basket_level)) {
			interaction.reset_cooldown = true;
			try{return await interaction.reply({ content: 'You don\'t have enough room for anymore eggs! Sell some eggs by using **/sell** to keep hunting!', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'No Clusters Warning Reply'));}
			catch (err) {client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied');}
		}

		let rand = Number(client.extra.random(2 + Math.floor(user.basket_level / 10), 5 + Number(Math.floor(user.basket_level / 5)) * (setting.hunt_multiplier / 100)));

		if(user.basket_eggs.length + rand > client.extra.eggCapacity(user.basket_level)) rand = client.extra.eggCapacity(user.basket_level) - user.basket_eggs.length;

		const titles = ['The Cottontail Valley', 'The Oracle Streams', 'The Hulking Fields', 'The Harewing Jungle', 'The Ethereal Gardens', 'The Crimson Grove', 'The Arcane Void'];
		const reg_types = [['Solid', 'Triangle', 'Castle', 'Unique'], ['Waves', 'ZigZag', 'Water', 'Mix 1'], ['Food', 'Melted', 'Cream', 'Hive'], ['Dotted', 'Swirl', 'Diamonds'], ['Cow', 'Zebra', 'Tiger', 'Reptile', 'Giraffe', 'Flowers'], ['Glass', 'Hexigons', 'Clouds', 'Stars'], ['Void', 'Spell', 'Fury']];
		const rare_types = ['Coney', 'Oracle', 'Hulking', 'Woodlands', 'Ethereal', 'Crimson'];
		const dialogues = [client.extra.dialogues.coney, client.extra.dialogues.oracle, client.extra.dialogues.hulking, client.extra.dialogues.woodlands, client.extra.dialogues.ethereal, client.extra.dialogues.crimson, client.extra.dialogues.void];

		if(client.extra.eggLevelRestrictions[indexLoc] > user.basket_level) {
			interaction.reset_cooldown = true;
			try{return await interaction.reply({ content: 'Your level is not high enough for exploring **' + titles[indexLoc] + '**! You are **level ' + user.basket_level + '** while the area requires you to be **level ' + client.extra.eggLevelRestrictions[indexLoc] + '**!\n\nKeep collecting eggs and sell them to level up!', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'No Clusters Warning Reply'));}
			catch (err) {client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied');}
		}

		const temp = [];
		const temp_col = [];
		const temp_old = [];
		const dex = [];


		for(let i = 0; i < rand; i++) {
			if(client.extra.random(0, 101) > setting.rare_egg_percentage_multiplier || indexLoc == 6) {
				let egg = client.extra.getRandom(client.extra.eggs.regular_eggs.filter(e => reg_types[indexLoc].includes(e.type)));
				const r = client.extra.random(0, 101);
				if(r > 95 && user.arcane_key == true) {
					egg = client.extra.getRandom(client.extra.eggs.regular_eggs.filter(e => ['Skull'].includes(e.type)));
				}
				dex.push(egg);
				temp.push(egg);
			} else {
				const egg = client.extra.getRandom(client.extra.eggs.collectible_eggs.filter(e => rare_types[indexLoc] === e.type));
				if(user.collection_eggs.includes(Number(egg.id)) || temp_col.map(e => e.id).includes(egg.id)) temp_old.push(egg);
				else temp_col.push(egg);
				dex.push(egg);
			}
		}

		const count = temp.length;

		let embed = new MessageEmbed()
			.setColor(client.colors[0][1])
			.setTitle('🥚   ' + interaction.user.username + ' is exploring the ' + titles[indexLoc] + '!   🥚')
			// eslint-disable-next-line spaced-comment
			//.setThumbnail(user.defaultAvatarURL)
			.setDescription('⠀\n*' + client.extra.getRandom(dialogues[indexLoc].prologue).replaceAll('[User]', interaction.user.username).replaceAll('[Egg]', 'eggs').replaceAll('[Pro]', 'they').replaceAll('[Pro1]', 'them').replaceAll('[Pro2]', 'their') + '*\n⠀')
			.setFooter({ text: client.extra.getRandom(['They have a good feeling about this exploration!', 'Nothing can stop them this time!', 'They smell a collectible egg!']) });

		try { await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'First Step Reply')); }
		catch (err) {
			client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ', 'Reply Denied - ' + String(err));
			interaction.failed = true;
		}

		await client.extra.sleep(5000);

		embed = new MessageEmbed()
			.setColor(client.colors[0][2])
			.setTitle('🥚   ' + interaction.user.username + ' explored ' + titles[indexLoc] + '!   🥚')
			// eslint-disable-next-line spaced-comment
			//.setThumbnail(user.defaultAvatarURL)
			.setDescription('⠀\n*' + client.extra.getRandom(dialogues[indexLoc].dialogue).replaceAll('[User]', interaction.user.username).replaceAll('[Egg]', 'eggs').replaceAll('[Pro]', 'they').replaceAll('[Pro1]', 'them').replaceAll('[Pro2]', 'their') + '*\n\n__**Here are the eggs they collected!**__\n\n•.¸¸.•´¨•.¸¸.•´¨•.¸¸.•´¨•.¸¸.•´¨•.¸¸.•´¨•.¸¸.•´¨•.¸¸.•\n⠀')
			.setFooter({ text: 'Check them out with /basket!' });

		if(temp.length != 0) {
			await client.pool.query('UPDATE user_data SET basket_eggs = array_cat(basket_eggs, $1) WHERE Guild_ID = $3 AND Member_ID = $2;', [temp.map(e => e.id), interaction.user.id, guildId]);
			embed.addField('Eggs Collected\n⠀', (temp.length > 20 ? temp.slice(0, 20).map(e => e.emoji).join(' ') + '\n\n**Plus ' + (count - 20) + ' more!**' : temp.map(e => e.emoji).join(' ')) + '\n⠀');
		}

		if(temp_old.length != 0) {
			await client.pool.query('UPDATE user_data SET basket_eggs = array_cat(basket_eggs, $1) WHERE Guild_ID = $3 AND Member_ID = $2;', [temp_old.map(e => e.id), interaction.user.id, guildId]);
			embed.addField('Rare Collected\n⠀', (temp_old.length > 20 ? temp_old.slice(0, 20).map(e => e.emoji).join(' ') + '\n\n**Plus ' + (count - 20) + ' more!**' : temp_old.map(e => e.emoji).join(' ')) + '\n⠀');
		}

		if(temp_col.length != 0 && indexLoc < 6) {
			await client.pool.query('UPDATE user_data SET collection_eggs = uniq(array_cat(collection_eggs, $1)) WHERE Guild_ID = $3 AND Member_ID = $2;', [temp_col.map(e => e.id), interaction.user.id, guildId]);
			embed.addField('NEW Rare Eggs Collected\n⠀', (temp_col.length > 20 ? temp_col.slice(0, 20).map(e => e.emoji).join(' ') + '\n\n**Plus ' + (count - 20) + ' more!**' : temp_col.map(e => e.emoji).join(' ')) + '\n⠀');
		}

		await client.pool.query('UPDATE user_data SET eggdex = uniq(array_cat(eggdex, $1)) WHERE Guild_ID = $3 AND Member_ID = $2;', [dex.map(e => e.id), interaction.user.id, guildId]);

		await client.pool.query('UPDATE user_stats SET Eggs_Collected = Eggs_Collected + $1 WHERE Guild_ID = $3 AND Member_ID = $2;', [rand, interaction.user.id, guildId]);
		await client.pool.query('UPDATE guild_stats SET Eggs_Collected = Eggs_Collected + $1 WHERE Guild_ID = $2;', [rand, guildId]);
		try { return await interaction.editReply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'First Step Reply')); }
		catch (err) {
			client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ', 'Reply Denied - ' + String(err));
			interaction.failed = true;
		}
	},
};
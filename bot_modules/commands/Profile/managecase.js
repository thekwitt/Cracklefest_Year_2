const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

// eslint-disable-next-line no-unused-vars

module.exports = {
	name: 'managecase',
	description: 'Manage your display case!',
	data: new SlashCommandBuilder()
		.setName('managecase')
		.setDescription('Manage your display case!')
		.addStringOption(option => option.setName('operation').setDescription('What would you like to do?').setRequired(true)
			.addChoice('Add to case', 'in')
			.addChoice('Remove from case', 'out'))
		.addIntegerOption(option => option.setName('id').setDescription('The ID of the Egg (Click/Tap emoji for egg id)').setRequired(true)),
	// eslint-disable-next-line no-unused-vars
	async execute(interaction, client) {
		const id = interaction.options.getInteger('id');
		const operation = interaction.options.getString('operation');

		const data_u = await client.pool.query('SELECT * FROM user_data WHERE member_id = $1 AND Guild_ID = $2;', [interaction.user.id, interaction.guildId]);
		const u = data_u.rows[0];
		const user_bag = u.basket_eggs;
		const user_case = u.case_eggs;

		const data_b = [...new Set(user_bag)].sort();
		const data_c = user_case;

		const premium = await client.extra.getPremium(interaction, client);
		const max = (premium == true ? 30 : 20);

		if(operation == 'in') {
			if(data_c.length > max) {
				try{return await interaction.reply('Looks like your display case is full! Remove an egg to add another.').then(client.extra.log_g(client.logger, interaction.guild, 'Bag Command', 'Duplicate Reply'));}
				catch{client.extra.log_error_g(client.logger, interaction.guild, 'Bag Command', 'Reply Denied');}
			}

			if(data_b.includes(id) == false) {
				try{return await interaction.reply('Looks like you don\'t have an egg with the id of ' + id + '. Check out your **/basket** to see what eggs you have!').then(client.extra.log_g(client.logger, interaction.guild, 'Bag Command', 'Duplicate Reply'));}
				catch{client.extra.log_error_g(client.logger, interaction.guild, 'Bag Command', 'Reply Denied');}
			}
			client.extra.removeElementArray(user_bag, id);
			await client.pool.query('UPDATE user_data SET case_eggs = array_append(case_eggs, $1), basket_eggs = $4 WHERE Guild_ID = $3 AND Member_ID = $2;', [id, interaction.user.id, interaction.guildId, user_bag ]);
 
			const list = [...client.extra.eggs.regular_eggs, ...client.extra.eggs.collectible_eggs];
			const egg = list.filter(candy => candy.id == id)[0];

			const embed = new MessageEmbed()
				.setColor(client.colors[0][2])
				.setTitle('🥚  An Egg has been added to ' + interaction.user.username + '\'s Display Case!  🥚')
				// eslint-disable-next-line spaced-comment
				//.setThumbnail(user.defaultAvatarURL)
				.setDescription('⠀\n [' + egg.emoji + '] has been added to the display case!\n⠀')
				.setFooter('Check it out with /case!');

			try{await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, 'Bag Command', 'Duplicate Reply'));}
			catch{client.extra.log_error_g(client.logger, interaction.guild, 'Bag Command', 'Reply Denied');}

		} else if(operation == 'out') {
			if(data_c.length < 0) {
				try{return await interaction.reply('Looks like your display case is empty! Add an egg to remove another.').then(client.extra.log_g(client.logger, interaction.guild, 'Bag Command', 'Duplicate Reply'));}
				catch{client.extra.log_error_g(client.logger, interaction.guild, 'Bag Command', 'Reply Denied');}
			}

			if(data_b.length >= client.extra.eggCapacity(u.basket_level)) {
				try{return await interaction.reply('Looks like your basket is full! Sell some eggs before you can remove an egg from your display case!').then(client.extra.log_g(client.logger, interaction.guild, 'Bag Command', 'Duplicate Reply'));}
				catch{client.extra.log_error_g(client.logger, interaction.guild, 'Bag Command', 'Reply Denied');}
			}


			if(data_c.includes(id) == false) {
				try{return await interaction.reply('Looks like you don\'t have an egg with the id of ' + id + ' in your display case. Check out your **/case** to see what you have!').then(client.extra.log_g(client.logger, interaction.guild, 'Bag Command', 'Duplicate Reply'));}
				catch{client.extra.log_error_g(client.logger, interaction.guild, 'Bag Command', 'Reply Denied');}
			}

			client.extra.removeElementArray(user_case, id);
			await client.pool.query('UPDATE user_data SET basket_eggs = array_append(basket_eggs, $1), case_eggs = $4 WHERE Guild_ID = $3 AND Member_ID = $2;', [id, interaction.user.id, interaction.guildId, user_case]);
 
			const list = [...client.extra.eggs.regular_eggs, ...client.extra.eggs.collectible_eggs];
			const egg = list.filter(candy => candy.id == id)[0];

			const embed = new MessageEmbed()
				.setColor(client.colors[0][2])
				.setTitle('🥚  An Egg has been removed from ' + interaction.user.username + '\'s Display Case!  🥚')
				// eslint-disable-next-line spaced-comment
				//.setThumbnail(user.defaultAvatarURL)
				.setDescription('⠀\n [' + egg.emoji + '] has been removed from the display case!\n⠀')
				.setFooter('Check it out with /case!');

			try{await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, 'Bag Command', 'Duplicate Reply'));}
			catch{client.extra.log_error_g(client.logger, interaction.guild, 'Bag Command', 'Reply Denied');}

		}


	},
};
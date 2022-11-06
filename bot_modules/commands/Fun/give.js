const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { user } = require('pg/lib/defaults');

// eslint-disable-next-line no-unused-vars

module.exports = {
	name: 'give',
	description: 'Give an egg to someone!',
	data: new SlashCommandBuilder()
		.setName('give')
		.setDescription('Give an egg to someone!')
		.addUserOption(option => option.setName('target').setDescription('The card of that user.').setRequired(true))
		.addIntegerOption(option => option.setName('id').setDescription('The ID of the Egg (Click/Tap emoji for egg id)').setRequired(true)),
	// eslint-disable-next-line no-unused-vars
	async execute(interaction, client) {
		const id = interaction.options.getInteger('id');
		const target = interaction.options.getUser('target');

		const data = await client.pool.query('SELECT * FROM guild_settings WHERE Guild_ID = $1', [interaction.guildId]);
		const setting = data.rows[0];

		if(setting.enable_giving == false) {
			try{return await interaction.reply('Looks like gifting was disabled.').then(client.extra.log_g(client.logger, interaction.guild, 'Bag Command', 'Duplicate Reply'));}
			catch{client.extra.log_error_g(client.logger, interaction.guild, 'Bag Command', 'Reply Denied');}
		}

		if (target != undefined) {
			await client.pool.query('INSERT INTO user_data (Guild_ID, Member_ID) VALUES ($1, $2) ON CONFLICT DO NOTHING;', [interaction.guildId, target.id]);
			await client.pool.query('INSERT INTO user_stats (Guild_ID, Member_ID) VALUES ($1, $2) ON CONFLICT DO NOTHING;', [interaction.guildId, target.id]);
		}

		const data_u = await client.pool.query('SELECT * FROM user_data WHERE member_id = $1 AND Guild_ID = $2;', [interaction.user.id, interaction.guildId]);
		const u = data_u.rows[0];

		const data_t = await client.pool.query('SELECT * FROM user_data WHERE member_id = $1 AND Guild_ID = $2;', [target.id, interaction.guildId]);
		const t = data_t.rows[0];

		const user_bag = u.basket_eggs;

		const data_b = [...new Set(user_bag)].sort();

		if(data_b.includes(id) == false) {
			try{return await interaction.reply({ content: 'Looks like you don\'t have an egg with the id of ' + id + '. Check out your **/basket** to see what eggs you have!', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, 'Bag Command', 'Duplicate Reply'));}
			catch{client.extra.log_error_g(client.logger, interaction.guild, 'Bag Command', 'Reply Denied');}
		}


		if(t.basket_eggs.length >= client.extra.eggCapacity(t.basket_level)) {
			try{return await interaction.reply('Looks like their basket is full! They can\'t receive anything until they sell some eggs!').then(client.extra.log_g(client.logger, interaction.guild, 'Bag Command', 'Duplicate Reply'));}
			catch{client.extra.log_error_g(client.logger, interaction.guild, 'Bag Command', 'Reply Denied');}
		}

		client.extra.removeElementArray(user_bag, id);

		await client.pool.query('UPDATE user_data SET basket_eggs = $1 WHERE Guild_ID = $3 AND Member_ID = $2;', [user_bag, interaction.user.id, interaction.guildId]);

		if(target.id != interaction.user.id) {
			await client.pool.query('UPDATE user_data SET basket_eggs = array_append(basket_eggs, $1)WHERE Guild_ID = $3 AND Member_ID = $2;', [id, target.id, interaction.guildId]);

			const list = [...client.extra.eggs.regular_eggs, ...client.extra.eggs.collectible_eggs];
			const egg = list.filter(candy => candy.id == id)[0];

			const embed = new MessageEmbed()
				.setColor(client.colors[0][2])
				.setTitle('🥚  An Egg has been given to ' + target.username + '!  🥚')
				// eslint-disable-next-line spaced-comment
				//.setThumbnail(user.defaultAvatarURL)
				.setDescription('⠀\n [' + egg.emoji + '] has been added their basket!\n⠀')
				.setFooter('Check it out with /basket');

			try{await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, 'Bag Command', 'Duplicate Reply'));}
			catch{client.extra.log_error_g(client.logger, interaction.guild, 'Bag Command', 'Reply Denied');}
		} else {
			const embed = new MessageEmbed()
				.setColor(client.colors[0][2])
				.setTitle('🥚  ' + interaction.user.username + ' did something dumb!  🥚')
				// eslint-disable-next-line spaced-comment
				//.setThumbnail(user.defaultAvatarURL)
				.setDescription('⠀\nThey tried to give their egg to their imaginary friend but it turned out the imaginary friend was a thief and ran off with the egg.\n⠀')
				.setFooter('They lose the egg!');

			try{await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, 'Bag Command', 'Duplicate Reply'));}
			catch{client.extra.log_error_g(client.logger, interaction.guild, 'Bag Command', 'Reply Denied');}
		}
	},
};
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'lottery',
	description: 'Gamble your coins in the lottery!!',
	cooldown: 60,
	data: new SlashCommandBuilder()
		.setName('lottery')
		.setDescription('Add clusters to someone\'s inventory!')
		.addSubcommand(subcommand =>
			subcommand
				.setName('rare_egg')
				.setDescription('Roll a dice and get the number under the amount of coins spent!')
				.addIntegerOption(option => option.setName('amount').setDescription('How many coins? (1 - 10)').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('coins')
				.setDescription('Gamble your coins to double or triple your ammount')
				.addIntegerOption(option => option.setName('amount').setDescription('How many coins? (1 - 100)').setRequired(true))),
	async execute(interaction, client) {
		const guildId = interaction.guildId;
		const amount = interaction.options.getInteger('amount');
		const subcommand = interaction.options.getSubcommand('subcommand');

		const data_u = await client.pool.query('SELECT * FROM user_data WHERE member_id = $1 AND Guild_ID = $2;', [interaction.user.id, guildId]);
		const user = data_u.rows[0];

		if(subcommand == 'rare_egg') {
			if(amount > 10 || amount < 1) {
				interaction.reset_cooldown = true;
				try{return await interaction.reply({ content: 'That amount of coins is out of range! Please spend only 1 - 10 coins!', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'No Eggs Warning Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied');}
			} else if(user.gold_coins < amount) {
				interaction.reset_cooldown = true;
				try{return await interaction.reply({ content: 'You don\'t have enough coins! You can only spend **' + user.gold_coins + ' coins or less**!', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'No Eggs Warning Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied');}
			}

			const rand = client.extra.random(0, 10);

			let embed = new MessageEmbed()
				.setColor(client.colors[0][0])
				.setTitle(interaction.user.username + ' is rolling the dice!');

			try { await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'First Step Reply')); }
			catch (err) { client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied'); }

			await client.extra.sleep(5000);

			if(rand <= amount) {

				const rare_types = ['Coney', 'Oracle', 'Hulking', 'Woodlands', 'Ethereal', 'Crimson'];

				const egg = client.extra.getRandom(client.extra.eggs.collectible_eggs.filter(e => rare_types.includes(e.type)));
				if(!user.collection_eggs.includes(Number(egg.id))) await client.pool.query('UPDATE user_data SET collection_eggs = array_append(collection_eggs, $1), gold_coins = gold_coins - $4 WHERE Guild_ID = $3 AND Member_ID = $2;', [egg.id, interaction.user.id, guildId, amount]);
				else await client.pool.query('UPDATE user_data SET basket_eggs = array_append(basket_eggs, $1), gold_coins = gold_coins - $4 WHERE Guild_ID = $3 AND Member_ID = $2;', [egg.id, interaction.user.id, guildId, amount]);

				embed = new MessageEmbed()
					.setColor(client.colors[0][2])
					.setTitle('They won a rare egg!')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription('⠀\nThey have received a ' + (!user.collection_eggs.includes(Number(egg.id)) ? ' NEW ' : '') + ' [' + egg.emoji + ']\n⠀')
					.setFooter({ text: 'Check them out with ' + (!user.collection_eggs.includes(Number(egg.id)) ? '/collection' : '/basket') + '!' });

				try { await interaction.editReply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'First Step Reply')); }
				catch (err) { client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied'); }

				return;
			} else {
				await client.pool.query('UPDATE user_data SET gold_coins = gold_coins - $1 WHERE Guild_ID = $3 AND Member_ID = $2;', [amount, interaction.user.id, guildId]);
				embed = new MessageEmbed()
					.setColor(client.colors[0][2])
					.setTitle('They lost!')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription('⠀\nThey lost ' + amount + ' coins! They rolled a **' + rand + '** which is higher than **' + amount + '**!\n⠀')
					.setFooter({ text: 'Go ahead and try again!' });

				try { return await interaction.editReply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'First Step Reply')); }
				catch (err) { client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied'); }
			}
		} else if(subcommand == 'coins') {
			if(amount > 100 || amount < 1) {
				interaction.reset_cooldown = true;
				try{return await interaction.reply({ content: 'That amount of coins is out of range! Please spend only 1 - 100 coins!', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'No Eggs Warning Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied');}
			} else if(user.gold_coins < amount) {
				interaction.reset_cooldown = true;
				try{return await interaction.reply({ content: 'You don\'t have enough coins! You can only spend **' + user.gold_coins + ' coins or less**!', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'No Eggs Warning Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied');}
			}

			const rand = client.extra.random(0, 101);

			if(rand < 60) {
				await client.pool.query('UPDATE user_data SET gold_coins = gold_coins - $1 WHERE Guild_ID = $3 AND Member_ID = $2;', [amount, interaction.user.id, guildId]);
				const embed = new MessageEmbed()
					.setColor(client.colors[0][2])
					.setTitle('⠀     ⠀⠀🔥    L  O  S  E  R    🔥⠀⠀  ⠀')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription('⠀\n```    YOU LOST ' + client.extra.zfill(amount, 3) + ' COINS\n' + client.extra.getRandom(client.extra.lot_cards[0]) + '\n```⠀')
					.setFooter({ text: '' });

				try { return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'First Step Reply')); }
				catch (err) { client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied'); }
			} else if(rand < 85) {
				await client.pool.query('UPDATE user_data SET gold_coins = gold_coins + $1 WHERE Guild_ID = $3 AND Member_ID = $2;', [amount, interaction.user.id, guildId]);
				const embed = new MessageEmbed()
					.setColor(client.colors[0][2])
					.setTitle('⠀⠀⠀  ⠀💰    W  I  N  N  E  R    💰⠀⠀  ⠀⠀')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription('⠀\n```     YOU WON ' + client.extra.zfill(amount, 3) + ' COINS\n' + client.extra.getRandom(client.extra.lot_cards[1]) + '\n```⠀')
					.setFooter({ text: '' });

				try { return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'First Step Reply')); }
				catch (err) { client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied'); }
			} else if(rand < 95) {
				await client.pool.query('UPDATE user_data SET gold_coins = gold_coins + $1 WHERE Guild_ID = $3 AND Member_ID = $2;', [amount * 2, interaction.user.id, guildId]);
				const embed = new MessageEmbed()
					.setColor(client.colors[0][2])
					.setTitle('⠀⠀  ⠀💰    M  E  G  A     W  I  N  N  E  R    💰⠀⠀  ⠀')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription('⠀\n```     YOU WON ' + client.extra.zfill(amount * 2, 3) + ' COINS\n' + client.extra.getRandom(client.extra.lot_cards[1]) + '\n```⠀')
					.setFooter({ text: '' });

				try { return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'First Step Reply')); }
				catch (err) { client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied'); }
			} else if(rand >= 95) {
				await client.pool.query('UPDATE user_data SET gold_coins = gold_coins + $1 WHERE Guild_ID = $3 AND Member_ID = $2;', [amount * 3, interaction.user.id, guildId]);
				const embed = new MessageEmbed()
					.setColor(client.colors[0][2])
					.setTitle('⠀⠀  ⠀💰    U  L  T  R  A     W  I  N  N  E  R    💰⠀⠀  ⠀')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription('⠀\n```     YOU WON ' + client.extra.zfill(amount * 3, 3) + ' COINS\n' + client.extra.getRandom(client.extra.lot_cards[1]) + '\n```⠀')
					.setFooter({ text: '' });

				try { return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'First Step Reply')); }
				catch (err) { client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied'); }
			}

		}
	},
};
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'sell',
	description: 'Sell 10 eggs for one coin!',
	data: new SlashCommandBuilder()
		.setName('sell')
		.setDescription('Sell 10 eggs for one coin!')
		.addIntegerOption(option => option.setName('amount').setDescription('How many eggs do you want to sell? (Multiples of 10) (Optional)')),
	async execute(interaction, client) {
		const guildId = interaction.guildId;

		const data_u = await client.pool.query('SELECT * FROM user_data WHERE member_id = $1 AND Guild_ID = $2;', [interaction.user.id, guildId]);
		const user = data_u.rows[0];
		let amount = interaction.options.getInteger('amount');

		if(user.basket_eggs.length < 10)
		{
			interaction.reset_cooldown = true;
			try{return await interaction.reply({ content: 'You don\'t have enough eggs to sell! Get more eggs to sell for a coin. You need a total of 10 eggs per coin.', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'No Eggs Warning Reply'));}
			catch (err) {client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied');}
		}


		if(amount == undefined) { amount = user.basket_eggs.length; }
		else if(amount < 0) {
			interaction.reset_cooldown = true;
			try{return await interaction.reply({ content: 'You can\'t sell 0 eggs.', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'No Eggs Warning Reply'));}
			catch (err) {client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied');}
		}
		else if(amount > user.basket_eggs.length) { amount = user.basket_eggs.length; }

		const multiples = Math.floor(amount / 10);

		user.basket_eggs = client.extra.shuffle(user.basket_eggs).slice(0, user.basket_eggs.length - 10 * multiples);

		await client.pool.query('UPDATE user_data SET basket_eggs = $1, gold_coins = gold_coins + $4 WHERE Guild_ID = $3 AND Member_ID = $2;', [user.basket_eggs, interaction.user.id, guildId, multiples]);

		const embed = new MessageEmbed()
			.setColor(client.colors[0][2])
			.setTitle(interaction.user.username + ' just sold ' + (10 * multiples) + ' eggs for ' + multiples + (multiples == 1 ? ' coin!' : ' coins!'))
			// eslint-disable-next-line spaced-comment
			//.setThumbnail(user.defaultAvatarURL)
			.setDescription('⠀\nThey now have ' + (user.gold_coins + multiples) + ' coins!\n⠀')
			.setFooter({ text: 'Check them out with /basket!' });

		try { return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'First Step Reply')); }
		catch (err) { client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied'); }
	},
};
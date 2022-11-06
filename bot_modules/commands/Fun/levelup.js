const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'upgrade',
	description: 'Give your coins to Jethro to level up!!',
	data: new SlashCommandBuilder()
		.setName('upgrade')
		.setDescription('Give your coins to Jethro to level up!'),
	async execute(interaction, client) {
		const guildId = interaction.guildId;

		const data_u = await client.pool.query('SELECT * FROM user_data WHERE member_id = $1 AND Guild_ID = $2;', [interaction.user.id, guildId]);
		const user = data_u.rows[0];

		const data = await client.pool.query('SELECT * FROM guild_settings WHERE Guild_ID = $1', [interaction.guildId]);
		const setting = data.rows[0];

		const eggRequire = client.extra.eggRequirement(user.basket_level, setting.upgrade_requirement_multiplier);

		if(user.gold_coins < eggRequire)
		{
			interaction.reset_cooldown = true;
			try{return await interaction.reply({ content: 'You don\'t have enough coins! You need **' + (eggRequire - user.gold_coins) + ' more coins** to level up!', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'No Eggs Warning Reply'));}
			catch (err) {client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied');}
		}

		user.basket_eggs = client.extra.shuffle(user.basket_eggs).slice(0, user.basket_eggs.length - 10);


		await client.pool.query('UPDATE user_data SET basket_level = basket_level + 1, gold_coins = gold_coins - $1 WHERE Guild_ID = $3 AND Member_ID = $2;', [eggRequire, interaction.user.id, guildId]);

		const titles = ['The Cottontail Valley', 'The Oracle Streams', 'The Hulking Fields', 'The Harewing Jungle', 'The Ethereal Gardens', 'The Crimson Grove', 'The Arcane Void'];

		let newarea = undefined;

		if(client.extra.eggLevelRestrictions.includes(user.basket_level + 1) == true) {

			const index = client.extra.eggLevelRestrictions.indexOf(user.basket_level + 1);

			newarea = new MessageEmbed()
				.setColor(client.colors[0][2])
				.setTitle('🗺️   New Area Unlocked!   🗺️')
				// eslint-disable-next-line spaced-comment
				//.setThumbnail(user.defaultAvatarURL)
				.setDescription('⠀\n' + titles[index] + ' is now available for them to hunt! Use **/hunt ' + titles[index] + '** to check it out!\n⠀')
				.setFooter({ text: 'Check them out with /basket!' });
		}


		const embed = new MessageEmbed()
			.setColor(client.colors[0][2])
			.setTitle('🔺   ' + interaction.user.username + ' just leveled up to level ' + (user.basket_level + 1) + '!   🔺')
			// eslint-disable-next-line spaced-comment
			//.setThumbnail(user.defaultAvatarURL)
			.setDescription('⠀\nJethro has accepted the coins! With a wave of his scepter, he grants you them more power!\n\n**They now have ' + (user.gold_coins - eggRequire) + ' coins left!**\n⠀')
			.setFooter({ text: 'Check them out with /basket!' });

		try { return await interaction.reply({ embeds: (newarea != undefined ? [embed, newarea] : [embed]) }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'First Step Reply')); }
		catch (err) { client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied'); }

		return;
	},
};
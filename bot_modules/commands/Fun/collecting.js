const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
	name: 'dailybox',
	description: 'Vote for the bot and get special prizes!',
	cooldown: 86400,
	data: new SlashCommandBuilder()
		.setName('dailybox')
		.setDescription('Vote for the bot and get special prizes!'),
	async execute(interaction, client) {
		const v = await client.votes.query('SELECT * FROM votes WHERE user_id = $1', [interaction.user.id]);
		const voter = v.rows[0];

		const data = await client.pool.query('SELECT * FROM guild_settings WHERE Guild_ID = $1', [interaction.guild.id]);
		const setting = data.rows[0];

		const data_u = await client.pool.query('SELECT * FROM user_data WHERE member_id = $1 AND Guild_ID = $2;', [interaction.user.id, interaction.guildId]);
		const u = data_u.rows[0];

		const premium = await client.extra.getPremium(interaction, client);
		if(voter == undefined && premium == false) {
			const hasVoted = await client.topapi.hasVoted(interaction.user.id);
			if(hasVoted == false) {
				const row = new MessageActionRow()
					.addComponents(
						new MessageButton()
							.setLabel('Vote Here')
							.setStyle('LINK')
							.setURL('https://top.gg/bot/819714651184693259/vote'),
					);
				interaction.reset_cooldown = true;
				const embed = new MessageEmbed()
					.setColor(client.colors[0][0])
					.setTitle('🔗   You need to vote first!   🔗')
				// eslint-disable-next-line spaced-comment
				//.setThumbnail(user.defaultAvatarURL)
					.setDescription('⠀\nYou need to vote first before you collect your daily box! Vote by pressing the button below.\n⠀')
					.setFooter('For any questions/concerns please visit the official TheKWitt server! https://discord.gg/BYVD4AGmYR');
				try{return await interaction.reply({ embeds: [embed], components: [row] }).then(client.extra.log_g(client.logger, interaction.guild, 'Collect Present Command', 'Bot Reply'));}
				catch{client.extra.log_error_g(client.logger, interaction.guild, 'Collect Present Command', 'Reply Denied');}
			} else {
				await client.votes.query('INSERT INTO votes(user_id, timestamp) VALUES ($1, $2);', [interaction.user.id, Math.floor(Date.now() / 1000) + 86400]);
			}
		}

		const rands = [client.extra.random(1 + Math.floor(u.basket_level / 6), 4 + Math.floor(u.basket_level / 3)), client.extra.random(1 + Math.floor(u.basket_level / 10), 6 + Math.floor(u.basket_level / 5))];

		await client.pool.query('UPDATE user_data SET clusters = clusters + $1, gold_coins = gold_coins + $4 WHERE Guild_ID = $3 AND Member_ID = $2', [rands[0], interaction.user.id, interaction.guildId, rands[1]]);
		const embed = new MessageEmbed()
			.setColor(client.colors[0][1])
			.setTitle('🎁   ' + interaction.user.username + ' opened their daily box!   🎁')
		// eslint-disable-next-line spaced-comment
		//.setThumbnail(user.defaultAvatarURL)
			// .setImage(present.url)
			.setDescription('⠀\nThey got ' + rands[0] + ' clusters and ' + rands[1] + ' coins!\n⠀')
			.setFooter('Come back in 24 hours for another daily box!');

		try{return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, 'Collect Present Command', 'Bot Reply'));}
		catch (err) {
			client.extra.log_error_g(client.logger, interaction.guild, 'Collect Present Command', 'Reply Denied - ' + String(err));
			interaction.failed = true;
		}
	},
};
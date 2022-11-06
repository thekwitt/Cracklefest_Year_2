const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

// eslint-disable-next-line no-unused-vars

module.exports = {
	name: 'eggcheatsheet',
	description: 'Find out where the eggs are located to hunt!',
	data: new SlashCommandBuilder()
		.setName('eggcheatsheet')
		.setDescription('Find out where the eggs are located to hunt!'),
	// eslint-disable-next-line no-unused-vars
	async execute(interaction, client) {

		const data_u = await client.pool.query('SELECT * FROM user_data WHERE member_id = $1 AND Guild_ID = $2;', [interaction.user.id, interaction.guildId]);
		const user = data_u.rows[0];

		const embed = new MessageEmbed()
			.setColor(client.colors[0][0])
			.setTitle('📖   Egg Cheatsheet   📖')
			// eslint-disable-next-line spaced-comment
			//.setThumbnail(user.defaultAvatarURL)
			.setDescription('⠀\n' + (client.extra.eggLevelRestrictions[0] <= user.basket_level ? '**The Cottontail Valley** - This area contains Solid, Triangle, Castle and Unique Eggs\n**Jethro\'s Rare Personal Collection (20101 - 20105)**!' : '**The Cottontail Valley** - *Eggs are Hidden | Must be Level ' + client.extra.eggLevelRestrictions[0] + '*') + '\n\n' + (client.extra.eggLevelRestrictions[1] <= user.basket_level ? '**The Oracle Streams** - This area contains Waves, ZigZag, Water and mixture Eggs\n**Dragon Eggs (20401 - 20405)**!' : '**The Oracle Streams** - *Eggs are Hidden | Must be Level ' + client.extra.eggLevelRestrictions[1] + '*') + '\n\n' + (client.extra.eggLevelRestrictions[2] <= user.basket_level ? '**The Hulking Fields** - This area contains Food, Melted and Cream Eggs!\n**Rare Delicious Chocolate Eggs (20201 - 20205)**' : '**The Hulking Fields** - *Eggs are Hidden | Must be Level ' + client.extra.eggLevelRestrictions[2] + '*') + '\n\n' + (client.extra.eggLevelRestrictions[3] <= user.basket_level ? '**The Harewing Jungle** - This area contains Dotted, Swirl and Diamonds\n**Rare Wooden Eggs (20301 - 20305)**' : '**The Harewing Jungle** - *Eggs are Hidden | Must be Level ' + client.extra.eggLevelRestrictions[3] + '*') + '\n\n' + (client.extra.eggLevelRestrictions[4] <= user.basket_level ? '**The Ethereal Gardens** - This area contains Cow, Zebra, Tiger, Reptile, Giraffe and Flowers\n**Rare Soul Essence Eggs (20601 - 20605)**' : '**The Ethereal Gardens** - *Eggs are Hidden | Must be Level ' + client.extra.eggLevelRestrictions[4] + '*') + '\n\n' + (client.extra.eggLevelRestrictions[5] <= user.basket_level ? '**The Crimson Grove** - This area contains Glass, Hexigons, Clouds and Stars Eggs\n**Rare Powerful Fury Eggs (20501 - 20505)**' : '**The Crimson Grove** - *Eggs are Hidden | Must be Level ' + client.extra.eggLevelRestrictions[5] + '*') + '\n\n' + (user.arcane_key == true ? '**The Arcane Void** - This area contains Void, Spell and Fury Eggs' : '**The Arcane Void** - *Eggs are Hidden | Get The Key*') + '\n⠀')
			.setFooter('For any questions/concerns please visit the official TheKWitt server! https://discord.gg/BYVD4AGmYR');

		try{return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, 'Donation Command', 'Bot Reply'));}
		catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' Command', 'Reply Denied');}
	},
};
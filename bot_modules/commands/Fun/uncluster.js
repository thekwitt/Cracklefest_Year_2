const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'uncluster',
	description: 'Bring an egg cluster to the eggsmith to crack open!',
	data: new SlashCommandBuilder()
		.setName('uncluster')
		.setDescription('Bring an egg cluster to the eggsmith to crack open!')
		.addIntegerOption(option => option.setName('amount').setDescription('How many clusters to uncluster. (Only if you don\'t want to use all)')),
	async execute(interaction, client) {
		const guildId = interaction.guildId;

		let amount = interaction.options.getInteger('amount');
		const data_u = await client.pool.query('SELECT * FROM user_data WHERE member_id = $1 AND Guild_ID = $2;', [interaction.user.id, guildId]);
		const user = data_u.rows[0];

		if(user.clusters <= 0)
		{
			interaction.reset_cooldown = true;
			try{return await interaction.reply({ content: 'You don\'t have any clusters!', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'No Clusters Warning Reply'));}
			catch (err) {client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied');}
		}

		const data = await client.pool.query('SELECT * FROM guild_settings WHERE Guild_ID = $1', [interaction.guildId]);
		const setting = data.rows[0];

		if(user.basket_eggs.length + setting.cluster_unwrap_amount > client.extra.eggCapacity(user.basket_level))
		{
			interaction.reset_cooldown = true;
			try{return await interaction.reply({ content: 'You don\'t have enough room for anymore eggs! Sell some eggs by using **/sell** before you open this cluster!', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'No Clusters Warning Reply'));}
			catch (err) {client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied');}
		}


		const temp = [];

		const reg_types = [['Solid', 'Triangle', 'Castle', 'Unique'], ['Waves', 'ZigZag', 'Water', 'Mix 1'], ['Food', 'Melted', 'Cream'], ['Dotted', 'Swirl', 'Diamonds'], ['Cow', 'Zebra', 'Tiger', 'Reptile', 'Giraffe', 'Flowers'], ['Glass', 'Hexigons', 'Clouds', 'Stars'], ['Void', 'Spell', 'Fury']];

		const restricted = client.extra.eggLevelRestrictions.filter(l => l <= user.basket_level).length;

		let restrictedTypes = [];

		if(user.arcane_key == true) restrictedTypes.push('Skull');

		for(let i = 0; i < restricted; i++) restrictedTypes = [...restrictedTypes, ...reg_types[i]];

		const eggs = client.extra.eggs.regular_eggs.filter(e => restrictedTypes.includes(e.type));

		let rand = client.extra.random(setting.cluster_unwrap_amount - 1, setting.cluster_unwrap_amount + 1);
		let c = 1;

		if (amount == undefined) amount = user.clusters;

		while (user.basket_eggs.length + rand < client.extra.eggCapacity(user.basket_level) && c < amount) {
			c += 1;
			rand += client.extra.random(setting.cluster_unwrap_amount - 1, setting.cluster_unwrap_amount + 1);
		}

		if(user.basket_eggs.length + rand > client.extra.eggCapacity(user.basket_level)) rand = client.extra.eggCapacity(user.basket_level) - user.basket_eggs.length;

		for(let i = 0; i < rand; i++) {
			const r = client.extra.random(0, 101);
			if(r > 95 && user.arcane_key == true) {
				temp.push(client.extra.getRandom(client.extra.eggs.regular_eggs.filter(e => ['Skull'].includes(e.type))));
			} else {
				temp.push(client.extra.getRandom(eggs));
			}
		}

		await client.pool.query('UPDATE user_data SET basket_eggs = array_cat(basket_eggs, $1), clusters = clusters - $4 WHERE Guild_ID = $3 AND Member_ID = $2;', [temp.map(e => e.id), interaction.user.id, guildId, c]);
		await client.pool.query('UPDATE user_data SET eggdex = uniq(array_cat(eggdex, $1)) WHERE Guild_ID = $3 AND Member_ID = $2;', [temp.map(e => e.id), interaction.user.id, guildId]);


		const count = temp.length;
		const line = (temp.length > 20 ? temp.slice(0, 20).map(e => e.emoji).join(' ') + '\nPlus ' + (count - 20) + ' more!' : temp.map(e => e.emoji).join(' '));

		const embed = new MessageEmbed()
			.setColor(client.colors[0][2])
			.setTitle((c > 1 ? '' : 'An ') + 'Egg Cluster' + (c > 1 ? 's' : '') + ' ' + (c > 1 ? 'are' : ' is') + ' being broken apart!')
			// eslint-disable-next-line spaced-comment
			//.setThumbnail(user.defaultAvatarURL)
			.setDescription('⠀\n' + c + ' egg cluster' + (c > 1 ? 's' : '') + ' broke apart and you received these eggs!\n\n' + line + '\n⠀')
			.setFooter({ text: 'Check them out with /basket!' });


		await client.pool.query('UPDATE user_stats SET Eggs_Collected = Eggs_Collected + $1 WHERE Guild_ID = $3 AND Member_ID = $2;', [rand, interaction.user.id, guildId]);
		await client.pool.query('UPDATE guild_stats SET Eggs_Collected = Eggs_Collected + $1 WHERE Guild_ID = $2;', [rand, guildId]);

		try { return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'First Step Reply')); }
		catch (err) { client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied'); }
	},
};
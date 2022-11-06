const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

// eslint-disable-next-line no-unused-vars

module.exports = {
	name: 'eggindex',
	description: 'Look up a specific egg!',
	data: new SlashCommandBuilder()
		.setName('eggindex')
		.setDescription('Look up a specific egg!')
		.addIntegerOption(option => option.setName('id').setDescription('Egg ID').setRequired(true)),
	async execute(interaction, client) {
		const guildId = interaction.guildId;

		const id = interaction.options.getInteger('id') + '';

		const directory = [...client.extra.eggs.regular_eggs, ...client.extra.eggs.collectible_eggs];
		const egg_object = directory.find(x => x.id == id);

		const data_u = await client.pool.query('SELECT * FROM user_data WHERE member_id = $1 AND Guild_ID = $2;', [interaction.user.id, guildId]);
		const user = data_u.rows[0];

		if(egg_object == undefined) {
			try{return await interaction.reply({ content: 'This egg id does not give out any eggs! Try again or check out your basket to see if you have that egg.', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'No Clusters Warning Reply'));}
			catch (err) {client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied');}
		}

		const restricted = client.extra.eggLevelRestrictions.filter(l => l <= user.basket_level).length;

		const reg_types = [['Solid', 'Triangle', 'Castle', 'Unique', 'Coney'], ['Waves', 'ZigZag', 'Water', 'Mix 1', 'Oracle'], ['Food', 'Melted', 'Cream', 'Hulking'], ['Dotted', 'Swirl', 'Diamonds', 'Woodlands'], ['Cow', 'Zebra', 'Tiger', 'Reptile', 'Giraffe', 'Flowers', 'Ethereal'], ['Glass', 'Hexigons', 'Clouds', 'Stars', 'Crimson'], ['Void', 'Spell', 'Fury', 'Skull']];

		let restrictedTypes = [];
		for(let i = 0; i < restricted; i++) restrictedTypes = [...restrictedTypes, ...reg_types[i]];

		if(restrictedTypes.filter(x => x == egg_object.type).length == 0 && user.arcane_key == false) {
			try{return await interaction.reply({ content: 'Looks like this egg is only available in an area you are not able to explore yet! Keep leveling up to look up details about it!', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'No Clusters Warning Reply'));}
			catch (err) {client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied');}
		}

		const egg_discord = client.emojis.cache.find(x => x.name == id);

		const titles = ['The Cottontail Valley', 'The Oracle Streams', 'The Hulking Fields', 'The Harewing Jungle', 'The Ethereal Gardens', 'The Crimson Grove', 'The Arcane Void'];

		let i = 0;

		for(i; i < reg_types.length; i++) {
			if(reg_types[i].includes(egg_object.type)) break;
		}

		const embed = new MessageEmbed()
			.setColor(client.colors[0][1])
			.setTitle('🥚   ' + egg_object.name + '   🥚')
			// eslint-disable-next-line spaced-comment
			//.setThumbnail(user.defaultAvatarURL)
			.addField('Egg ID', egg_object.id + ' ')
			.addField('Egg Type', egg_object.type + ' ')
			.setDescription('⠀\n**This Egg can be found in ' + (titles[i] == undefined ? 'any area' : titles[i]) + ' **\n⠀')
			.setImage(egg_discord.url)
			.setFooter('To look up the lore of the area, check out /atlasindex!');

		//if(egg_object.description != '') embed.addField('Fun Fact', egg_object.description);

		try{return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, 'Donation Command', 'Bot Reply'));}
		catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' Command', 'Reply Denied');}
	},
};
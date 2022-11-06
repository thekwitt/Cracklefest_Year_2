/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

module.exports = {
	name: 'settings',
	description: 'Get or Set Settings for the bot on your server!',
	data: new SlashCommandBuilder()
		.setName('settings')
		.setDescription('Get or Set Settings for the bot on your server!')
		.addSubcommandGroup(group =>
			group
				.setName('basic')
				.setDescription('Settings for managing the bot.')
				.addSubcommand(subcommand =>
					subcommand
						.setName('set_channel_trigger')
						.setDescription('Set drop message to trigger either from inside or outside the drop channel.')
						.addBooleanOption(option => option.setName('outside').setDescription('Yes or No').setRequired(true)))
				.addSubcommand(subcommand =>
					subcommand
						.setName('set_trading')
						.setDescription('Disable or Enable Trading.')
						.addBooleanOption(option => option.setName('trading').setDescription('Enable or Disable').setRequired(true)))
				.addSubcommand(subcommand =>
					subcommand
						.setName('set_giving')
						.setDescription('Disable or Enable Giving.')
						.addBooleanOption(option => option.setName('giving').setDescription('Enable or Disable').setRequired(true)))
				.addSubcommand(subcommand =>
					subcommand
						.setName('set_message_count')
						.setDescription('Set how many messages it takes for the drop to appear.')
						.addIntegerOption(option => option.setName('count').setDescription('The Number of Messages').setRequired(true)))

				.addSubcommand(subcommand =>
					subcommand
						.setName('set_rank_type')
						.setDescription('Set how many messages it takes for the drop to appear.')
						.addStringOption(option =>
							option.setName('type')
								.setDescription('The Difficulty of Bosses')
								.setRequired(true)
								.addChoice('Basket Size', '0')
								.addChoice('Level', '1')
								.addChoice('Net Worth', '2')))

				.addSubcommand(subcommand =>
					subcommand
						.setName('set_interval')
						.setDescription('Set how long it takes for the drop to appear.')
						.addIntegerOption(option => option.setName('interval').setDescription('The amount of seconds').setRequired(true)))
				.addSubcommand(subcommand =>
					subcommand
						.setName('set_boss_difficulty')
						.setDescription('Set the difficulty of bosses')
						.addStringOption(option =>
							option.setName('difficulty')
								.setDescription('The Difficulty of Bosses')
								.setRequired(true)
								.addChoice('easy', '0')
								.addChoice('medium', '1')
								.addChoice('hard', '2')
								.addChoice('extreme', '3')))
				.addSubcommand(subcommand =>
					subcommand
						.setName('set_grab_amount')
						.setDescription('Set how many people are allowed to grab from the drop.')
						.addIntegerOption(option => option.setName('amount').setDescription('The amount of people').setRequired(true)))
				.addSubcommand(subcommand =>
					subcommand
						.setName('set_delete_overtime')
						.setDescription('Set if you want messages to delete overtime.')
						.addBooleanOption(option => option.setName('overtime').setDescription('Yes or No').setRequired(true)))
				.addSubcommand(subcommand =>
					subcommand
						.setName('set_rarity_eggs')
						.setDescription('Set the rarity for getting a rare egg.')
						.addIntegerOption(option => option.setName('rarity').setDescription('The Percentage (1% - 10%)').setRequired(true)))
				.addSubcommand(subcommand =>
					subcommand
						.setName('set_active_role')
						.setDescription('Have the bot manage the included role automatically.')
						.addBooleanOption(option => option.setName('role').setDescription('Yes or No').setRequired(true)))
				.addSubcommand(subcommand =>
					subcommand
						.setName('togglechannel')
						.setDescription('Toggle a channel to be excluded from slash commands.')
						.addChannelOption(option =>
							option.setName('text_channel')
								.setDescription('The text channel you wish to exclude or reinclude.').setRequired(true))))
		.addSubcommandGroup(group =>
			group
				.setName('advanced')
				.setDescription('Settings for Premium Servers.')
				.addSubcommand(subcommand =>
					subcommand
						.setName('set_clusters_unwrap_amount')
						.setDescription('Set how many eggs you can get from a cluster.')
						.addIntegerOption(option => option.setName('cluster').setDescription('The Number of Items').setRequired(true)))
				.addSubcommand(subcommand =>
					subcommand
						.setName('set_lost_chuck_percentage')
						.setDescription('Set the percentage of a user\'s basket they can lose up to when chucked at.')
						.addIntegerOption(option => option.setName('lost').setDescription('The Percentage (2% - 100%)').setRequired(true)))
				.addSubcommand(subcommand =>
					subcommand
						.setName('set_hunt_multiplier')
						.setDescription('Set the multiplier for how many eggs a hunt can give.')
						.addIntegerOption(option => option.setName('hunt').setDescription('The Percentage (50% - 1000%)').setRequired(true)))
				.addSubcommand(subcommand =>
					subcommand
						.setName('set_boss_chance')
						.setDescription('Set the chance of having a boss appear on a drop.')
						.addIntegerOption(option => option.setName('chance').setDescription('The Percentage (1% - 100%)').setRequired(true)))
				.addSubcommand(subcommand =>
					subcommand
						.setName('set_requirement_multiplier')
						.setDescription('Set the multiplier for how many eggs it takes to upgrade your basket.')
						.addIntegerOption(option => option.setName('require').setDescription('The Percentage (10% - 1000%)').setRequired(true)))
				.addSubcommand(subcommand =>
					subcommand
						.setName('set_finalboss_count')
						.setDescription('Set how many bosses it takes to cause the final boss to appear.')
						.addIntegerOption(option => option.setName('bosses').setDescription('The Number of Bosses').setRequired(true)))
				.addSubcommand(subcommand =>
					subcommand
						.setName('set_duration')
						.setDescription('Set how long the drop lasts.')
						.addIntegerOption(option => option.setName('duration').setDescription('The amount of seconds').setRequired(true)))
				.addSubcommand(subcommand =>
					subcommand
						.setName('set_leaderboard_name')
						.setDescription('Change the name of lovers on the leaderboard')
						.addStringOption(option => option.setName('lname').setDescription('The Leaderboard Lover Name (Max 15 Characters)').setRequired(true)))
				.addSubcommand(subcommand =>
					subcommand
						.setName('setcmdcooldown')
						.setDescription('Set the cooldown of the chosen command.')
						.addStringOption(option =>
							option.setName('command')
								.setDescription('What kind of help do you need?')
								.setRequired(true)
								.addChoice('hunt', 'hunt')
								.addChoice('chuck', 'chuck'))
						.addIntegerOption(option => option.setName('seconds').setDescription('The amount of seconds for that cooldown.').setRequired(true))))
		.addSubcommand(subcommand =>
			subcommand
				.setName('get_settings')
				.setDescription('Get a list of all your settings.')),
	permission: 'MANAGE_CHANNELS',
	async execute(interaction, client) {
		const outside = interaction.options.getBoolean('outside');
		const role = interaction.options.getBoolean('role');
		const count = interaction.options.getInteger('count');
		const interval = interaction.options.getInteger('interval');
		const amount = interaction.options.getInteger('amount');
		const duration = interaction.options.getInteger('duration');
		const overtime = interaction.options.getBoolean('overtime');
		const giving = interaction.options.getBoolean('giving');
		const trading = interaction.options.getBoolean('trading');
		const text_channel = interaction.options.getChannel('text_channel');
		const command = interaction.options.getString('command');
		const seconds = interaction.options.getInteger('seconds');
		const cluster = interaction.options.getInteger('cluster');
		const chance = interaction.options.getInteger('chance');
		const hunt = interaction.options.getInteger('hunt');
		const lost = interaction.options.getInteger('lost');
		let rank_type = interaction.options.getString('type');
		const require = interaction.options.getInteger('require');
		const bosses = interaction.options.getInteger('bosses');
		const lname = interaction.options.getString('lname');
		const rarity = interaction.options.getInteger('rarity');
		const consecutive = interaction.options.getBoolean('consecutive');
		let difficulty = interaction.options.getString('difficulty');

		const data = await client.pool.query('SELECT * FROM guild_settings WHERE Guild_ID = $1', [interaction.guildId]);
		const setting = data.rows[0];

		if(outside != undefined) {
			await client.pool.query('UPDATE guild_settings SET trigger_drop_outside = $1 WHERE Guild_ID = $2', [outside, interaction.guild.id]);
			await client.extra.reloadMessageDrop(interaction.guild, client);
			try { return await interaction.reply('Drops being triggered outside the drop channel is now set to: ' + outside.toString()).then(client.extra.log_g(client.logger, interaction.guild, 'Settings 1 Command', 'Confirm Reply')); }
			catch (err) { (client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - Settings 1 Command', String(err) + ' - Reply Denied')); }
		} else if(count != undefined) {
			try {
				if (count < 1) return await interaction.reply('That Number is lower than 1, please try again!').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 2 Command', 'Lower Number Reply'));
				else if (count > 1000) return await interaction.reply('That Number is higher than 1000, please try again!').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 2 Command', 'High Number Reply'));
			} catch (err) { client.extra.log_error_g(client.logger, interaction.guild, 'Settings 2 Command', 'Reply Denied'); }
			await client.pool.query('UPDATE guild_settings SET drop_message_count = $1 WHERE Guild_ID = $2', [count, interaction.guild.id]);
			await client.extra.reloadMessageDrop(interaction.guild, client);
			try { return await interaction.reply('Drops will trigger after ' + count.toString() + ' messages.').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 2 Command', 'Confirm Reply')); }
			catch (err) { (client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - Settings 2 Command', 'Reply Denied')); }
		} else if(interval != undefined) {
			try {
				if (interval < 60) return await interaction.reply('That Number is lower than 60, please try again!').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 2 Command', 'Lower Number Reply'));
				else if (interval > 3600) return await interaction.reply('That Number is higher than 3600, please try again!').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 2 Command', 'High Number Reply'));
			} catch (err) { client.extra.log_error_g(client.logger, interaction.guild, 'Settings 2 Command', 'Reply Denied'); }
			await client.pool.query('UPDATE guild_settings SET drop_time_count = $1 WHERE Guild_ID = $2', [interval, interaction.guild.id]);
			await client.extra.reloadMessageDrop(interaction.guild, client);
			try { return await interaction.reply('Drops will trigger after ' + interval.toString() + ' seconds.').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 3 Command', 'Confirm Reply')); }
			catch (err) { (client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - Settings 3 Command', 'Reply Denied')); }
		} else if(cluster != undefined) {

			const premium = await client.extra.getPremium(interaction, client);
			if(premium == false) {
				const row = new MessageActionRow()
					.addComponents(
						new MessageButton()
							.setLabel('Patreon Link')
							.setStyle('LINK')
							.setURL('https://www.patreon.com/thekwitt'),
					);

				const e = new MessageEmbed()
					.setColor('#EA2B2B')
					.setTitle('This is a patreon only feature.')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription('⠀\nLooks like you haven\'t purchased the patreon package! For only **$2** You can use this command and many others along with other servers who have premium as well!. Check out the link for more info especially if you haven\'t purchased it yet. If you want more details about what you are getting, check out **/help manual Premium Features.**\n⠀')
					.setFooter('If you have already purchased it, try out /premium verify');

				try{return await interaction.reply({ embeds: [e], components: [row] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'Bot Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - ' + this.name + ' Command', 'Reply Denied');}
			}

			try {
				if (cluster < 3) return await interaction.reply('That Number is lower than 3, please try again!').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 9 Command', 'Lower Number Reply'));
				else if (cluster > 50) return await interaction.reply('That Number is higher than 50, please try again!').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 9 Command', 'High Number Reply'));
			} catch (err) { client.extra.log_error_g(client.logger, interaction.guild, 'Settings 9 Command', 'Reply Denied'); }
			await client.pool.query('UPDATE guild_settings SET Cluster_Unwrap_Amount = $1 WHERE Guild_ID = $2', [cluster, interaction.guild.id]);
			await client.extra.reloadMessageDrop(interaction.guild, client);
			try { return await interaction.reply('The number of eggs a cluster can contain is ' + cluster).then(client.extra.log_g(client.logger, interaction.guild, 'Settings 9 Command', 'Confirm Reply')); }
			catch (err) { (client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - Settings 9 Command', 'Reply Denied')); }
		} else if(hunt != undefined) {
			const premium = await client.extra.getPremium(interaction, client);
			if(premium == false) {
				const row = new MessageActionRow()
					.addComponents(
						new MessageButton()
							.setLabel('Patreon Link')
							.setStyle('LINK')
							.setURL('https://www.patreon.com/thekwitt'),
					);

				const e = new MessageEmbed()
					.setColor('#EA2B2B')
					.setTitle('This is a patreon only feature.')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription('⠀\nLooks like you haven\'t purchased the patreon package! For only **$2** You can use this command and many others along with other servers who have premium as well!. Check out the link for more info especially if you haven\'t purchased it yet. If you want more details about what you are getting, check out **/help manual Premium Features.**\n⠀')
					.setFooter('If you have already purchased it, try out /premium verify');

				try{return await interaction.reply({ embeds: [e], components: [row] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'Bot Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - ' + this.name + ' Command', 'Reply Denied');}
			}

			try {
				if (hunt < 50) return await interaction.reply('That percentage is too low! It needs to be between 50% - 1000%!').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 9 Command', 'Lower Number Reply'));
				else if (hunt > 1000) return await interaction.reply('That percentage is too high! It needs to be between 50% - 1000%!').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 9 Command', 'High Number Reply'));
			} catch (err) { client.extra.log_error_g(client.logger, interaction.guild, 'Settings 9 Command', 'Reply Denied'); }
			await client.pool.query('UPDATE guild_settings SET hunt_multiplier = $1 WHERE Guild_ID = $2', [hunt, interaction.guild.id]);
			await client.extra.reloadMessageDrop(interaction.guild, client);
			try { return await interaction.reply('The multiplier percentage is now ' + hunt + '%').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 9 Command', 'Confirm Reply')); }
			catch (err) { (client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - Settings 9 Command', 'Reply Denied')); }
		} else if(require != undefined) {
			const premium = await client.extra.getPremium(interaction, client);
			if(premium == false) {
				const row = new MessageActionRow()
					.addComponents(
						new MessageButton()
							.setLabel('Patreon Link')
							.setStyle('LINK')
							.setURL('https://www.patreon.com/thekwitt'),
					);

				const e = new MessageEmbed()
					.setColor('#EA2B2B')
					.setTitle('This is a patreon only feature.')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription('⠀\nLooks like you haven\'t purchased the patreon package! For only **$2** You can use this command and many others along with other servers who have premium as well!. Check out the link for more info especially if you haven\'t purchased it yet. If you want more details about what you are getting, check out **/help manual Premium Features.**\n⠀')
					.setFooter('If you have already purchased it, try out /premium verify');

				try{return await interaction.reply({ embeds: [e], components: [row] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'Bot Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - ' + this.name + ' Command', 'Reply Denied');}
			}

			try {
				if (require < 10) return await interaction.reply('That percentage is too low! It needs to be between 10% - 1000%!').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 9 Command', 'Lower Number Reply'));
				else if (require > 1000) return await interaction.reply('That percentage is too high! It needs to be between 10% - 1000%!').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 9 Command', 'High Number Reply'));
			} catch (err) { client.extra.log_error_g(client.logger, interaction.guild, 'Settings 10 Command', 'Reply Denied'); }
			await client.pool.query('UPDATE guild_settings SET Upgrade_Requirement_Multiplier = $1 WHERE Guild_ID = $2', [require, interaction.guild.id]);
			await client.extra.reloadMessageDrop(interaction.guild, client);
			try { return await interaction.reply('The multiplier percentage is now ' + require + '%').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 10 Command', 'Confirm Reply')); }
			catch (err) { (client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - Settings 9 Command', 'Reply Denied')); }
		} else if(chance != undefined) {
			const premium = await client.extra.getPremium(interaction, client);
			if(premium == false) {
				const row = new MessageActionRow()
					.addComponents(
						new MessageButton()
							.setLabel('Patreon Link')
							.setStyle('LINK')
							.setURL('https://www.patreon.com/thekwitt'),
					);

				const e = new MessageEmbed()
					.setColor('#EA2B2B')
					.setTitle('This is a patreon only feature.')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription('⠀\nLooks like you haven\'t purchased the patreon package! For only **$2** You can use this command and many others along with other servers who have premium as well!. Check out the link for more info especially if you haven\'t purchased it yet. If you want more details about what you are getting, check out **/help manual Premium Features.**\n⠀')
					.setFooter('If you have already purchased it, try out /premium verify');

				try{return await interaction.reply({ embeds: [e], components: [row] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'Bot Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - ' + this.name + ' Command', 'Reply Denied');}
			}

			try {
				if (chance < 1) return await interaction.reply('That percentage is too low! It needs to be between 1% - 100%!').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 9 Command', 'Lower Number Reply'));
				else if (chance > 100) return await interaction.reply('That percentage is too high! It needs to be between 1% - 100%!').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 9 Command', 'High Number Reply'));
			} catch (err) { client.extra.log_error_g(client.logger, interaction.guild, 'Settings 10 Command', 'Reply Denied'); }
			await client.pool.query('UPDATE guild_settings SET Drop_Boss_Chance = $1 WHERE Guild_ID = $2', [chance, interaction.guild.id]);
			await client.extra.reloadMessageDrop(interaction.guild, client);
			try { return await interaction.reply('The boss chance percentage is now ' + chance + '%').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 10 Command', 'Confirm Reply')); }
			catch (err) { (client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - Settings 9 Command', 'Reply Denied')); }
		} else if(lost != undefined) {
			const premium = await client.extra.getPremium(interaction, client);
			if(premium == false) {
				const row = new MessageActionRow()
					.addComponents(
						new MessageButton()
							.setLabel('Patreon Link')
							.setStyle('LINK')
							.setURL('https://www.patreon.com/thekwitt'),
					);

				const e = new MessageEmbed()
					.setColor('#EA2B2B')
					.setTitle('This is a patreon only feature.')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription('⠀\nLooks like you haven\'t purchased the patreon package! For only **$2** You can use this command and many others along with other servers who have premium as well!. Check out the link for more info especially if you haven\'t purchased it yet. If you want more details about what you are getting, check out **/help manual Premium Features.**\n⠀')
					.setFooter('If you have already purchased it, try out /premium verify');

				try{return await interaction.reply({ embeds: [e], components: [row] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'Bot Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - ' + this.name + ' Command', 'Reply Denied');}
			}

			try {
				if (lost < 2) return await interaction.reply('That percentage is too low! It needs to be between 2% - 100%!').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 9 Command', 'Lower Number Reply'));
				else if (lost > 100) return await interaction.reply('That percentage is too high! It needs to be between 2% - 100%!').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 9 Command', 'High Number Reply'));
			} catch (err) { client.extra.log_error_g(client.logger, interaction.guild, 'Settings Lost Eggs Command', 'Reply Denied'); }
			await client.pool.query('UPDATE guild_settings SET lost_chuck_percentage = $1 WHERE Guild_ID = $2', [lost, interaction.guild.id]);
			await client.extra.reloadMessageDrop(interaction.guild, client);
			try { return await interaction.reply('The percentage of a basket that can be lost up to when chucked is ' + lost + '%').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 10 Command', 'Confirm Reply')); }
			catch (err) { (client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - Settings Lost Eggs Command', 'Reply Denied')); }
		} else if(rarity != undefined) {
			try {
				if (rarity < 1) return await interaction.reply('That percentage is too low! It needs to be between 1% - 10%!').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 9 Command', 'Lower Number Reply'));
				else if (rarity > 10) return await interaction.reply('That percentage is too high! It needs to be between 1% - 10%!').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 9 Command', 'High Number Reply'));
			} catch (err) { client.extra.log_error_g(client.logger, interaction.guild, 'Settings 10 Command', 'Reply Denied'); }
			await client.pool.query('UPDATE guild_settings SET Rare_Egg_Percentage_Multiplier = $1 WHERE Guild_ID = $2', [rarity, interaction.guild.id]);
			try { return await interaction.reply('The rarity percentage is now ' + rarity + '%').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 10 Command', 'Confirm Reply')); }
			catch (err) { (client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - Settings 9 Command', 'Reply Denied')); }

		} else if(bosses != undefined) {
			const premium = await client.extra.getPremium(interaction, client);
			if(premium == false) {
				const row = new MessageActionRow()
					.addComponents(
						new MessageButton()
							.setLabel('Patreon Link')
							.setStyle('LINK')
							.setURL('https://www.patreon.com/thekwitt'),
					);

				const e = new MessageEmbed()
					.setColor('#EA2B2B')
					.setTitle('This is a patreon only feature.')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription('⠀\nLooks like you haven\'t purchased the patreon package! For only **$2** You can use this command and many others along with other servers who have premium as well!. Check out the link for more info especially if you haven\'t purchased it yet. If you want more details about what you are getting, check out **/help manual Premium Features.**\n⠀')
					.setFooter('If you have already purchased it, try out /premium verify');

				try{return await interaction.reply({ embeds: [e], components: [row] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'Bot Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - ' + this.name + ' Command', 'Reply Denied');}
			}

			try {
				if (bosses < 3) return await interaction.reply('That Number is lower than 3, please try again!').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 9 Command', 'Lower Number Reply'));
				else if (bosses > 50) return await interaction.reply('That Number is higher than 50, please try again!').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 9 Command', 'High Number Reply'));
			} catch (err) { client.extra.log_error_g(client.logger, interaction.guild, 'Settings 9 Command', 'Reply Denied'); }
			await client.pool.query('UPDATE guild_settings SET Drop_FinalBoss_Standard = $1 WHERE Guild_ID = $2', [bosses, interaction.guild.id]);
			await client.extra.reloadMessageDrop(interaction.guild, client);
			try { return await interaction.reply('The number of bosses it takes for the final boss to spawn is ' + bosses).then(client.extra.log_g(client.logger, interaction.guild, 'Settings 9 Command', 'Confirm Reply')); }
			catch (err) { (client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - Settings 9 Command', 'Reply Denied')); }
		} else if(lname != undefined) {
			const premium = await client.extra.getPremium(interaction, client);
			if(premium == false) {
				const row = new MessageActionRow()
					.addComponents(
						new MessageButton()
							.setLabel('Patreon Link')
							.setStyle('LINK')
							.setURL('https://www.patreon.com/thekwitt'),
					);

				const e = new MessageEmbed()
					.setColor('#EA2B2B')
					.setTitle('This is a patreon only feature.')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription('⠀\nLooks like you haven\'t purchased the patreon package! For only **$2** You can use this command and many others along with other servers who have premium as well!. Check out the link for more info especially if you haven\'t purchased it yet. If you want more details about what you are getting, check out **/help manual Premium Features.**\n⠀')
					.setFooter('If you have already purchased it, try out /premium verify');

				try{return await interaction.reply({ embeds: [e], components: [row] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'Bot Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - ' + this.name + ' Command', 'Reply Denied');}
			}

			await client.pool.query('UPDATE guild_settings SET Leaderboard_Name = $1 WHERE Guild_ID = $2', [lname.substring(0, 15), interaction.guild.id]);
			await client.extra.reloadMessageDrop(interaction.guild, client);
			try { return await interaction.reply('The name of lovers on the leaderboard is ' + lname.substring(0, 15)).then(client.extra.log_g(client.logger, interaction.guild, 'Settings 10 Command', 'Confirm Reply')); }
			catch (err) { (client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - Settings 10 Command', 'Reply Denied')); }
		} else if (difficulty != undefined) {
			difficulty = Number(difficulty);
			await client.pool.query('UPDATE guild_settings SET Boss_Difficulty = $1 WHERE Guild_ID = $2', [difficulty, interaction.guild.id]);
			const timestamp = Math.floor(Date.now() / 1000) + setting.message_interval;
			client.messages.set(interaction.guild.id, new Map([['messageCount', setting.message_count], ['timestamp', timestamp], ['activeMessage', false]]));
			try { return await interaction.reply('Bosses are now set to ' + ['easy', 'normal', 'hard', 'extreme'][difficulty] + ' difficulty.').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 4 Command', 'Confirm Reply')); }
			catch { (client.extra.log_error_g(client.logger, interaction.guild, 'Settings 4 Command', 'Reply Denied')); }
		} else if (rank_type != undefined) {
			rank_type = Number(rank_type);
			await client.pool.query('UPDATE guild_settings SET rank_type = $1 WHERE Guild_ID = $2', [rank_type, interaction.guild.id]);
			const timestamp = Math.floor(Date.now() / 1000) + setting.message_interval;
			try { return await interaction.reply('Bosses are now set to ' + ['Basket', 'Level', 'Net Worth'][rank_type] + ' ranking.').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 4 Command', 'Confirm Reply')); }
			catch { (client.extra.log_error_g(client.logger, interaction.guild, 'Settings 11 Command', 'Reply Denied')); }
		} else if(amount != undefined) {
			try {
				if (amount < 1) return await interaction.reply('That Number is lower than 1, please try again!').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 2 Command', 'Lower Number Reply'));
				else if (amount > 100) return await interaction.reply('That Number is higher than 100, please try again!').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 2 Command', 'High Number Reply'));
			} catch (err) { client.extra.log_error_g(client.logger, interaction.guild, 'Settings 2 Command', 'Reply Denied'); }
			await client.pool.query('UPDATE guild_settings SET drop_obtain_count = $1 WHERE Guild_ID = $2', [amount, interaction.guild.id]);
			await client.extra.reloadMessageDrop(interaction.guild, client);
			try { return await interaction.reply(amount.toString() + ' member(s) will be able to acquire a drop.').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 4 Command', 'Confirm Reply')); }
			catch (err) { (client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - Settings 4 Command', 'Reply Denied')); }
		} else if(duration != undefined) {

			const premium = await client.extra.getPremium(interaction, client);
			if(premium == false) {
				const row = new MessageActionRow()
					.addComponents(
						new MessageButton()
							.setLabel('Patreon Link')
							.setStyle('LINK')
							.setURL('https://www.patreon.com/thekwitt'),
					);

				const e = new MessageEmbed()
					.setColor('#EA2B2B')
					.setTitle('This is a patreon only feature.')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription('⠀\nLooks like you haven\'t purchased the patreon package! For only **$2** You can use this command and many others along with other servers who have premium as well!. Check out the link for more info especially if you haven\'t purchased it yet. If you want more details about what you are getting, check out **/help manual Premium Features.**\n⠀')
					.setFooter('If you have already purchased it, try out /premium verify');

				try{return await interaction.reply({ embeds: [e], components: [row] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'Bot Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - ' + this.name + ' Command', 'Reply Denied');}
			}

			try {
				if (duration < 1) return await interaction.reply('That Number is lower than 1, please try again!').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 2 Command', 'Lower Number Reply'));
				else if (duration > 100) return await interaction.reply('That Number is higher than 100, please try again!').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 2 Command', 'High Number Reply'));
			} catch (err) { client.extra.log_error_g(client.logger, interaction.guild, 'Settings 2 Command', 'Reply Denied'); }
			await client.pool.query('UPDATE guild_settings SET drop_duration = $1 WHERE Guild_ID = $2', [duration, interaction.guild.id]);
			await client.extra.reloadMessageDrop(interaction.guild, client);
			try { return await interaction.reply('Drops will last ' + duration.toString() + ' seconds.').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 5 Command', 'Confirm Reply')); }
			catch (err) { (client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - Settings 5 Command', 'Reply Denied')); }
		} else if(consecutive != undefined) {
			await client.pool.query('UPDATE guild_settings SET consecutive_mode = $1 WHERE Guild_ID = $2', [consecutive, interaction.guild.id]);
			await client.extra.reloadMessageDrop(interaction.guild, client);
			try { return await interaction.reply('Anti-consecutive love mode is now: ' + consecutive.toString() + '.').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 12 Command', 'Confirm Reply')); }
			catch (err) { (client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - Settings 12 Command', 'Reply Denied')); }
		} else if(overtime != undefined) {
			await client.pool.query('UPDATE guild_settings SET delete_ot = $1 WHERE Guild_ID = $2', [overtime, interaction.guild.id]);
			await client.extra.reloadMessageDrop(interaction.guild, client);
			try { return await interaction.reply('Drops being deleted overtime is now ' + overtime.toString() + '.').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 6 Command', 'Confirm Reply')); }
			catch (err) { (client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - Settings 6 Command', 'Reply Denied')); }
		} else if(giving != undefined) {
			await client.pool.query('UPDATE guild_settings SET enable_giving = $1 WHERE Guild_ID = $2', [giving, interaction.guild.id]);
			try { return await interaction.reply('Gifting has been set to ' + giving.toString() + '.').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 6 Command', 'Confirm Reply')); }
			catch (err) { (client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - Settings 6 Command', 'Reply Denied')); }
		} else if(trading != undefined) {
			await client.pool.query('UPDATE guild_settings SET enable_trading = $1 WHERE Guild_ID = $2', [trading, interaction.guild.id]);
			await client.extra.reloadMessageDrop(interaction.guild, client);
			try { return await interaction.reply('Trading has been set to ' + trading.toString() + '.').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 6 Command', 'Confirm Reply')); }
			catch (err) { (client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - Settings 6 Command', 'Reply Denied')); }
		} else if(role != undefined) {
			await client.pool.query('UPDATE guild_settings SET Manage_Role = $1 WHERE Guild_ID = $2', [trading, interaction.guild.id]);
			await client.extra.reloadMessageDrop(interaction.guild, client);
			try { return await interaction.reply('The Included Role being auto managed is ' + role.toString() + '.').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 6 Command', 'Confirm Reply')); }
			catch (err) { (client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - Settings 6 Command', 'Reply Denied')); }
		} else if(text_channel != undefined) {
			const premium = await client.extra.getPremium(interaction, client);
			if(premium == false) {
				const row = new MessageActionRow()
					.addComponents(
						new MessageButton()
							.setLabel('Patreon Link')
							.setStyle('LINK')
							.setURL('https://www.patreon.com/thekwitt'),
					);

				const e = new MessageEmbed()
					.setColor('#EA2B2B')
					.setTitle('This is a patreon only feature.')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription('⠀\nLooks like you haven\'t purchased the patreon package! For only **$2** You can use this command and many others along with other servers who have premium as well!. Check out the link for more info especially if you haven\'t purchased it yet. If you want more details about what you are getting, check out **/help manual Premium Features.**\n⠀')
					.setFooter('If you have already purchased it, try out /premium verify');

				try{return await interaction.reply({ embeds: [e], components: [row] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'Bot Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - ' + this.name + ' Command', 'Reply Denied');}
			}

			if(text_channel.type != 'GUILD_TEXT') {
				try { return await interaction.reply('That channel isn\'t a text channel!').then(client.extra.log_g(client.logger, interaction.guild, 'Settings 7 Command', 'Not Text Reply')); }
				catch (err) { client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - Settings 7 Command', 'Reply Denied'); }
			}
			if(setting.channels_exclude_commands.includes(text_channel.id)) {
				await client.pool.query('UPDATE guild_settings SET channels_exclude_commands = array_remove(channels_exclude_commands,$1) WHERE Guild_ID = $2;', [text_channel.id, interaction.guildId]);
				try{ return await interaction.reply(text_channel.name + ' is now included for slash commands!').then(client.extra.log_g(client.logger, interaction.guild, 'Include Channel Settings 7 Command', 'Confirm Reply')); }
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - Settings 7 Command', 'Reply Denied'); }
			} else if(!setting.channels_exclude_commands.includes(text_channel.id)) {
				await client.pool.query('UPDATE guild_settings SET channels_exclude_commands = array_append(channels_exclude_commands,$1) WHERE Guild_ID = $2;', [text_channel.id, interaction.guildId]);
				try{ return await interaction.reply(text_channel.name + ' is now excluded for slash commands!').then(client.extra.log_g(client.logger, interaction.guild, 'Exclude Channel Settings 7 Command', 'Confirm Reply')); }
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - Settings 7 Command', 'Reply Denied'); }
			}
			await client.extra.reloadMessageDrop(interaction.guild, client);
		} else if(command != undefined) {

			const premium = await client.extra.getPremium(interaction, client);
			if(premium == false) {
				const row = new MessageActionRow()
					.addComponents(
						new MessageButton()
							.setLabel('Patreon Link')
							.setStyle('LINK')
							.setURL('https://www.patreon.com/thekwitt'),
					);

				const embed = new MessageEmbed()
					.setColor('#EA2B2B')
					.setTitle('This is a patreon only feature.')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription('⠀\nLooks like you haven\'t purchased the patreon package! For only **$2** You can use this command and many others along with other servers who have premium as well!. Check out the link for more info especially if you haven\'t purchased it yet. If you want more details about what you are getting, check out **/help manual Premium Features.**\n⠀')
					.setFooter('If you have already purchased it, try out /premium verify');

				try{return await interaction.reply({ embeds: [embed], components: [row] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'Bot Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - ' + this.name + ' Command', 'Reply Denied');}
			}

			const cmd_data = client.commands.get(command);
			setting.command_cooldowns[cmd_data.cdid] = seconds;
			await client.pool.query('UPDATE guild_settings SET command_cooldowns = $1 WHERE Guild_ID = $2;', [setting.command_cooldowns, interaction.guildId]);
			try{ return await interaction.reply('/' + command + '\'s cooldown is now ' + seconds + ' seconds!').then(client.extra.log_g(client.logger, interaction.guild, 'Enable Channel Settings 8 Command', 'Confirm Reply')); }
			catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - Settings 8 Command', 'Reply Denied'); }
		} else {
			const channel = interaction.guild.channels.cache.get(setting.channel_set.toString());
			let name = 'None Set';
			let page = 0;
			const max_page = 2;

			if(channel != undefined) name = channel.name;

			let string = '';


			for(let [key, value] of client.commands) {
				if(value.cdid != undefined) {
					string += '\n' + value.name + ' | Cooldown: ' + setting.command_cooldowns[value.cdid] + ' seconds.';
				}
			}

			const embeds = [
				new MessageEmbed()
					.setColor(client.colors[0][0])
					.setTitle(interaction.guild.name + '\'s Egg Settings')
				// eslint-disable-next-line spaced-comment
				//.setThumbnail(user.defaultAvatarURL)
					.setDescription('⠀\n\
					Clusters will contain around ' + setting.cluster_unwrap_amount + ' eggs each.' + '\n\n\
					Ranking Type: ' + ['Basket Size', 'Level', 'Net Worth'][setting.rank_type] + '\
					Hunting has a multiplier of: ' + setting.hunt_multiplier + '%\n\n\
					Trading is: ' + setting.enable_trading + '\n\n\
					Gifting is: ' + setting.enable_giving + '\n\n\
					Chucking Max Basket Percentage is: ' + setting.lost_chuck_percentage + '%\n\n\
					Upgrade Multiplier: ' + setting.upgrade_requirement_multiplier + '%\n\n\
					Rare Egg Chance:' + setting.rare_egg_percentage_multiplier + '\
					\n⠀')
					.setFooter('Controlled by ' + interaction.user.username + ' | Page ' + (page + 1) + '/' + (max_page + 1) + ' | Use Arrows to switch pages/rank'),

				new MessageEmbed()
					.setColor(client.colors[0][0])
					.setTitle(interaction.guild.name + '\'s Drop Settings')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription('⠀\nDrop Channel: ' + name + '\n\n\
					Drops can be triggered from outside the drop channel: ' + setting.trigger_drop_outside + '\n\n\
					Drops can be triggered after: ' + setting.drop_message_count + ' Messages\n\n\
					Drops can be triggered after: ' + setting.drop_time_count + ' Seconds.\n\n\
					Drops can be acquired by: ' + setting.drop_obtain_count + ' People.\n\n\
					Drops will last about: ' + setting.drop_duration + ' seconds each.\n\n\
					Drop Messages will delete over time: ' + setting.delete_ot + '.\n\n\
					Percentage Chance of Boss Spawns: ' + setting.drop_boss_chance + '%\n\n\
					Bosses needed to be defeated to spawn the final boss: ' + setting.drop_finalboss_standard + ' bosses\n\n\
					Boss Difficulty: ' + ['Easy', 'Normal', 'Hard', 'Extreme'][setting.boss_difficulty] + '.\n\n\
					\n⠀')
					.setFooter('Controlled by ' + interaction.user.username + ' | Page ' + (page + 1) + '/' + (max_page + 1) + ' | Use Arrows to switch pages/rank'),

				new MessageEmbed()
					.setColor(client.colors[0][0])
					.setTitle(interaction.guild.name + '\'s Command Settings')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription('⠀\nChannels that do not allow Slash Commands: ' + client.extra.printBoolean(setting.channels_exclude_commands.length != 0, [setting.channels_exclude_commands.join(', '), 'None!']) + '\n' + string + '\n⠀')
					.setFooter({ text: 'Controlled by ' + interaction.user.username + ' | Page ' + (page + 1) + '/' + (max_page + 1) + ' | Use Arrows to switch pages/rank' }),
			];

			const row = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId('Left')
						.setLabel('⬅️')
						.setStyle('PRIMARY'),
				)
				.addComponents(
					new MessageButton()
						.setCustomId('Right')
						.setLabel('➡️')
						.setStyle('PRIMARY'),
				);


			try{ await interaction.reply({ embeds: [embeds[page]], components: [row] }).then(client.extra.log_g(client.logger, interaction.guild, 'Get Settings Command', 'Confirm Reply')); }
			catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - Get Settings Command', 'Reply Denied'); }

			let reply = undefined;
			try{reply = await interaction.fetchReply().then(client.extra.log_g(client.logger, interaction.guild, 'Get Settings Command', 'Fetch Reply'));}
			catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - Get Settings Command', 'Reply Denied'); }

			try{if(reply == undefined) return await interaction.channel.send('Looks like something wrong happened! Forward this error code: **FRLB1** to TheKWitt @ https://discord.com/invite/BYVD4AGmYR!');}
			catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - Get Settings Command', 'Reply Denied'); }
			const filter = f => {
				return f.message.id == reply.id;
			};

			const collector = interaction.channel.createMessageComponentCollector({ filter, time: 120000 });
			collector.on('collect', async f => {
				if(f.user.id != interaction.user.id) {
					try{await interaction.reply({ content: 'You can\'t control this settings menu! It is only for ' + interaction.user.username + '!' }).then(client.extra.log_g(client.logger, interaction.guild, 'Get Settings Command', 'Confirm Reply')); }
					catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - Get Settings Command', 'Reply Denied'); }
				}

				if(f.customId === 'Left') {
					if(page != 0) {
						page--;
						embeds[page] = embeds[page].setFooter({ text: 'Controlled by ' + interaction.user.username + ' | Page ' + (page + 1) + '/' + (max_page + 1) + ' | Use Arrows to switch pages/rank' });
						try{await f.update({ embeds: [embeds[page]], components: [row] }).then(client.extra.log_g(client.logger, interaction.guild, 'Get Settings', 'Update Page Left'));}
						catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - Get Settings Command', 'Reply Denied'); }
					}
					else {
						try{await f.reply({ content: 'You are already on the first page!', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, 'Get Settings', 'Left Page Warning'));}
						catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - Get Settings Command', 'Reply Denied'); }
					}
				}
				else if(f.customId === 'Right') {
					if(page != max_page) {
						page++;
						embeds[page] = embeds[page].setFooter({ text: 'Controlled by ' + interaction.user.username + ' | Page ' + (page + 1) + '/' + (max_page + 1) + ' | Use Arrows to switch pages/rank' });
						try{await f.update({ embeds: [embeds[page]], components: [row] }).then(client.extra.log_g(client.logger, interaction.guild, 'Get Settings', 'Right Page Update'));}
						catch (err) {client.extra.log_error_g(client.logger, interaction.guild, 'Get Settings', 'Update Denied');}
					}
					else {
						try{await f.reply({ content: 'You are already on the last page!', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, 'Get Settings', 'Left Page Warning'));}
						catch (err) {client.extra.log_error_g(client.logger, interaction.guild, 'Get Settings', 'Reply Denied'); }
					}

				}
			});
			// eslint-disable-next-line no-unused-vars
			collector.on('end', async f => {
				const finished_row = new MessageActionRow()
					.addComponents(
						new MessageButton()
							.setCustomId('Left')
							.setLabel('⬅️')
							.setStyle('PRIMARY')
							.setDisabled(true),
					)
					.addComponents(
						new MessageButton()
							.setCustomId('Right')
							.setLabel('➡️')
							.setStyle('PRIMARY')
							.setDisabled(true),
					);
				try{ return await reply.edit({ embeds: [embeds[page]], components: [finished_row] }); }
				catch (err) { client.extra.log_error_g(client.logger, interaction.guild, 'Get Settings', 'End Reply Denied'); }
			});


		}
	},
};
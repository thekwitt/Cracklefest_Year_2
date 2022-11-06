const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

// eslint-disable-next-line no-unused-vars
function duplicates(arr, id) {
	let count = 0;
	for(let i = 0; i < arr.length; i++)
	{
		if (arr[i] === id) count++;
	}
	return count;
}

module.exports = {
	name: 'help',
	description: 'Get help for commands and how the bot works!',
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Get help for commands and how the bot works!')
		.addSubcommand(subcommand =>
			subcommand
				.setName('support')
				.setDescription('Get the link to the support server.'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('premium')
				.setDescription('Get an overview of the premium version of the bot!'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('quickguide')
				.setDescription('Get a quick guide on how the bot works!')
				.addStringOption(option =>
					option.setName('guide')
						.setDescription('What kind of help do you need?')
						.setRequired(true)
						.addChoice('User Quick Guide', 'user')
						.addChoice('Moderator Quick Guide', 'moderator')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('manual')
				.setDescription('Everything you need to know here!')
				.addStringOption(option =>
					option.setName('page')
						.setDescription('What kind of help do you need?')
						.setRequired(true)
						.addChoice('Overview of Bot', 'overview')
						.addChoice('Overview of Eggs, Coins and Upgrading', 'eggs')
						.addChoice('Overview of Baskets, Collection, And Display Cases', 'basket')
						.addChoice('Overview of Exploring and Clusters', 'cluster')
						.addChoice('Overview of Bosses and Drops', 'drop')
						.addChoice('Overview of Giving and Chucking', 'chuck')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('faq')
				.setDescription('Commonly answered questions now at your fingertips!')
				.addStringOption(option =>
					option.setName('question')
						.setDescription('What kind of question do you have?')
						.setRequired(true)
						.addChoice('How do I start the bot?', 'start')
						.addChoice('Why aren\'t drops spawning?', 'drop')
						.addChoice('Where are the slash commands?', 'slash')
						.addChoice('I got a warning about the roles. What does that mean?', 'roles')
						.addChoice('I got "Interaction Failed". What does that mean?', 'interaction')
						.addChoice('Can I change the language of the bot?', 'language')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('commands')
				.setDescription('Everything and anything about the commands!')
				.addStringOption(option =>
					option.setName('command')
						.setDescription('What command do you need explained?')
						.setRequired(true)
						.addChoice('Egg Commands', 'egg')
						.addChoice('Info Commands', 'info')
						.addChoice('Profile Commands', 'profile')
						.addChoice('Settings Commands (Moderator Only)', 'settings')
						.addChoice('Tool Commands (Moderator Only)', 'tools'))),
	// eslint-disable-next-line no-unused-vars
	async execute(interaction, client) {
		const page = interaction.options.getString('page');
		const guide = interaction.options.getString('guide');
		const question = interaction.options.getString('question');
		const command = interaction.options.getString('command');
		const subcommand = interaction.options.getSubcommand('subcommand');
		const embed = new MessageEmbed().setFooter('See what else you can learn from the bot!');

		const data = await client.pool.query('SELECT * FROM guild_settings WHERE Guild_ID = $1', [interaction.guildId]);
		const setting = data.rows[0];

		if(page != undefined) {
			switch(page) {
			case 'overview':
				embed
					.setColor('0xFFA500')
					.setTitle('📙   Overview of Bot   📙')
					.addField('What is this bot?', 'This is an Easter Incremental Game! Imagine Easter but with Rich RPG Lore! You collect eggs to get #1 on the server and earn a title or collect all 30 exclusive eggs to earn the collector title!', false)
					.addField('What do you do?', 'You collect eggs, sell them to the eggsmith for coins and upgrade your basket with said coins. You can gather eggs by exploring or opening egg clusters that spawn on your server!', false)
					.addField('How does ranking work?', 'The person who has the most in their basket gets the role! Alternatively, for those who don\'t want to grind, you can try to get all 30 rare eggs in the bot! You can check out the leaderboard using the **/leaderboard** command and what collectibles you are missing with the **/collection & /eggcheatsheet** commands!', false)
					.addField('How long is this bot going to last?', 'For the whole month of april! It won\'t end on april! The bot will be online till May 5th so you can see all the stats after the event ends!', false);
				try{return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, 'Help Command', ' Overview Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, 'Help Command', 'Overview Reply Denied');}
				break;
			case 'eggs':
				embed
					.setColor('0xFFA500')
					.setTitle('📙   Overview of Eggs, Coins and Upgrading   📙')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.addField('Eggs', 'Eggs are collectible objects you can get by exploring or opening clusters! Regulars eggs count towards the main objective which is getting the most eggs while rare eggs count towards your secondary objective which is getting all 30 rare eggs (5 in each area excluding The Arcane Void). Once you collect a rare egg, any duplicates will be put into your basket.\n\nYou can also display your favorite eggs in a display case! Use **/help manual Overview of Baskets, Collection, And Display Cases** to find out more! You can also use eggs to sabotage others with **/chuck** or use eggs to ambush bosses when they spawn!\n\n**Important: Eggs are labeled by IDs which can be found by click the emoji of that egg! (IDs will be replaced by name in a future update)**', false)
					.addField('Coins', 'Coins are used to upgrade your basket to hold more eggs and get access to other areas for egg hunting! Each coin is worth 10 eggs which can be sold using the **/sell** command!', false)
					.addField('Upgrading', 'Upgrading is an action you can do to your basket which is how you access new areas, hold more eggs and potentially get more eggs when hunting. In order to upgrade your basket, you need coins which is listed above.\n\n**The higher your level, the more coins you will need!**', false);
				try{return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, 'Help Command', ' Overview Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, 'Help Command', 'Overview Reply Denied');}
				break;
			case 'basket':
				embed
					.setColor('#FFA500')
					.setTitle('📙   Overview of Baskets, Collection, And Display Cases   📙')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.addField('Baskets', 'Baskets are where your eggs will be stored when collected. The only exception is rare eggs you collect for the very first time, those will be in your collection instead. Any rare eggs you collect again will be in the basket from than on!\n\nBaskets have a limit on how much they can be stored. To increase this limit you have to upgrade your basket, see **/help manual eggs** for more details on that. Each upgrade increase the limit by 25.', false)
					.addField('Collection', 'Collections are where your rare eggs will be initally stored that you haven\'t collected yet. There are a total of 30 rare eggs you can collect. Once your collection is full you will get a role for it!', false)
					.addField('Display Cases', 'Display Cases are where you can store your favorite eggs to show off to the rest of the server! In these display cases, eggs will **NOT** be sold when using the selling commands. You can see what you have and manage your case with **/case & /managecase**!\n\n**You can hold up to ' + (await client.extra.getPremium(interaction, client) ? '30' : ' 20') + ' eggs at a time!**', false);
				try{return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, 'Help Command', ' Overview Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, 'Help Command', 'Overview Reply Denied');}
				break;
			case 'cluster':
				embed
					.setColor('#FFA500')
					.setTitle('📙   Overview of Overview of Exploring and Clusters   📙')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.addField('Exploring', 'Exploring allows you to visit different areas with unique interactions and collect eggs! Each area has its own set of regular and rare eggs! There are 7 different areas in Coneyford! You can see them all with **/atlas**!\n\n**The Arcane Void does not unlock via upgrading, you\'ll have to beat bosses to unlock that.**', false)
					.addField('Clusters', 'Clusters are bundles of eggs that you can break apart to get any egg from areas you have unlocked based on your level! Clusters can hold ' + (setting.cluster_unwrap_amount - 1) + ' - ' + (setting.cluster_unwrap_amount + 1) + ' eggs at a time!', false);
				try{return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, 'Help Command', ' Overview Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, 'Help Command', 'Overview Reply Denied');}
				break;
			case 'drop':
				embed
					.setColor('#FFA500')
					.setTitle('📙   Overview of Bosses and Drops   📙')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.addField('Bosses', 'Bosses are events that sometimes spawn instead of drops, Beating bosses can award you with clusters but the more damage you do, the more clusters you will have based on other people on the server who also participate.\n\nThere are five bosses you can face. Four of them are Rabbit Chad, Arcane Sentinel, Crystal Guardian and Corrupted Giant Chicken. If you manage to defeat ' + setting.drop_finalboss_standard + ' bosses, you\'ll be able to face The Crimson Wizard himself in the next boss encounter which is harder than the other four. Beating him however will reward everyone with no only clusters but another item as well. You\'ll have to defeat him in order see.\n\nEach boss has two phases (except the Crimson Wizard who has three). Before the fight begins, you will be able to throw eggs at the boss to do up to 5% damage at the start, however, if you decide to throw eggs, it\'ll cost one egg for each time you press the button for it.', false)
					.addField('Drops', 'Drops are events that happen for people to collect clusters. You can collect one cluster per drop. In order to collect a cluster, you must match the top right egg with the button that looks like it. If you somehow mess up, you will lose some eggs.', false);
				try{return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, 'Help Command', ' Overview Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, 'Help Command', 'Overview Reply Denied');}
				break;
			case 'chuck':
				embed
					.setColor('#FFA500')
					.setTitle('📙   Overview of Giving and Chucking   📙')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.addField('Giving', 'Gifting allows you to give your favorite eggs to someone special! It\'ll **ONLY** take eggs from your basket though.', false)
					.addField('Chucking', 'Chucking is an action that you can perform to possibly sabotage others! You can take one egg from your basket and chuck it at another member for them to possibly drop 1 - 5 eggs!\n\n**There is a 60% chance for chucking to do nothing. 10% chance for them to catch the chuck. 30% chance for them to loose eggs from it.**', false);
				try{return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, 'Help Command', ' Overview Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, 'Help Command', 'Overview Reply Denied');}
				break;
			}
		} else if(question != undefined) {
			switch(question) {
			case 'start':
				embed
					.setColor('#FFA500')
					.setTitle('❓   How do I start the bot?   ❓')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription('⠀\nWhen you invite the bot, you will need to initialize the bot by using the **/setchannel** command! If the command throws out an error, make sure the bot has two key factors. \
					\n\nServer and Channel permission to send embedded messages outside of slash commands and use external emojis.\n\n⠀');
				try{return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, 'Help Command', ' Overview Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, 'Help Command', 'Overview Reply Denied');}
				break;
			case 'interaction':
				embed
					.setColor('#FFA500')
					.setTitle('❓   I got "Interaction Failed". What does that mean?   ❓')
				// eslint-disable-next-line spaced-comment
				//.setThumbnail(user.defaultAvatarURL)
					.setDescription('⠀\nOn rare occasions, discord doesn\'t send all the info the bot needs to get the job done or doesn\'t accept the bot send them info.\
					\n\nOn collecting drops, if you get this message, you got the drop but it just didn\'t allow the bot to send the message through.\
					\n\nOn commands, the bot will detect if this happens and restart any cooldowns you may have from using the command but nothing will be erased from your inventory.\n⠀');
				try{return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, 'Help Command', ' Overview Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, 'Help Command', 'Overview Reply Denied');}
				break;
			case 'drop':
				embed
					.setColor('#FFA500')
					.setTitle('❓   Why aren\'t drops spawning?   ❓')
				// eslint-disable-next-line spaced-comment
				//.setThumbnail(user.defaultAvatarURL)
					.setDescription('⠀\nThere are a few reasons why the bot does not spawn drops. The first reason could be denied access to send embedded messages and use external emojis.\
					\n\nPlease make sure that **Send Messages, Embed Links, and Use External Emoji** Permissions are ticked in the role and/or channel (only if you edit the channel to only have certain roles have sending perms).\
					\n\nAnother reason could be that the timer has not gone off yet. Please use the **/checkdrop** command to verify that it has not triggered.\
					\n\nIf any of these did not work, please head over to the support server with **/help support**.\n⠀');
				try{return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, 'Help Command', ' Overview Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, 'Help Command', 'Overview Reply Denied');}
				break;
			case 'slash':
				embed
					.setColor('#FFA500')
					.setTitle('❓   Where are the slash commands?   ❓')
				// eslint-disable-next-line spaced-comment
				//.setThumbnail(user.defaultAvatarURL)
					.setDescription('⠀\nSometimes discord may need time to have slash commands show up. It takes up to an hour for current and new commands to show up in servers if they do not appear.\
					\n\nOtherwise if you have more than 25 bots, it is possible that slash commands are prioritized to those first 25 bots. How it works is that only the first 25 invited bots can have their commands prioritized for your server.\
					\n\nYou will need to remove those bots in order to use this bot\'s functionality.\n⠀');
				try{return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, 'Help Command', ' Overview Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, 'Help Command', 'Overview Reply Denied');}
				break;
			case 'language':
				embed
					.setColor('#FFA500')
					.setTitle('❓   Can I change the language of the bot?   ❓')
				// eslint-disable-next-line spaced-comment
				//.setThumbnail(user.defaultAvatarURL)
					.setDescription('⠀\nSadly translating everything from the bot requires a lot of outsourcing which will take some time for people to hire for. This may not be available until Late 2022 or Early 2023 for future projects but if you wish to speed up the process for outsourcing, go ahead and use **/patreon** to see how effort can speed up the process.\n⠀');
				try{return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, 'Help Command', ' Overview Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, 'Help Command', 'Overview Reply Denied');}
				break;
			}
		} else if(command != undefined) {
			switch(command) {
			case 'egg':
				embed
					.setColor('#FFA500')
					.setTitle('📙   Egg Commands   📙')
				// eslint-disable-next-line spaced-comment
				//.setThumbnail(user.defaultAvatarURL)
					.addField('/hunt [Area]', 'Explore an area and get eggs!', false)
					.addField('/uncluster', 'Break apart a cluster in your inventory! (Check /card)', false)
					.addField('/chuck [Target User]', 'Throw an egg at someone to sabotage them!', false)
					.addField('/dailybox', 'Vote the bot on Top.gg to receive some special gifts! (One per day)', false)
					.addField('/sell', 'Sell as many coins as you can in multiples of 10 for coins!', false)
					.addField('/give [Egg ID]', 'Give an Egg to Someone. (Find Egg IDs on Emoji Labels)', false)
					.addField('/trade [Target User] [Your Egg ID] [Their Egg ID]', 'Trade one of your eggs for another person\'s egg. (Find Egg IDs on Emoji Labels)', false)
					.addField('/upgrade', 'Use coins to upgrade your basket to hold more eggs and have the ability to explore new areas and find more eggs!', false);
				try{return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, 'Help Command', ' Overview Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, 'Help Command', 'Overview Reply Denied');}
				break;
			case 'info':
				embed
					.setColor('#FFA500')
					.setTitle('📙   Info Commands   📙')
				// eslint-disable-next-line spaced-comment
				//.setThumbnail(user.defaultAvatarURL)
					.addField('/backstory', 'See how the story begins!', false)
					.addField('/help', 'The Everything and Anything!', false)
					.addField('/credits', 'Get info about the bot and it\'s creators!', false)
					.addField('Support (/help support)', 'Shows a link to the support server!', false)
					.addField('/invite', 'Get the invite link for the bot!.', false)
					.addField('/atlasindex', 'Get a map of Coneyford!', false)
					.addField('/rare_egg_lottery [Coins]', 'Spend up to ten coins to get a rare egg!', false)
					.addField('/bossindex', 'Get an overview of a boss!', false)
					.addField('/eggindex', 'Get an overview of an egg!', false)
					.addField('/eggdex', 'Get a page view of all the eggs you\'ve collected!', false)
					.addField('/donate', 'Get the donation and patreon page!', false)
					.addField('/eggcheatsheet', 'See where the eggs are located!', false);
				try{return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, 'Help Command', ' Overview Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, 'Help Command', 'Overview Reply Denied');}
				break;
			case 'settings':
				embed
					.setColor('#FFA500')
					.setTitle('📙   Setting Commands   📙')
				// eslint-disable-next-line spaced-comment
				//.setThumbnail(user.defaultAvatarURL)
					.addField('Standard Commands', '⠀', false)
					.addField('/settings basic set_channel_trigger', 'Set the drop to trigger by messages from the drop channel or outside of it!', false)
					.addField('/settings basic set_active_role', 'Set if you want the bot to auto manage the roles.', false)
					.addField('/settings basic set_boss_difficulty', 'Set the difficulty of all the bosses.', false)
					.addField('/settings basic set_delete_overtime', 'Set drops to delete over time to prevent cluster.', false)
					.addField('/settings basic set_grab_amount', 'Set how many people are allowed to grab a drop per message.', false)
					.addField('/settings basic set_interval', 'Set how long it takes for a drop to appear.', false)
					.addField('/settings basic set_message_count', 'Set how many messages it takes for a drop to appear.', false)
					.addField('/settings basic set_rarity_eggs', 'Set the rarity for a rare egg to be hunted.', false)
					.addField('/settings basic togglechannel', 'Toggle a channel to be excluded or included for slash commands from this bot.', false)
					.addField('⠀\n\nPremium Commands (Patreon Only)', '⠀', false)
					.addField('/settings advanced set_clusters_unwrap_amount', 'Set how many eggs get unwrapped per cluster', false)
					.addField('/settings advanced set_duration', 'Set how long an egg cluster drop lasts.', false)
					.addField('/settings advanced set_finalboss_count', 'Set how many bosses it takes to spawn the final boss.', false)
					.addField('/settings advanced set_hunt_multiplier', 'Set the multiplier for the hunt command.', false)
					.addField('/settings advanced set_requirement_multiplier', 'Set the requirement percentage for upgrading your basket.', false)
					.addField('/settings advanced set_leaderboard_name', 'Set the name for members on the leaderboard.', false)
					.addField('/settings advanced setcmdcooldown', 'Set the cooldown for commands.', false);
				try{return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, 'Help Command', ' Overview Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, 'Help Command', 'Overview Reply Denied');}
				break;
			case 'tools':
				embed
					.setColor('#FFA500')
					.setTitle('📙   Tool Commands   📙')
				// eslint-disable-next-line spaced-comment
				//.setThumbnail(user.defaultAvatarURL)
					.addField('/fillbasket [User Mention]', 'Fill someone\'s basket will regular eggs! (Only includes eggs for areas they have access to!)', false)
					.addField('/setlevel [User Mention / Role Mention] [Level]', 'Set the level for someone!', false)
					.addField('/addcoins [User Mention / Role Mention] [Coins]', 'Add the amount of coins for someone!', false)
					.addField('/addclusters [User Mention / Role Mention] [Clusters]', 'Add the amount of clusters for someone!', false)
					.addField('/erasemember', 'Erase the bot\'s data for someone on the server!', false)
					.addField('/eraseserver', 'Wipe the server\'s data (**CANNOT BE UNDONE**)', false)
					.addField('/dropclock', 'See when the next drop/boss spawns!', false)
					.addField('/setchannel', 'Set the channel for drop/bosses to spawn!', false);
				try{return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, 'Help Command', ' Overview Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, 'Help Command', 'Overview Reply Denied');}
				break;
			case 'profile':
				embed
					.setColor('#FFA500')
					.setTitle('📙   Profile Commands   📙')
				// eslint-disable-next-line spaced-comment
				//.setThumbnail(user.defaultAvatarURL)
					.addField('/card', 'Get your inventory and stats!', false)
					.addField('/basket', 'Display your eggs!', false)
					.addField('/collection', 'Display your rare eggs!', false)
					.addField('/leaderboard', 'Get a leaderboard of a stat!', false)
					.addField('/case', 'Display your saved eggs!', false)
					.addField('/managecase', 'Manage your saved eggs!', false);
				try{return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, 'Help Command', ' Overview Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, 'Help Command', 'Overview Reply Denied');}
				break;
			}
		}

		if(guide != undefined && guide == 'user') {
			embed
				.setColor('#FFA500')
				.setTitle('📙   User Quickguide  📙')
				// eslint-disable-next-line spaced-comment
				//.setThumbnail(user.defaultAvatarURL)
				.addField('The Beginning', 'Hello! Welcome to the game! Your job is to collect as many eggs as you can! You can start by using the **/hunt The Cottontail Valley** command to get some eggs! Hunting is one of the two ways to get eggs!\n\nWhile you wait for the command to refresh, look in the chat where your mods setup something called "drops". Drops are messages that you can interact with by collecting bundles of eggs called "Clusters"! After you successfully get a cluster, go ahead and try out a command called **/uncluster** to break it for more eggs!\n\nYour hunt command should be ready to use again so go ahead and run that bad boy! Now you are in a pretty good loop where you can collect eggs as far as you can! Check out all your eggs with **/basket**!\n⠀', false)
				.addField('The True Hunting Begins', 'Wow that is a lot of eggs you got there! There is a nifty command called **/sell** that you can use to sell your eggs! Why sell your eggs? To upgrade your basket! If you upgrade your basket, you can hold more eggs to get ahead of the rest of the server! If you think you have enough coins, try out the **/upgrade** command!\n⠀', false)
				.addField('New Area Unlocked', 'Looks like you just reached a high enough level for a new area! Now you can hunt for eggs you haven\'t seen before! There are seven areas you can hunt in that total over 400 eggs!\n⠀', false)
				.addField('I got rare eggs?', 'Very nice you got an ultra rare egg! There are 30 in total you can collect for a awesome collection! You can see your collection with **/collection**!\n⠀', false)
				.addField('I want to keep a cool egg!', 'Well you are in luck! Click on the emoji to see a 5 digit number, then use the **/managecase** command to type in that 5 digit id number! That\'ll save your egg in your very own display case! Check it out with **/case**!\n⠀', false)
				.addField('In Short', 'Hunt for Eggs, Sell Them, Upgrade Your basket, Break Clusters and Kill Bosses to get more eggs and unlock a secret area!\n\n**For more info, check out the rest of the help command!**\n⠀', false);
			try{return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, 'Help Command', ' Overview Reply'));}
			catch (err) {client.extra.log_error_g(client.logger, interaction.guild, 'Help Command', 'Overview Reply Denied');}
		} else if (guide != undefined && guide == 'moderator') {
			embed
				.setColor('#FFA500')
				.setTitle('📙   Moderator Quickguide  📙')
				// eslint-disable-next-line spaced-comment
				//.setThumbnail(user.defaultAvatarURL)
				.addField('The Setup', 'Hey Mods! Thanks for adding the bot! Here is how you get started! Go ahead and use the **/setchannel** command where you want to have eggs spawn! You can either do this in the general chat or a specific chat to divide the activity! Don\'t worry, commands will not be limited to that channel!\n⠀', false)
				.addField('Customization', 'You can customize awhole LOT of settings to your liking in this bot! Most of them are free while some of the advanced options are only for patreon users (Only $2 for EVERYTHING)! Check out the settings you can customize with **/help commands settings**!\n⠀', false)
				.addField('Tools', 'There are some tools you can use to ramp up the bot! Go ahead and check out **/help commands tools**!\n⠀', false)
				.addField('Support', 'Have a question or feature request? Check out **/help supprt**!\n⠀', false);
			try{return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, 'Help Command', ' Overview Reply'));}
			catch (err) {client.extra.log_error_g(client.logger, interaction.guild, 'Help Command', 'Overview Reply Denied');}
		}

		if(subcommand == 'premium') {
			embed
				.setColor('#FFA500')
				.setTitle('📙   Premium Features   📙')
			// eslint-disable-next-line spaced-comment
			//.setThumbnail(user.defaultAvatarURL)
				.addField('Overview', 'My goal is to provide people with the most fun activities and give as much freedom with the bot as botily possible. However this requires alot of power to make work. By helping me on patreon, you\'ll be able to allow me to continue creating wonderful bots for your community and get some sweet perks along the way!\n⠀')
				.addField('Benefits of the Premium Version', '- Voting Restrictions Lifted for Daily Box!\n- Customization for Cooldowns and Multiplier for Hunting\n- Customizable Cluster Amount\n- Manually Set Level via Member And Role\n- Manually Add Eggs, Coins, Clusters Via Role\n- Manually Spawn Drops & Bosses\n- Change rarity on boss spawns\n- Change how many bosses it takes to summon the Crimson Wizard\n- Leaderboard Name Change\n- Add Eggs, Coins, Clusters Via Role\n- Drop Duration Control\n- Raise limit of display cases from 20 to 30\n⠀');
			try{return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, 'Help Command', ' Overview Reply'));}
			catch (err) {client.extra.log_error_g(client.logger, interaction.guild, 'Help Command', 'Overview Reply Denied');}
		}

		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setLabel('Support Server')
					.setStyle('LINK')
					.setURL('https://discord.gg/BYVD4AGmYR'),
			);

		embed.setColor(client.colors[0][0])
			.setTitle('🔗   Support Server!   🔗')
			// eslint-disable-next-line spaced-comment
			//.setThumbnail(user.defaultAvatarURL)
			.setDescription('⠀\nClick the button below to visit the support server!\n⠀');

		try{return await interaction.reply({ embeds: [embed], components: [row] }).then(client.extra.log_g(client.logger, interaction.guild, 'Invite Command', 'Bot Reply'));}
		catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' Command', 'Reply Denied');}

	},
};
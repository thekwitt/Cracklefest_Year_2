module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		await client.pool.query('	CREATE TABLE IF NOT EXISTS guild_settings(\
									Guild_ID bigint PRIMARY KEY,\
									Channel_Set bigint DEFAULT 0,\
									Trigger_Drop_Outside BOOLEAN DEFAULT TRUE,\
									Hunt_Multiplier INTEGER DEFAULT 100,\
									Drop_Message_Count INTEGER DEFAULT 10,\
									Drop_Obtain_Count INTEGER DEFAULT 3,\
									Drop_Time_Count INTEGER DEFAULT 300,\
									Drop_Duration INTEGER DEFAULT 60,\
									Drop_Boss_Chance INTEGER DEFAULT 20,\
									Drop_FinalBoss_Standard INTEGER DEFAULT 5,\
									Drop_FinalBoss_Left INTEGER DEFAULT 5,\
									Boss_Difficulty INTEGER DEFAULT 1,\
									Manage_Role BOOLEAN DEFAULT TRUE,\
									Leaderboard_Name TEXT DEFAULT \'Hero\',\
									Cluster_Unwrap_Amount INTEGER DEFAULT 3,\
									Channels_Exclude_Commands bigint[] DEFAULT \'{}\',\
									Delete_OT BOOLEAN DEFAULT TRUE,\
									Upgrade_Requirement_Multiplier INTEGER DEFAULT 100,\
									Rare_Egg_Percentage_Multiplier INTEGER DEFAULT 1,\
									Command_Cooldowns INTEGER[] DEFAULT\'{120,300}\'\
									);');

		await client.pool.query('	CREATE TABLE IF NOT EXISTS guild_stats(\
									Guild_ID bigint PRIMARY KEY,\
									Eggs_Collected INTEGER DEFAULT 0,\
									Boss_Spawned BOOLEAN[] DEFAULT \'{false,false,false,false,false}\',\
									Areas_Explored INTEGER[] DEFAULT \'{0,0,0,0,0,0,0}\',\
									Eggs_Sold INTEGER DEFAULT 0,\
									Trades_Count INTEGER DEFAULT 0, \
									Lottery_Results INTEGER[] DEFAULT \'{0,0}\', \
									Daily_Openings INTEGER DEFAULT 0,\
									Cluster_Spawns INTEGER DEFAULT 0,\
									Boss_Spawns INTEGER DEFAULT 0,\
									Upgrades INTEGER DEFAULT 0\
									);');

		await client.pool.query('	CREATE TABLE IF NOT EXISTS user_data(\
									Guild_ID bigint,\
									Member_ID bigint,\
									First_Time BOOLEAN DEFAULT FALSE,\
									Gold_Coins INTEGER DEFAULT 0,\
									Basket_Level INTEGER DEFAULT 1,\
									Basket_Eggs INTEGER[] DEFAULT \'{}\',\
									Case_Eggs INTEGER[] DEFAULT \'{}\',\
									Collection_Eggs INTEGER[] DEFAULT \'{}\',\
									Arcane_Key BOOLEAN DEFAULT FALSE,\
									Clusters INTEGER DEFAULT 0,\
									PRIMARY KEY (Guild_ID, Member_ID)\
									);');

		await client.pool.query('	CREATE TABLE IF NOT EXISTS user_stats(\
									Guild_ID bigint,\
									Member_ID bigint,\
									Eggs_Collected INTEGER DEFAULT 0,\
									Boss_Spawned BOOLEAN[] DEFAULT \'{false,false,false,false,false}\',\
									Areas_Explored INTEGER[] DEFAULT \'{0,0,0,0,0,0,0}\',\
									Eggs_Sold INTEGER DEFAULT 0,\
									Trades_Count INTEGER DEFAULT 0, \
									Lottery_Results INTEGER[] DEFAULT \'{0,0}\', \
									Daily_Openings INTEGER DEFAULT 0,\
									Clusters_Collected INTEGER DEFAULT 0,\
									Upgrades INTEGER DEFAULT 0,\
									PRIMARY KEY (Guild_ID, Member_ID)\
									);');

		const guild = client.guilds.cache.find(g => g.id == '451929862794641409');
		// await guild.commands.set([]).then(console.log).catch(console.error);
		await guild.members.fetch();
		client.ready[0] = true;

		client.extra.simple_log(client.logger, 'Bot is ready');
	},
};
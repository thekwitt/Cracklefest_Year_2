const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');

// eslint-disable-next-line no-unused-vars

module.exports = {
	name: 'spawnboss',
	description: 'Spawn a boss early!',
	data: new SlashCommandBuilder()
		.setName('spawnboss')
		.setDescription('Spawn a boss early!'),
	permission: 'MANAGE_CHANNELS',
	// eslint-disable-next-line no-unused-vars
	async execute(interaction, client) {
		const premium = await client.extra.getPremium(interaction, client);
		if(premium == false && interaction.user.id != 198305088203128832) {
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

		const messageSpawn = client.messages.get(interaction.guildId);

		if(messageSpawn.get('activeMessage') == true) {
			try{return await interaction.reply({ content: 'A drop or boss has already spawned! Wait until it is done to do another!' }).then(client.extra.log_g(client.logger, interaction.guild, 'About Command', 'Bot Reply'));}
			catch{client.extra.log_error_g(client.logger, interaction.guild, 'About Command', 'Reply Denied');}
			return;
		}

		messageSpawn.set('activeMessage', true);
		client.messages.set(interaction.guildId, messageSpawn);

		try{await interaction.reply({ content: 'Boss Spawned!!', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'No Clusters Warning Reply'));}
		catch (err) {client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied');}

		const data = await client.pool.query('SELECT * FROM guild_settings WHERE Guild_ID = $1', [interaction.guildId]);
		const setting = data.rows[0];

		let channel = undefined;
		channel = interaction.channel;

		if(setting.drop_finalboss_left <= 0) {
			await client.extra.summon_finalboss.execute(interaction, client, setting.channel_set, messageSpawn);
			await client.pool.query('UPDATE guild_settings SET drop_finalboss_left = Drop_FinalBoss_Standard WHERE Guild_ID = $1', [interaction.guildId]);
			client.extra.reloadMessageDrop(interaction.guild, client);
		} else {
			await client.extra.summon_bosses[client.extra.getRandom([0, 1, 3, 4])].execute(interaction, client, setting.channel_set, messageSpawn);
			client.extra.reloadMessageDrop(interaction.guild, client);

			await client.extra.sleep(5000);

			const data2 = await client.pool.query('SELECT * FROM guild_settings WHERE Guild_ID = $1', [interaction.guildId]);
			const setting2 = data2.rows[0];

			if(setting2.drop_finalboss_left <= 0) {
				const embed = new MessageEmbed()
					.setColor('#8620d4')
					.setTitle('You feel uneasy..')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription('*You hear a voice in your head.*\n\n**"My time has finally come mortals. Will you strike me down and end this war? We shall see.."**')
					.setFooter({ text: 'A powerful boss fight awaits you.' });

				try{ await channel.send({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, 'Message Create Event', 'Fear Send'));}
				catch (err) {
					client.extra.log_error_g(client.logger, interaction.guild, 'Message Create Event', 'Send Denied - ' + err.toString());
				}
			}
		}
	},
};
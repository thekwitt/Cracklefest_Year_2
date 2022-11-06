const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
	name: 'setlevel',
	description: 'Set someone\'s level',
	data: new SlashCommandBuilder()
		.setName('setlevel')
		.setDescription('Set someone\'s level')
		.addSubcommand(subcommand =>
			subcommand
				.setName('user')
				.setDescription('Set a user\'s level.')
				.addUserOption(option => option.setName('target').setDescription('The Person you want to set the level to.').setRequired(true))
				.addIntegerOption(option => option.setName('level').setDescription('What level?').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('role')
				.setDescription('Set users\' level via a role.')
				.addRoleOption(option => option.setName('role').setDescription('The role you want to set the level to.').setRequired(true))
				.addIntegerOption(option => option.setName('level').setDescription('What level?').setRequired(true))),
	permission: 'MANAGE_CHANNELS',
	async execute(interaction, client) {
		const guildId = interaction.guildId;

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
				.setDescription('⠀\nLooks like you haven\'t purchased the patreon package! For only **$2** You can use this command and many others along with other servers who have premium as well!. Check out the link for more info especially if you haven\'t purchased it yet.\n⠀')
				.setFooter('If you have already purchased it, try out /premium verify');

			try{return await interaction.reply({ embeds: [e], components: [row] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'Bot Reply'));}
			catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - ' + this.name + ' Command', 'Reply Denied');}
		}


		const subcommand = interaction.options.getSubcommand('subcommand');
		const level = interaction.options.getInteger('level');
		const target = interaction.options.getUser('target');
		const role = interaction.options.getRole('role');

		if(level > 50 || level < 1)
		{
			interaction.reset_cooldown = true;
			try{return await interaction.reply({ content: 'You can only manually set a level between 1 - 50!', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'No gift Warning Reply'));}
			catch (err) {client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied');}
		}

		if(subcommand == 'user') {
			if(target.bot) {
				interaction.reset_cooldown = true;
				try{return await interaction.reply({ content: target.username + ' is a bot. It doesn\'t need coins since it is already rich with content!', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'No gift Warning Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied');}
			}

			await client.pool.query('INSERT INTO user_data (Guild_ID, Member_ID) VALUES ($1, $2) ON CONFLICT DO NOTHING;', [guildId, target.id]);
			await client.pool.query('UPDATE user_data SET basket_level = $1 WHERE Guild_ID = $3 AND Member_ID = $2;', [level, target.id, guildId]);

			const embed = new MessageEmbed()
				.setColor(client.colors[0][2])
				.setTitle(target.username + ' was granted level ' + level + '!')
				// eslint-disable-next-line spaced-comment
				//.setThumbnail(user.defaultAvatarURL)
				.setDescription('⠀\n' + target.username + ' was suddenly given a miracle of being level ' + level + '!⠀');

			try { return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'Gave ID Reply')); }
			catch (err) { client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied'); }
		} else if (subcommand == 'role') {

			const members = Array.from(role.members.values());
			const ids = [];

			for(let i = 0; i < members.length; i++) {
				if(members[i].user.bot == false) {
					ids.push(members[i].user.id);
				}
			}

			if(ids.length == 0) {
				interaction.reset_cooldown = true;
				try{return await interaction.reply({ content: 'Looks like this role has no humans! Try again with another role!', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'No gift Warning Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied');}
			}

			await client.pool.query('INSERT INTO user_data (Guild_ID, Member_ID) VALUES ($1, UNNEST($2::bigint[])) ON CONFLICT DO NOTHING;', [guildId, ids]);
			await client.pool.query('UPDATE user_data SET gold_coins = gold_coins + $1 WHERE Guild_ID = $3 AND Member_ID = ANY($2);', [level, ids, guildId]);

			const embed = new MessageEmbed()
				.setColor(client.colors[0][2])
				.setTitle('A mod gave some coins away!')
				// eslint-disable-next-line spaced-comment
				//.setThumbnail(user.defaultAvatarURL)
				.setDescription('⠀\nEveryone who has the ' + role.name + ' role was granted a miracle of being level' + level + '!' + '\n\nNow that is some hardcore crackling!\n⠀')
				.setFooter('Check them out with /inventory!');

			try { return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'Gave ID Reply')); }
			catch (err) { client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied'); }

		}
	},
};
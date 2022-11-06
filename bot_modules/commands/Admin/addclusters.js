const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
	name: 'addclusters',
	description: 'Add clusters to someone\'s inventory!',
	data: new SlashCommandBuilder()
		.setName('addclusters')
		.setDescription('Add clusters to someone\'s inventory!')
		.addSubcommand(subcommand =>
			subcommand
				.setName('user')
				.setDescription('Add clusters to a user.')
				.addUserOption(option => option.setName('target').setDescription('The Person you want to add clusters to.').setRequired(true))
				.addIntegerOption(option => option.setName('amount').setDescription('How many clusters?').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('role')
				.setDescription('Add clusters to users of a role.')
				.addRoleOption(option => option.setName('role').setDescription('The role you want to add clusters to.').setRequired(true))
				.addIntegerOption(option => option.setName('amount').setDescription('How many clusters?').setRequired(true))),
	permission: 'MANAGE_CHANNELS',
	async execute(interaction, client) {
		const guildId = interaction.guildId;

		const subcommand = interaction.options.getSubcommand('subcommand');
		const amount = interaction.options.getInteger('amount');
		const target = interaction.options.getUser('target');
		const role = interaction.options.getRole('role');

		if(amount > 100 || amount < 1)
		{
			interaction.reset_cooldown = true;
			try{return await interaction.reply({ content: 'You can only add 1 - 100 clusters at a time!', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'No gift Warning Reply'));}
			catch (err) {client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied');}
		}

		if(subcommand == 'user') {
			if(target.bot) {
				interaction.reset_cooldown = true;
				try{return await interaction.reply({ content: target.username + ' is a bot. It doesn\'t need clusters since it is already rich with content!', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'No gift Warning Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied');}
			}

			await client.pool.query('INSERT INTO user_data (Guild_ID, Member_ID) VALUES ($1, $2) ON CONFLICT DO NOTHING;', [guildId, target.id]);
			await client.pool.query('UPDATE user_data SET clusters = clusters + $1 WHERE Guild_ID = $3 AND Member_ID = $2;', [amount, target.id, guildId]);

			const embed = new MessageEmbed()
				.setColor(client.colors[0][2])
				.setTitle(target.username + ' got ' + amount + ' cluster' + (amount > 1 ? 's' : '') + '!')
				// eslint-disable-next-line spaced-comment
				//.setThumbnail(user.defaultAvatarURL)
				.setDescription('⠀\n' + target.username + ' got ' + amount + ' cluster' + (amount > 1 ? 's' : '') + '!\n\nNow that is some hardcore crackling!\n⠀')
				.setFooter('Check them out with /inventory!');

			try { return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'Gave ID Reply')); }
			catch (err) { client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied'); }
		} else if (subcommand == 'role') {

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
			await client.pool.query('UPDATE user_data SET clusters = clusters + $1 WHERE Guild_ID = $3 AND Member_ID = ANY($2);', [amount, ids, guildId]);

			const embed = new MessageEmbed()
				.setColor(client.colors[0][2])
				.setTitle('A mod gave some clusters away!')
				// eslint-disable-next-line spaced-comment
				//.setThumbnail(user.defaultAvatarURL)
				.setDescription('⠀\nEveryone who has the ' + role.name + ' role got ' + amount + ' cluster' + (amount > 1 ? 's' : '') + '!' + '\n\nNow that is some hardcore crackling!\n⠀')
				.setFooter('Check them out with /inventory!');

			try { return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'Gave ID Reply')); }
			catch (err) { client.extra.log_error_g(client.logger, interaction.guild, this.name + ' Command ' + String(err), 'Reply Denied'); }

		}
	},
};
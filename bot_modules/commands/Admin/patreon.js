const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

// eslint-disable-next-line no-unused-vars

module.exports = {
	name: 'premium',
	description: 'Everything you need for your premium right here!',
	data: new SlashCommandBuilder()
		.setName('premium')
		.setDescription('Everything you need for your premium right here!')
		.addStringOption(option =>
			option.setName('choice')
				.setDescription('Type of Premium Action')
				.setRequired(true)
				.addChoice('Status', 'status')
				.addChoice('Verify Server', 'verify')),
	permission: 'MANAGE_CHANNELS',
	// eslint-disable-next-line no-unused-vars
	async execute(interaction, client) {
		const dedicated_json = await client.extra.getJson('premium');
		const dedicated = dedicated_json.premium;

		const data = await client.patreon.query('SELECT * FROM existing');
		const exist_data = data.rows;

		const choice = interaction.options.getString('choice');

		if(choice == 'status') {
			const existing = exist_data.filter(obj => obj.guild_id == interaction.guildId);

			if(existing.length == 0 && dedicated.filter(obj => obj.guild_id == interaction.guildId).length == 0) {
				const embed = new MessageEmbed()
					.setColor('#EA2B2B')
					.setTitle('⛔︎   Premium Not Enabled   ⛔︎')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription('⠀\nLooks like you\'re premium status is not activated yet. If you have are a patreon but haven\'t activated the bot yet, use **/premium verify**!\n⠀');

				try{return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'Bot Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - ' + this.name + ' Command', 'Reply Denied');}
			} else if(existing.length != 0 || dedicated.filter(obj => obj.guild_id == interaction.guildId).length != 0) {
				const embed = new MessageEmbed()
					.setColor('#7CEA2B')
					.setTitle('✅   Premium Enabled   ✅')
					// eslint-disable-next-line spaced-comment
					//.setThumbnail(user.defaultAvatarURL)
					.setDescription('⠀\nYou are good to go!\n⠀');

				try{return await interaction.reply({ embeds: [embed] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'Bot Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - ' + this.name + ' Command', 'Reply Denied');}

			}
		} else if(choice == 'verify') {
			let existing = exist_data.filter(obj => obj.guild_id == interaction.guildId);

			if(existing.length != 0 || dedicated.filter(obj => obj.guild_id == interaction.guildId).length != 0) {
				try{return await interaction.reply({ content: 'This server is already premium! No need to reverify!' }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'Bot Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - ' + this.name + ' Command', 'Reply Denied');}

			}

			existing = exist_data.filter(obj => obj.user_id == interaction.user.id);
			if(existing.length == 0) {
				const row = new MessageActionRow()
					.addComponents(
						new MessageButton()
							.setLabel('Patreon Link')
							.setStyle('LINK')
							.setURL('https://www.patreon.com/thekwitt'),
					);


				try{return await interaction.reply({ content: 'Looks like you haven\'t purchased the patreon package! Remember you have to link your patreon account to discord! Check out the link for more info especially if you haven\'t purchased it yet.', components: [row] }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'Bot Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - ' + this.name + ' Command', 'Reply Denied');}
			} else if(existing.length != 0) {
				await client.patreon.query('UPDATE existing SET guild_id = $1 WHERE User_ID = $2', [interaction.guild.id, interaction.user.id]);
				try{return await interaction.reply({ content: 'Congrats! Your server is now activated for premium features! Check out everything with **/help manual premium**!' }).then(client.extra.log_g(client.logger, interaction.guild, this.name + ' Command', 'Bot Reply'));}
				catch (err) {client.extra.log_error_g(client.logger, interaction.guild, String(err) + ' - ' + this.name + ' Command', 'Reply Denied');}

			}
		}
	},
};
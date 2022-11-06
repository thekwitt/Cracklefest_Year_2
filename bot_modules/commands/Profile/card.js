const { registerFont, createCanvas, loadImage } = require('canvas');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment } = require('discord.js');

// eslint-disable-next-line no-unused-vars

function return_title(num) {
	const nums = [0, 50, 100, 250, 500, 1000, 2000, 3000, 4000, 5000, 7500, 10000];
	const titles = ['Cracklefest Visitor', 'Cracklefest Scout', 'Cracklefest Explorer', 'Cracklefest Wanderer', 'Cracklefest Traveler', 'Cracklefest Collector', 'Cracklefest Sightseer', 'Cracklefest Rover', 'Cracklefest Globetrotter', 'Cracklefest Gadabout', 'Cracklefest Crimsoner', 'Cracklefest Ape'];

	for(let i = nums.length - 1; i >= 0; i--) {
		if (num >= nums[i]) {
			return titles[i];
		}
	}
}


module.exports = {
	name: 'card',
	description: 'View the user\'s egg card.',
	cooldown: 10,
	data: new SlashCommandBuilder()
		.setName('card')
		.setDescription('View the user\'s egg card.')
		.addUserOption(option => option.setName('target').setDescription('The card of that user.')),
	// eslint-disable-next-line no-unused-vars
	async execute(interaction, client) {
		const raw_data = await client.pool.query('SELECT * FROM user_data WHERE Guild_ID = $1;', [interaction.guildId]);
		const data = raw_data.rows;

		const raw_stats = await client.pool.query('SELECT * FROM user_stats WHERE Guild_ID = $1;', [interaction.guildId]);
		const sass = raw_stats.rows;

		const set = await client.pool.query('SELECT * FROM guild_settings WHERE Guild_ID = $1', [interaction.guildId]);
		const setting = set.rows[0];

		let d = undefined;

		if(setting.rank_type == 0) d = client.extra.playOrganizer(data, 1);
		else if (setting.rank_type == 1) d = client.extra.playOrganizer(data, 8);
		else if (setting.rank_type == 2) d = client.extra.playOrganizer(sass, 3);

		const target = interaction.options.getUser('target');
		let user = interaction.user;
		if (target != undefined) {user = target;}
		// Get User Index

		if (target && !target.bot)
		{
			user = target;
			await client.pool.query('INSERT INTO user_data (Member_ID, Guild_ID) VALUES ($1, $2) ON CONFLICT DO NOTHING;', [target.id, interaction.guildId]);
		}
		else if (target && target.bot) {
			try{return await interaction.reply({ content: target.username + ' is a bot. It doesn\'t need presents since the greatest gift is you using the bot!', ephemeral: true }).then(client.extra.log_g(client.logger, interaction.guild, 'Give Command', 'No Present Warning Reply'));}
			catch{client.extra.log_error_g(client.logger, interaction.guild, 'Card Command', 'Reply Denied');}
		}

		const user_index = d.map(x => x[0]).indexOf(user.id);

		const user_bag = await client.pool.query('SELECT * FROM user_data WHERE Member_ID = $1 AND Guild_ID = $2;', [user.id, interaction.guildId]);

		const u = user_bag.rows[0];

		const statsd = await client.pool.query('SELECT * FROM user_stats WHERE Member_ID = $1 AND Guild_ID = $2;', [user.id, interaction.guildId]);

		const stats = statsd.rows[0];


		registerFont('./card/Count.ttf', { family: 'name' });
		registerFont('./card/Points.ttf', { family: 'points' });
		registerFont('./card/Rank.ttf', { family: 'ranks' });
		registerFont('./card/Title.ttf', { family: 'title' });
		registerFont('./card/LB.ttf', { family: 'server' });

		const canvas = createCanvas(1200, 500);
		const context = canvas.getContext('2d');
		const background = await loadImage('./card/Card.png');

		context.drawImage(background, 0, 0, canvas.width, canvas.height);

		context.fillStyle = '#c5e7e4';
		context.font = '60px title';
		context.fillText(user.username, 185, 88);

		context.fillStyle = '#74ccd1';
		context.font = '32px "ranks"';
		context.fillText('Level ' + u.basket_level + ' | ' + return_title(stats.eggs_collected), 185, 143);

		context.fillStyle = '#52b586';
		context.font = '50px points';
		context.fillText('Basket - ' + client.extra.nFormatter(u.basket_eggs.length, 2), 40, 320);

		context.fillStyle = '#80c4b8';
		context.font = '50px points';
		context.fillText('Collection - ' + client.extra.nFormatter(u.collection_eggs.length, 2).toString() + ' / 30', 40, 390);

		context.fillStyle = '#53adbc';
		context.font = '50px points';
		context.fillText('Net Collected - ' + client.extra.nFormatter(stats.eggs_collected, 2).toString(), 40, 460);

		context.fillStyle = '#FFFFFF';
		context.strokeStyle = 'black';
		context.textAlign = 'center';

		context.lineWidth = (u.clusters < 100 ? 3 : 2.5);
		context.font = (u.clusters < 100 ? 60 : (u.clusters >= 1000 ? 45 : 50)) + 'px server';
		context.fillText(client.extra.nFormatter(u.clusters, 1).toString() + '', 1098, (u.clusters <= 100 ? 313 : (u.clusters >= 1000 ? 300 : 307)));
		context.strokeText(client.extra.nFormatter(u.clusters, 1).toString() + '', 1098, (u.clusters <= 100 ? 313 : (u.clusters >= 1000 ? 300 : 307)));

		context.lineWidth = (u.gold_coins < 100 ? 3 : 2.5);
		context.font = (u.gold_coins < 100 ? 60 : (u.gold_coins >= 1000 ? 40 : 45)) + 'px server';
		context.fillText(client.extra.nFormatter(u.gold_coins, 1).toString() + '', 1099, (u.clusters <= 100 ? 123 : (u.clusters >= 1000 ? 112 : 117)));
		context.strokeText(client.extra.nFormatter(u.gold_coins, 1).toString() + '', 1099, (u.clusters <= 100 ? 123 : (u.clusters >= 1000 ? 112 : 117)));

		context.fillStyle = '#60c5e8';
		context.textAlign = 'end';
		context.font = '60px name';
		if(d.length == 0) {
			context.fillText('Unranked', 1175, 468);
		} else {
			context.fillText('Rank: ' + (user_index + 1).toString().padStart(4, '0') + '', 1175, 468);
		}

		context.beginPath();
		context.arc(95, 95, 65, 0, Math.PI * 2, true);
		context.closePath();
		context.clip();

		const avatar = await loadImage(user.displayAvatarURL({ format: 'jpg' }));
		context.drawImage(avatar, 30, 30, 130, 130);

		// End
		const attachment = new MessageAttachment(canvas.toBuffer(), user.username + '_' + Date.now().toString() + '.png');

		try{await interaction.reply({ files: [attachment] }).then(client.extra.log_g(client.logger, interaction.guild, 'Card Command', 'Bot Reply'));}
		catch{client.extra.log_error_g(client.logger, interaction.guild, 'Card Command', 'Reply Denied');}

	},
};
const { Perms } = require('../validations/Permissions');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { promisify } = require('util');
const { glob } = require('glob');
const PG = promisify(glob);
const Ascii = require('ascii-table');

/**
 * @param {Client} client
 */

module.exports = async (client, token) => {
	const Table = new Ascii('Commands Loaded');

	const CommandsArray = [];

	(await PG(process.cwd() + '/bot_modules/commands/*/*.js')).map (async (file) => {
		const command = require(file);

		if(!command.name) return Table.addRow(file.split('/')[7], '🔸 FAILED', 'Missing a name.');

		if(!command.description) return Table.addRow(file.split('/')[7], '🔸 FAILED', 'Missing a description.');

		if(command.permission) {
			if(Perms.includes(command.permission)) command.defaultPermission = false;
			else return Table.addRow(file.split('/')[7], '🔸 FAILED', 'Permission is invalid');
		}

		Array.from(client.commands.keys());

		client.commands.set(command.name, command);
		CommandsArray.push(command.data.toJSON());


		await Table.addRow(command.name, '🔹 SUCCESSFUL');
	});

	client.extra.simple_log(client.logger, Table.toString());
	const obj2 = client.commands;
	for(let i = 0; i < CommandsArray.length; i++)
	{
		if(CommandsArray[i].options) {
			obj2.get(CommandsArray[i].name).options = CommandsArray[i].options;
		}
	}

	const rest = new REST({ version: '9' }).setToken(token);

	(async () => {
		try {
			client.extra.simple_log(client.logger, 'Started refreshing application (/) commands.');

			await rest.put(
				// Routes.applicationCommands('806593617886969872'),
				Routes.applicationGuildCommands('516731455506743310', '451929862794641409'),
				// Routes.applicationGuildCommands('516731455506743310', '746399419460616193'),
				{ body: obj2 },
			);

			client.extra.simple_log(client.logger, 'Successfully reloaded application (/) commands.');
		} catch (error) {
			client.extra.simple_log(client.logger, error);
		}
	})();
	// PERMS CHECK //

	/*
	client.on('ready', async () => {
		for(const g of client.guilds.cache) {
			const guild = g[1];

			await guild.commands.set(obj2).then(async (command) => {
				const Roles = (commandName) => {
					const cmdPerms = obj2.find((c) => c.name === commandName).permission;
					if(!cmdPerms) return null;

					return guild.roles.cache.filter((r) => r.permissions.has(cmdPerms));
				};

				const fullPermissions = command.reduce((accumulator, r) => {
					let roles = Roles(r.name);
					if(!roles) return accumulator;

					roles = roles.filter(data => data.managed == false);

					let permissions = roles.reduce((a, v) => {
						return[...a, { id: v.id, type: 'ROLE', permission: true }];
					}, []);

					if(permissions.length >= 10) permissions = permissions.slice(0, 8);
					permissions.push({ id: guild.ownerId, type: 'USER', permission: true });

					return[...accumulator, { id: r.id, permissions }];
				}, []);


				await guild.commands.permissions.set({ fullPermissions: fullPermissions });
			});
		}
	});


	client.on('ready', async () => {

		client.application.commands.set(obj2).then(async (command) => {
			for(const g of client.guilds.cache) {
				const guild = g[1];
				const Roles = (commandName) => {
					const cmdPerms = obj2.find((c) => c.name === commandName).permission;
					if(!cmdPerms) return null;

					return guild.roles.cache.filter((r) => r.permissions.has(cmdPerms));
				};

				const fullPermissions = command.reduce((accumulator, r) => {
					let roles = Roles(r.name);
					if(!roles) return accumulator;

					roles = roles.filter(data => data.managed == false);

					let permissions = roles.reduce((a, v) => {
						return[...a, { id: v.id, type: 'ROLE', permission: true }];
					}, []);

					if(permissions.length >= 10) permissions = permissions.slice(0, 8);
					permissions.push({ id: guild.ownerId, type: 'USER', permission: true });

					return[...accumulator, { id: r.id, permissions }];
				}, []);


				await guild.commands.permissions.set({ fullPermissions: fullPermissions });
			}
		});
	});
	*/
	client.ready[1] = true;
};

require('dotenv').config();
const Discord = require('discord.js');
const Log = require('mustang-log');

/**
 * Core function
 * @param client - The client instance.
 * @param options - Optional params to customise the bot.
 */
module.exports = async (client, options) => {
  if (!client) throw new Error('Client must be provided to continue');
  const {
    commandsDir = './commands',
    eventsDir = './events',
    allowDMs = true
  } = options;

  client.commands = await registerCommands(commandsDir);
  client.events = await registerEvents(eventsDir);

  client.on('message', (message) => {
    if (message.bot || (!allowDMs && !message.guild)) return null;
  });
}

(async () => {
  console.log(await module.exports('client', { eventsDir: 'myDir' }))
})();



async function registerCommands(dir) {
  if (!dir) return [];

  // TODO - Add command handler from my bot
}

async function registerEvents(dir) {
  if (!dir) return [];

  // TODO - Add events from my bot
}

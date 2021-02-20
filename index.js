require('dotenv').config();
const Discord = require('discord.js');
const {log} = require('mustang-log');
const fs = require('fs');
const {join} = require('path');

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

  client.commands = await loadCommands(client, commandsDir);
  client.events = await loadEvents(client, eventsDir);

  client.on('message', async (message) => {
    if (message.bot || (!allowDMs && !message.guild)) return null;

    // Sorts arguments and message content
    let messageArray = message.content.split(" ");
    let cmd = messageArray[0].slice(prefix.length); // TODO Define prefix in class
    let args = messageArray.slice(1);

    const command = client.commands.get(cmd) ? client.commands.get(cmd) : client.commands.get(client.aliases.get(cmd));
    if (command) await command.run(client, message, args);
  });
}


// // TODO - Update this code to use a class instance format instead of a function
// class handler {
//   constructor(options) {
//     this.prefix =
//   }
//
// }




// Event Handler
async function loadEvents(client, dir) {
  const eventDir = join(__dirname, dir);
  if (!client.events) client.events = new Discord.Collection();

  const events = await getAllFiles(eventDir);
  for (const file of events.files) {
    const event = require(`${eventDir}/${file}`);
    const eventName = file.split('.').shift();
    if (!event || !eventName) continue;
    client.events.set(eventName, event);
    client.on(eventName, event.bind(null, client));
    delete require.cache[require.resolve(`${eventDir}/${file}`)];
  }

  const amount = client.events ? client.events.size : 0;
  await log(`Loaded ${amount} event${amount === 1 ? '' : 's'}`, 'INFO', true)

  return eventDir;
}

// Command Handler
async function loadCommands(client, dir) {
  const commandDir = join(__dirname, dir);
  // Set collections
  if (!client.commands) client.commands = new Discord.Collection();
  if (!client.aliases) client.aliases = new Discord.Collection();
  if (!client.categories) client.categories = new Discord.Collection();

  // Get command files
  const commands = await getAllFiles(commandDir);

  // Set the categories
  if (commands && commands.categories) client.categories = commands.categories;

  // Set the commands and aliases
  if (!commands || !commands.files) return await log.warn('No Commands Found!');

  for (const f of commands.files) {
    const props = require(f);
    if (!props || !props.name) continue;
    client.commands.set(props.name, props);
    if (props.aliases && Array.isArray(props.aliases)) {
      for (const alias of props.aliases) client.aliases.set(alias, props.help.name);
    }
  }


  const amount = client.commands ? client.commands.size : 0;
  await log(`Loaded ${amount} command${amount === 1 ? '' : 's'}`, 'INFO', true)
}

// Get all files recursively
async function getAllFiles(dirPath, arrayOfFiles = [], arrayOfCategories = []) {
  try {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      if (fs.statSync(dirPath + "/" + file).isDirectory()) {
        arrayOfCategories.push(file);
        await getAllFiles(dirPath + "/" + file, arrayOfFiles, arrayOfCategories);
      } else {
        arrayOfFiles.push(join(dirPath, "/", file));
      }
    }

  } catch (err) {
    console.log('ERr', err)
  }
  return {files: arrayOfFiles, categories: arrayOfCategories};
}

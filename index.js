const Discord = require('discord.js');
const {log} = require('mustang-log');
const fs = require('fs');
const {join} = require('path');
const moment = require("moment");
require("moment-duration-format");

/**
 * SimplyDiscord
 * @class
 */
class SimplyDiscord {
  /**
   * Simply Discord Constructor
   * @constructor
   * @param {Discord.client|object} client - The Discord.js Client
   * @param {Object} options - An object of options
   * @example
   * new SimplyDiscord(client, {
   *  commandsDir: './lib/commands',
   *  eventsDir: 'events',
   *  allowDMs: false
   * });
   */
  constructor(client = null, options = {}) {
    if (client && !client.presence) {
      options = client;
      client = null;
    }

    this.defaultPrefix = options.defaultPrefix || '!';
    this.commandsDir = options.commandsDir || 'commands';
    this.eventsDir = options.eventsDir || 'events';
    this.allowDMs = options.allowDMs || true;
    this.client = client || new Discord.Client();

    this.setCommandsDir = this.setCommandsDir.bind(this);
    this.setEventsDir = this.setEventsDir.bind(this);
    this.setDefaultPrefix = this.setDefaultPrefix.bind(this);
    this.setGuildPrefix = this.setGuildPrefix.bind(this);
    this.toggleDMs = this.toggleDMs.bind(this);
    this.reload = this.reload.bind(this);

    (async () => {
      try {
        await log('Attempting to load COMMANDS and EVENTS ...', logs.load, true);
        await loadCommands(this.client, this.commandsDir);
        await loadEvents(this, this.client, this.eventsDir);
        if (!this.client.prefixes) this.client.prefixes = new Discord.Collection();
        if (!this.client.cooldowns) this.client.cooldowns = new Discord.Collection();

        this.client.on('message', async (message) => {
          if (message.author.bot || (!this.allowDMs && !message.guild)) return null;

          // Sorts arguments and message content
          let messageArray = message.content.split(/\s+/g);
          // TODO find a better way to handle no guild
          const prefix = this.client.prefixes.get((message.guild && message.guild.id) || '123') || this.defaultPrefix;
          if (!message.content.startsWith(prefix)) return null;
          let cmd = messageArray[0].slice(prefix.length);
          let args = messageArray.slice(1);

          if (!this.client.commands) return log('You have no commands available', logs.warn, true);
          const command = this.client.commands.get(cmd) ? this.client.commands.get(cmd) : this.client.commands.get(this.client.aliases.get(cmd));
          if (command && command.run) {
            const cooldown = checkCooldown(message, command, this.client.cooldowns);
            if (cooldown) return message.channel.send(`Please wait \`${cooldown}\` before running \`${command.name}\` again!`);
            await command.run({
              client: this.client,
              handler: this,
              message,
              args
            });
          }
        });
      } catch (err) {
        await log(`An error occurred - ${err.message || err}`, 'ERROR', true);
      }
    })();
  }

  /**
   * @property {function} setCommandsDir Set the commands directory.
   * @param {string} dir - The directory path of the commands folder
   * @param {boolean} reload - Reload commands with the new dir? (Default True)
   * @return {SimplyDiscord}
   */
  setCommandsDir(dir, reload = true) {
    try {
      log(`Setting Commands Directory ('${dir}')`, logs.load, true);
      const _isDir = fs.lstatSync(dir).isDirectory();
      if (dir && _isDir) {
        log(`New Commands Dir : '${dir}'`, logs.done, true);
        this.commandsDir = dir;
        if (reload) this.reload('commands');
      }
    } catch (e) {
      log(`Unable to set Commands Dir : ${e.message || e}`, logs.error, true);
    }
    return this;
  }

  /**
   * @property {function} setEventsDir Set the events directory.
   * @param {string} dir - The directory path of the events folder
   * @param {boolean} reload - Reload events with the new dir? (Default True)
   * @return {SimplyDiscord}
   */
  setEventsDir(dir, reload = true) {
    try {
      log(`Setting Events Directory ('${dir}')`, logs.load, true);
      const _isDir = fs.lstatSync(dir).isDirectory();
      if (dir && _isDir) {
        log(`New Events Dir : '${dir}'`, logs.done, true);
        this.eventsDir = dir;
        if (reload) this.reload('events');
      }
    } catch (e) {
      log(`Unable to set Events Dir : ${e.message || e}`, logs.error, true);
    }
    return this;
  }

  /**
   * @property {function} setDefaultPrefix Set the default prefix.
   * @param {string} prefix - The new default prefix
   * @return {SimplyDiscord}
   */
  setDefaultPrefix(prefix) {
    if (prefix) this.defaultPrefix = prefix;
    return this;
  }

  /**
   * @property {function} setGuildPrefix Set a prefix for a specified guildID.
   * @param {string} guildID - The ID of the guild to set the prefix for
   * @param {string} prefix - The new prefix
   * @return {SimplyDiscord}
   */
  setGuildPrefix(guildID, prefix = this.defaultPrefix) {
    if (!guildID) return;
    if (!this.client.prefixes) this.client.prefixes = new Discord.Collection();
    this.client.prefixes.set(guildID, prefix);
    return this;
  }

  /**
   * @property {function} toggleDMs Toggle if DMs should be allowed on the Bot
   * @param value - True/False whether to enable DMs or not (Default is opposite of the current value)
   * @return {SimplyDiscord}
   */
  toggleDMs(value) {
    if (typeof value === 'boolean') this.allowDMs = value;
    else this.allowDMs = !this.allowDMs;
    return this;
  }

  /**
   * @property {function} reload Reload the commands and events
   * @param {null|string} section - What to reload (Commands/Events)
   * @return {SimplyDiscord}
   */
  async reload(section = null) {
    section = section ? section.toString().toLowerCase() : section;
    await log(`RE-LOADING ${section === 'events' ? '' : 'COMMANDS '}${!section || !section.match(/^commands|events$/g) ? 'AND ' : ''}${section === 'commands' ? '' : 'EVENTS '}...`, logs.load, true);
    try {
      if (section !== 'events') await loadCommands(this.client, this.commandsDir, true);
      if (section !== 'commands') await loadEvents(this, this.client, this.eventsDir, true);
      await log('Reload Complete!', logs.done, true);
    } catch (err) {
      await log(`Error while restarting the instance - ${err.message || err} - ${err.stack}`, 'ERROR', true);
    }
    return this;
  }

}

// Event Handler
async function loadEvents(instance, client, dir, reload) {
  const eventDir = join(require.main.path, dir);
  if (reload || !client.events) client.events = new Discord.Collection();

  const events = await getAllFiles(eventDir);
  for (const file of events) {
    if (reload) delete require.cache[require.resolve(file)];
    const event = require(file);
    if (event && event.name && typeof event.run === 'function') {
      client.events.set(event.name, event);
      if (event.once) {
        client.once(event.name, event.run.bind(null, client, instance));
      } else {
        client.on(event.name, event.run.bind(null, client, instance));
      }
      delete require.cache[require.resolve(file)];
    }
  }

  const amount = client.events ? client.events.size : 0;
  await log(`Loaded ${amount} event${amount === 1 ? '' : 's'}`, (amount < 1) ? logs.warn : 'INFO', true)

  return eventDir;
}

// Command Handler
async function loadCommands(client, dir, reload) {
  const commandDir = join(require.main.path, dir);
  // Set collections
  client.commands = new Discord.Collection();
  client.aliases = new Discord.Collection();
  client.categories = new Discord.Collection();

  // Get command files
  const commands = await getAllFiles(commandDir);

  // Set the commands and aliases
  if (!commands) return log('No Commands Found!', logs.warn, true);

  for (const f of commands) {
    if (reload) delete require.cache[require.resolve(f)];
    const props = require(f);
    if (!props || !props.name || !props.run) continue;
    client.commands.set(props.name, props);

    // Sort Categories
    const _cat = props.category || 'default';
    const _count = client.categories.get(_cat) || 0;
    client.categories.set(_cat, _count + 1);

    if (props.aliases && Array.isArray(props.aliases)) {
      for (const alias of props.aliases) client.aliases.set(alias, props.name);
    }
  }

  const amount = client.commands ? client.commands.size : 0;
  await log(`Loaded ${amount} command${amount === 1 ? '' : 's'}`, (amount < 1) ? logs.warn : 'INFO', true)
}

// Check for cooldowns
function checkCooldown(message, command, cooldowns) {
  if (message.author.permLevel > 4 || !command.cooldown) return;

  const cooldown = command.cooldown * 1000;
  const cooldownLimits = cooldowns.get(message.author.id) || {};

  if (!cooldownLimits[command.name]) cooldownLimits[command.name] = Date.now() - cooldown;

  const difference = Date.now() - cooldownLimits[command.name];
  if (difference < cooldown) return moment.duration(cooldown - difference).format("D [days], H [hours], m [minutes], s [seconds]", 1);

  cooldownLimits[command.name] = Date.now();
  cooldowns.set(message.author.id, cooldownLimits);
}
// Get all files recursively
async function getAllFiles(dirPath, arrayOfFiles = []) {
  try {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      if (fs.statSync(dirPath + "/" + file).isDirectory()) {
        await getAllFiles(dirPath + "/" + file, arrayOfFiles);
      } else {
        arrayOfFiles.push(join(dirPath, "/", file));
      }
    }

  } catch (err) {
    // Stop invalid dir errors
  }
  return arrayOfFiles;
}

// Export the class
module.exports = SimplyDiscord;

const logs = {
  done: {name: 'DONE', bgColor: '#2bba2b', textColor: '#ffffff'},
  load: {name: 'LOADING', bgColor: '#0042a2', textColor: '#ffffff'},
  warn: {name: 'WARNING', bgColor: '#d2cb00', textColor: '#000000'},
  error: {name: 'ERROR', bgColor: '#e31d5f', textColor: '#fff'},
}

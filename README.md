# Simply Discord

A simple Discord bot command handler that is easy to use, built for Discord.js

## Options

```js
const { client } = new SimplyDiscord({
  commandsDir: './commands', // The commands directory (Default: './commands')
  eventsDir: './events', // The events directory (Default: './events')
  allowDMs: false // If the bot should allow commands in DMs (Default: True)
})
.setGuildPrefix('GUILD_ID', 'NEW_PREFIX')
.setCommandsDir('NEW_DIRECTORY')
.setEventsDir('NEW_DIRECTORY')
.setDefaultPrefix('NEW_DEFAULT_PREFIX')
.toggleDMs() // True / False (Default will switch the oppisite of current state)
.reload(); // 'commands' / 'events' (Default will reload both)
```

## Usage

Using the handler:
```js
const Discord = require('discord.js');
const SimplyDiscord = require('simply-discord');
const client = new Discord.Client();

new SimplyDiscord(client, {
  commandsDir: 'lib/commands'
});
```
*Note: Simply Discord will create a client for you if you don't provide one*
```js
const SimplyDiscord = require('simply-discord');

/*
  Client is a property of the SimplyDiscord Class, 
    use this to access the Discord Client
*/
const { client } = new SimplyDiscord({ commandsDir: 'lib/commands' });

/*
  or assign it to a variable and use that to access the props and functions
*/

const simply = new SimplyDiscord({ commandsDir: 'lib/commands' });

const client = simply.client;
```

Example of the command structure:
```js
module.exports = {
  name: 'ping',
  aliases: ['p'],
  category: 'Utils',
  async run (client, message, args) {
    
  }
};
```

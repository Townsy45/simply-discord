[![forthebadge](https://forthebadge.com/images/badges/made-with-javascript.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/not-a-bug-a-feature.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/check-it-out.svg)](https://forthebadge.com)

[![NPM](https://nodei.co/npm/simply-discord.png)](https://nodei.co/npm/simply-discord/)

# Simply Discord

A simple Discord bot command handler that is easy to use, built for Discord.js

```js
const { client } = new SimplyDiscord({
  defaultPrefix: '-',
  commandsDir: './commands',
  eventsDir: './events',
  allowDMs: false
})

.setGuildPrefix('GUILD_ID', 'NEW_PREFIX')
.setCommandsDir('NEW_DIRECTORY')
.setEventsDir('NEW_DIRECTORY')
.setDefaultPrefix('NEW_DEFAULT_PREFIX')
.toggleDMs()
.reload();
```

**Params:**

| Param | Type | Info
| ------------- | :---: | ------------- |
| **client**  | `Discord.Client`  | The Discord client, if not passed one will be created
| **options**  | `object`  | More info below

**Available Options:**

| Option | Type | Default | Info |
| ------------- | :---: | :---: | ------------- |
| **options**  | `object`  | `undefined` | Options to configure the handler
| **options.defaultPrefix**  | `string`  | `!` | Default prefix to use in-case of no guild prefix
| **options.commandsDir**  | `string`  | `./commands` | Folder containing all your commands
| **options.eventsDir**  | `string`  | `./events` | Folder containing your event files
| **options.allowDMs**  | `boolean`  | `true` | Bot should respond in DMs?

**Handler Functions:**

| Function | Params | Info |
| ------------- | :---: | ------------- |
| **setCommandsDir**  | `('Directory')`  | Update the folder where your commands are located |
| **setDefaultPrefix**  | `('Prefix')`  | Update the default prefix |
| **setGuildPrefix**  | `('GuildID', 'Prefix')`  | Set the guild prefix to the client.prefixes collection |
| **setEventsDir**  | `('Directory')`  | Update the folder where your events are located |
| **toggleDMs**  | `(true/false)`  | Toggle if DMs should be allowed, sending nothing with switch it |
| **reload**  | `('commands'/'events')`  | Reload commands/events or both |

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

/* Client is a property of the SimplyDiscord Class, use this to access the Discord Client */
const { client } = new SimplyDiscord({ commandsDir: 'lib/commands' });

/* Assign it to a variable and use that to access the props and functions */

const simply = new SimplyDiscord({ commandsDir: 'lib/commands' });
const client = simply.client;

/*  Minimum usage  */

const simply = new SimplyDiscord();
```

### Command Structure Example:

```js
module.exports = {
  name: 'ping',
  aliases: ['p'],
  category: 'Utils',
  async run (client, handler, message, args) {
    // Your command code ...
  }
};
```

### Event Structure Example:

```js
module.exports = {
  name: 'ready',
  once: true,
  async run (client, handler, EVENT_PARAMS) {
    /* 
       EVENT_PARAMS are any params from the event itself, 
        check the Discord.js Docs for more info.
    */ 
  }
};
```
## TODO

<details open="open">
  <summary>Future Ideas</summary>
  <ol>
    <li>
      <a>Add an option to restart when updating Directories.</a>
    </li>
    <li>
      <a> Look into finding a better way to handle the guild checking.</a>
      <ul>
        <li><a> Relates to index.js Message event get prefix.</a></li>
      </ul>
    </li>
    <li><a>Add a cooldown system (Simply Version)</a></li>
    <li><a>Add setCooldown(time, guildWide) set the time and if to apply to everyone in the guild.</a></li>
    <li><a>Add toggleCooldown(true) set the cooldown to True/False or toggle on/off</a></li>
  </ol>
</details>

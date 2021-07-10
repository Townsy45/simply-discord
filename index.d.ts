import { Client } from "discord.js";

interface SimplyDiscordOptions {
  defaultPrefix?: string;
  commandsDir?: string;
  eventsDir?: string;
  allowDMs?: boolean;
}

class SimplyDiscord {
  public defaultPrefix: string;
  public client: Client;
  
  private commandsDir: string;
  private eventsDir: string;
  private allowDMs: boolean;

  public constructor(options: SimplyDiscordOptions);
  public constructor(client: null | Client, options?: SimplyDiscordOptions);
  
  public setCommandsDir(dir: string): SimplyDiscord;
  public setEventsDir(dir: string): SimplyDiscord;
  public setDefaultPrefix(prefix: string): SimplyDiscord;
  public setGuildPrefix(guildID: string, prefix?: string): SimplyDiscord;
  
  public toggleDMs(value?: boolean): SimplyDiscord;
  public reload(section?: "commands" | "events"): SimplyDiscord;
}

export default SimplyDiscord

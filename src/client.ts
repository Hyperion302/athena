import Discord from 'discord.js';

export const client = new Discord.Client();

export function connectToDiscord(token: string) {
  client.login(token);
}

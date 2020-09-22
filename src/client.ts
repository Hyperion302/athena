import Discord from 'discord.js';

export const client = new Discord.Client({
  partials: ['MESSAGE', 'REACTION'],
});

export function connectToDiscord(token: string) {
  client.login(token);
}

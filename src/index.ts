import Discord from 'discord.js';
import { readFileSync } from 'fs';
const client = new Discord.Client();

// Startup procedure
function start() {
  // Build timer table
  // TODO:
  const token = readFileSync('token');
  client.login(token.toString());
}

client.on('ready', () => {
  console.log('DRKT Logged on to Discord');
});

client.on('message', (message) => {
  const botMentionString = `<@!${client.user.id}>`;
  if (message.content.startsWith(botMentionString)) {
    const command = message.content.slice(botMentionString.length).trim();
    console.log(command);
  }
});

start();

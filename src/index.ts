import Discord from 'discord.js';
import { readFileSync } from 'fs';
import { parseCommand } from './command';
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

client.on('message', async (message) => {
  const botMentionString = `<@!${client.user.id}>`;
  if (message.content.startsWith(botMentionString)) {
    const command = message.content.slice(botMentionString.length).trim();
    let parsedCommand;

    // Parse command
    try {
      parsedCommand = parseCommand(command);
    } catch (e) {
      await message.channel.send(
        `There was an error reading that command: ${e.message}`
      );
      return;
    }

    console.log(parsedCommand);
  }
});

start();

import { readFileSync } from 'fs';
import { parseCommand, executeCommand } from './commands';
import { connectToDB, knex } from './db';
import { connectToDiscord, client } from './client';
import {
  getProposalByMessage,
  ProposalStatus,
  deleteProposal,
  setProposalStatus,
  generateProposalEmbed,
  setProposalMessage,
  getHangingProposals,
  scheduleProposal,
} from './proposals';
import { Message } from 'discord.js';

// Startup procedure
async function start() {
  const configuration = JSON.parse(
    readFileSync('configuration.json').toString()
  );
  // Connect to DB
  connectToDB(
    configuration['SQLUser'],
    configuration['SQLPass'],
    configuration['SQLDB']
  );
  // Build timer table
  // NOTE: I've determined that there could be a ~10 second error here,
  // but that shouldn't matter if we're recovering from a crash.
  const hangingProposals = await getHangingProposals();
  hangingProposals.forEach((proposal) => {
    console.log(
      `Proposal ${proposal.id} expires on ${proposal.expiresOn.getTime()}`
    );
    console.log(`Current time: ${Date.now()}`);
    const remainingDuration = proposal.expiresOn.getTime() - Date.now();
    scheduleProposal(client, proposal, remainingDuration);
    console.log(
      `Scheduled proposal ${proposal.id} for closure in ${remainingDuration} milliseconds`
    );
  });
  // TODO:
  connectToDiscord(configuration['token']);
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
      parsedCommand = parseCommand(command, message.channel.id);
    } catch (e) {
      await message.channel.send(
        `There was an error reading that command: ${e.message}`
      );
      console.warn(e);
      return;
    }

    // Execute command
    try {
      await executeCommand(parsedCommand, message);
    } catch (e) {
      await message.channel.send(
        `There was an error executing that command: ${e.message}`
      );
      console.warn(e);
      return;
    }
  }
});

async function onSingleDelete(message: Message) {
  // If a noncancelled proposal is deleted, resend it and mark it cancelled
  // If a cancelled proposal is deleted, delete it permanently
  const proposal = await getProposalByMessage(message.id);
  if (proposal.status == ProposalStatus.Cancelled) {
    await deleteProposal(proposal.id);
  } else {
    await setProposalStatus(proposal.id, ProposalStatus.Cancelled);
    proposal.status = ProposalStatus.Cancelled;
    const newMessage = await message.channel.send(
      generateProposalEmbed(proposal)
    );
    await setProposalMessage(proposal.id, newMessage);
  }
}

client.on('messageDelete', onSingleDelete);
client.on('messageDeleteBulk', async (messages) => {
  return Promise.all(Array.from(messages.values()).map(onSingleDelete));
});

start();

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
  addVote,
  Vote,
  Proposal,
  countVotes,
  refreshProposalMessage,
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
    console.log(`Current time: ${Date.now()}`);
    const remainingDuration = proposal.expiresOn.getTime() - Date.now();
    scheduleProposal(client, proposal, remainingDuration);
    console.log(
      `Scheduled proposal ${proposal.id} for closure in ${remainingDuration} milliseconds`
    );
  });
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

    if (!parsedCommand) return;

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

// NOTE: I ignore non-utf8 emoji (custom server emoji)
client.on('messageReactionAdd', async (reaction, user) => {
  if (user.id == client.user.id) return;
  if (reaction.partial) await reaction.fetch(); // TODO: Handle errors
  let proposal: Proposal;
  let vote: Vote;
  try {
    proposal = await getProposalByMessage(reaction.message.id);
  } catch (e) {
    return;
  }
  // Since we know this is a proposal, remove the reaction if it's a thumbs up or down
  if (reaction.emoji.name == '👎' || reaction.emoji.name == '👍')
    await reaction.remove();

  // Can't vote if proposal isn't running
  if (proposal.status != ProposalStatus.Running) return;

  // If it's a vote, count it
  if (reaction.emoji.name == '👎') {
    vote = Vote.No;
  } else if (reaction.emoji.name == '👍') {
    vote = Vote.Yes;
  } else return;
  await addVote(proposal.id, user.id, vote);
  const votes = await countVotes(proposal.id);
  const embed = generateProposalEmbed(proposal, votes);
  await refreshProposalMessage(client, proposal, embed);
});

async function onSingleDelete(message: Message) {
  // If the message is partial, it doesn't matter.  I only use it's ID and channel (always cached) anyway
  // If a noncancelled proposal is deleted, resend it and mark it cancelled
  // If a cancelled proposal is deleted, delete it permanently
  const proposal = await getProposalByMessage(message.id);
  if (
    [
      ProposalStatus.Cancelled,
      ProposalStatus.Failed,
      ProposalStatus.Passed,
    ].includes(proposal.status)
  ) {
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

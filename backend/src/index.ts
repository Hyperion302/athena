import { parseCommand, executeCommand, tCommand } from "./command";
import { connectToDevDB, connectToProdDB, runLatestMigration } from "./db";
import { connectToDiscord, client } from "./client";
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
  gIntervalList,
} from "./proposal";
import { Message, PartialMessage } from "discord.js";
import { getActions } from "./action";
import logger from "./logging";
import { InternalError } from "./errors/InternalError";
import app from "./app";

const production = process.env.NODE_ENV === "production";

// Startup procedure
async function start() {
  const botToken = process.env.BOT_TOKEN;
  if (!botToken) throw new InternalError("Invalid Bot Token");

  if (production) {
    const SQLUser = process.env.SQL_USER;
    if (!SQLUser) throw new InternalError("Invalid SQL User");
    const SQLPass = process.env.SQL_PASS;
    if (!SQLPass) throw new InternalError("Invalid SQL Pass");
    const SQLDB = process.env.SQL_DB;
    if (!SQLDB) throw new InternalError("Invalid SQL DB");
    connectToProdDB(SQLUser, SQLPass, SQLDB);
  } else {
    const SQLPath = process.env.SQL_PATH;
    if (!SQLPath) throw new InternalError("Invalid SQL Path");
    connectToDevDB(SQLPath);
  }
  // Run migrations if necessary
  if (process.env.MIGRATE) {
    await runLatestMigration();
  }
  // Build timer table
  // NOTE: I've determined that there could be a ~10 second error here,
  // but that shouldn't matter if we're recovering from a crash.
  const hangingProposals = await getHangingProposals();
  hangingProposals.forEach((proposal) => {
    const remainingDuration = proposal.expiresOn.getTime() - Date.now();
    scheduleProposal(client, proposal, remainingDuration);
    logger.info(
      `Scheduled proposal ${proposal.id} for closure in ${remainingDuration} milliseconds`,
      { proposal: proposal.id, remainingDuration }
    );
  });
  // Connect to discord
  connectToDiscord(botToken);
  // Initialize API server
  const APIPort = process.env.PORT;
  if (!APIPort) throw new InternalError("Invalid Port");
  app.listen(parseInt(APIPort), () => {
    logger.info(`API server ready and listening at ${APIPort}`);
  });
}

function refreshStatus() {
  const serverCount = client.guilds.cache.size; // TODO: Shard friendly
  logger.info(`DRKT now running on ${serverCount} servers`, {
    servers: serverCount,
  });
  if(!client.user) { return; }
  client.user
    .setPresence({
      activity: {
        name: `${serverCount} servers | ".DRKT help" to get started`,
        type: "LISTENING",
      },
    })
    .catch(logger.error);
}

client.on("ready", () => {
  logger.info(`DRKT now ready on ${client.guilds.cache.size}`, {
    servers: client.guilds.cache.size,
  }); // TODO: Shard friendly
  refreshStatus();
  client.setInterval(refreshStatus, 1800000);
});

client.on("message", async (message) => {
  if (!client.user) { return; }
  const botMentionString = `<@!${client.user.id}>`;
  const prefix = ".DRKT";
  const devPrefix = ".DRKT_DEV";
  if (
    ((message.content.startsWith(botMentionString) ||
      message.content.startsWith(prefix)) &&
      production) ||
    (message.content.startsWith(devPrefix) && !production)
  ) {
    let command: string;
    if (message.content.startsWith(botMentionString)) {
      command = message.content.slice(botMentionString.length).trim();
    } else if (production) {
      command = message.content.slice(prefix.length).trim();
    } else {
      command = message.content.slice(devPrefix.length).trim();
    }
    let parsedCommand: tCommand;

    // Parse command
    try {
      parsedCommand = parseCommand(command, message.channel.id);
    } catch (e) {
      await message.channel.send(`There was an error: ${e.message}`);
      logger.info("Error encountered while parsing command:", e);
      return;
    }

    if (!parsedCommand) return;


    logger.info(`Parsed command: ${command}`, {
      parsedCommand,
      user: message.author.id,
      channel: message.channel.id,
    });

    // Execute command
    try {
      await executeCommand(parsedCommand, message);
    } catch (e) {
      await message.channel.send(`There was an error: ${e.message}`);
      logger.info("Error encountered while executing command:", e);
      return;
    }
  }
});

// NOTE: I ignore non-utf8 emoji (custom server emoji)
client.on("messageReactionAdd", async (reaction, user) => {
  if (!client.user) { return; }
  let proposal: Proposal;
  let vote: Vote;
  try {
    proposal = await getProposalByMessage(reaction.message.id);
  } catch (e) {
    return;
  }
  try {
    if (user.id == client.user.id) return;
    if (reaction.partial) await reaction.fetch(); // TODO: Handle errors

    // Since we know this is a proposal, remove the reaction if it's a vote
    if (
      reaction.emoji.name == "👎" ||
      reaction.emoji.name == "👍" ||
      reaction.emoji.name == "👀"
    ) {
      await reaction.remove();
    }

    // Can't vote if proposal isn't running
    if (proposal.status != ProposalStatus.Running) return;

    // If it's a vote, count it
    if (reaction.emoji.name == "👎") {
      vote = Vote.No;
    } else if (reaction.emoji.name == "👍") {
      vote = Vote.Yes;
    } else if (reaction.emoji.name == "👀") {
      vote = Vote.Abstain;
    } else {
      return;
    }
    await addVote(proposal.id, user.id, vote);
    logger.info(`User ${user.id} voted ${vote} for ${proposal.id}`, {
      proposal: proposal.id,
      vote,
      user: user.id,
    });
    const votes = await countVotes(proposal.id);
    const embed = generateProposalEmbed(proposal, votes);
    await refreshProposalMessage(client, proposal, embed);
  } catch (e) {
    logger.warn(`Error encountered while counting vote:`, e);
  }
});

async function onSingleDelete(message: Message | PartialMessage) {
  // If the message is partial, it doesn't matter.  I only use it's ID and channel (always cached) anyway
  // If the proposal is running, cancel and resend
  // If it's not running, delete
  let proposal: Proposal;
  try {
    proposal = await getProposalByMessage(message.id);
  } catch (e) {
    return;
  }
  try {
    if (proposal.status == ProposalStatus.Running) {
      if (gIntervalList[proposal.id]) clearTimeout(gIntervalList[proposal.id]);
      await setProposalStatus(proposal.id, ProposalStatus.Cancelled);
      proposal.status = ProposalStatus.Cancelled;
      const votes = await countVotes(proposal.id);
      const actions = await getActions(proposal.id);
      const newMessage = await message.channel.send(
        generateProposalEmbed(proposal, votes, actions)
      );
      await setProposalMessage(proposal.id, newMessage);
    } else {
      await deleteProposal(proposal.id);
    }
  } catch (e) {
    logger.warn(`Error encountered while handling delete:`, e);
  }
}

client.on("messageDelete", onSingleDelete);
client.on("messageDeleteBulk", async (messages) => {
  return Promise.all(Array.from(messages.values()).map(onSingleDelete));
});

start();

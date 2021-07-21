import {
  Command,
  tCommand,
  globalHelp,
  proposalsHelp,
  votingHelp,
  actionsHelp,
} from '@/command';
import { Message } from 'discord.js';

export async function executeCommand(
  command: tCommand,
  messageObject: Message
) {
  // LIST PROPOSALS
  if (command.command == Command.ListProposals) {
    await messageObject.channel.send("ListProposals");
    return;
  }
  // GET PROPOSAL
  if (command.command == Command.GetProposal) {
    await messageObject.channel.send("GetProposal");
    return;
  }
  // HELP
  if (command.command == Command.Help) {
    if (!command.section.length) {
      await messageObject.channel.send(globalHelp);
      return;
    }
    switch (command.section) {
      case 'proposals':
        await messageObject.channel.send(proposalsHelp);
        break;
      case 'voting':
        await messageObject.channel.send(votingHelp);
        break;
      case 'actions':
        await messageObject.channel.send(actionsHelp);
        break;
      default:
        await messageObject.channel.send(`Unknown section ${command.section}`);
    }
  }
}

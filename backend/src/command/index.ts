import { MessageEmbed } from 'discord.js';

export enum Command {
  ListProposals = 'list',
  GetProposal = 'get',
  Help = 'help',
}

interface ListProposalsCommand {
  command: Command.ListProposals;
}

interface GetProposalCommand {
  command: Command.GetProposal;
  id: string;
}

interface HelpCommand {
  command: Command.Help;
  section: string;
}

// Convenience union type
export type tCommand =
  ListProposalsCommand
  | GetProposalCommand
  | HelpCommand;

export const globalHelp = new MessageEmbed();
globalHelp.setTitle('Help');
globalHelp.setDescription(
  `Send .DRKT help <section> to get help with a specific section.  Available sections are:
*proposals
voting
actions*
For detailed help, see [my full help page](https://hyperion302.github.io/direkt-docs)
`
);

export const proposalsHelp = new MessageEmbed();
proposalsHelp.setTitle('Proposals Help');
proposalsHelp.setDescription(`Proposals represent a single votable poll.  You can optionally attach *actions* to proposals that get excuted automatically if the poll passes, or choose to leave them as just polls.  Users can vote on proposals with the :thumbsup: and :thumbsdown: emoji.
The following commands work with proposals:

\`create proposal <duration> <name>\` (the duration uses <number><unit> notation, like '5s' or '2d', with the maximum duration being 2 days) - Creates a proposal
\`cancel proposal <proposal ID>\` (only works on running proposals) - Cancels a running proposal
\`destroy proposal <proposal ID>\` (only works on non-running proposals) - Deletes a non-running proposal
\`update proposal <proposal ID> <description or duration> <new description or duration>\` - Updates a non-running and non-passed proposal
\`run proposal <proposal ID>\` - Runs a building proposal
\`retry proposal <proposal ID>\` (only works on errored proposals) - Retries execution of an errored (but passed) proposal`);

export const votingHelp = new MessageEmbed();
votingHelp.setTitle('Voting Help');
votingHelp.setDescription(`You can only vote on proposals that are running (green line).  Vote by reacting with :thumbsup: or :thumbsdown:.  If you want to change your vote, first clear your vote with the \`clear vote\` command.
The following commands work with voting:

\`clear vote <proposal ID>\` (only works on running proposals) - Cleares your vote on a proposal`);

export const actionsHelp = new MessageEmbed();
actionsHelp.setTitle('Actions Help');
actionsHelp.setDescription(`Actions can be attached to proposals to make the proposal do things once it's passed.
The following commands work with actions:

\`add action <proposal ID> <action>\` - Adds an action
\`replace action <proposal ID> <index> <new action>\` - Replaces an action at \`index\` with a new action
\`remove action <proposal ID> <index>\` - Removes an action at \`index\`
\`insert action <proposal ID> <index> <action>\` - Inserts an action at \`index\``);

export { parseCommand } from './parser';
export { executeCommand } from './executor';

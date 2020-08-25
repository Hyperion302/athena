import {
  createProposal,
  generateProposalEmbed,
  getProposal,
  setProposalMessage,
  setProposalStatus,
  ProposalStatus,
  setProposalDescription,
  setProposalDuration,
  refreshProposalMessage,
  setExpirationDate,
  scheduleProposal,
  countVotes,
  clearVote,
} from './proposals';
import { Message } from 'discord.js';
import { tAction, parseAction } from './actionParser';
import {
  validateAction,
  getActions,
  validateActions,
  getNextIndex,
  createAction,
  replaceAction,
  removeAction,
  insertAction,
} from './actions';

enum Command {
  CreateProposal = 'create proposal',
  CancelProposal = 'cancel proposal',
  UpdateProposal = 'update proposal',
  RefreshProposal = 'refresh proposal',
  AddAction = 'add action',
  ReplaceAction = 'replace action',
  RemoveAction = 'remove action',
  InsertAction = 'insert action',
  RunProposal = 'run proposal',
  ClearVote = 'clear vote',
}

interface CreateProposalCommand {
  command: Command.CreateProposal;
  duration: number; // Seconds
  name: string;
  channel: string;
}

interface CancelProposalCommand {
  command: Command.CancelProposal;
  id: string;
}

interface UpdateProposalCommand {
  command: Command.UpdateProposal;
  id: string;
  field: 'description' | 'duration';
  value: string | number;
}

interface RefreshProposalCommand {
  command: Command.RefreshProposal;
  id: string;
}

interface RunProposalCommand {
  command: Command.RunProposal;
  id: string;
}

interface ClearVoteCommand {
  command: Command.ClearVote;
  id: string;
}

interface AddActionCommand {
  command: Command.AddAction;
  id: string;
  action: tAction;
  actionString: string;
}

interface ReplaceActionCommand {
  command: Command.ReplaceAction;
  id: string;
  index: number;
  action: tAction;
  actionString: string;
}

interface RemoveActionCommand {
  command: Command.RemoveAction;
  id: string;
  index: number;
}

interface InsertActionCommand {
  command: Command.InsertAction;
  id: string;
  index: number;
  action: tAction;
  actionString: string;
}

// Convenience union type
type tCommand =
  | CreateProposalCommand
  | CancelProposalCommand
  | UpdateProposalCommand
  | RefreshProposalCommand
  | RunProposalCommand
  | ClearVoteCommand
  | AddActionCommand
  | ReplaceActionCommand
  | RemoveActionCommand
  | InsertActionCommand;

export function parseDuration(duration: string): number {
  const unit = duration.slice(-1);
  const magnitude = parseInt(duration.slice(0, -1), 10);
  let multiplier: number;
  switch (unit) {
    case 's':
      multiplier = 1;
      break;
    case 'm':
      multiplier = 60;
      break;
    case 'h':
      multiplier = 60 * 60;
      break;
    case 'd':
      multiplier = 60 * 60 * 24;
      break;
    default:
      throw new Error(`Invalid unit of time "${unit}"`);
  }
  return magnitude * multiplier;
}

export function parseCommand(command: string, channel: string): tCommand {
  if (command.startsWith(Command.CreateProposal)) {
    const params = command
      .slice(Command.CreateProposal.length)
      .trim()
      .split(' ');
    const duration = parseDuration(params.shift());
    const name = params.join(' ');
    return {
      command: Command.CreateProposal,
      duration,
      name,
      channel,
    };
  }
  if (command.startsWith(Command.CancelProposal)) {
    const params = command
      .slice(Command.CancelProposal.length)
      .trim()
      .split(' ');
    return {
      command: Command.CancelProposal,
      id: params[0],
    };
  }
  if (command.startsWith(Command.UpdateProposal)) {
    const params = command
      .slice(Command.UpdateProposal.length)
      .trim()
      .split(' ');
    let value: string | number;
    let field: 'description' | 'duration';
    if (params[1] == 'description') {
      value = params.slice(2).join(' ');
      field = 'description';
    }
    if (params[1] == 'duration') {
      value = parseDuration(params[2]);
      field = 'duration';
    }
    return {
      command: Command.UpdateProposal,
      id: params[0],
      field,
      value,
    };
  }
  if (command.startsWith(Command.RefreshProposal)) {
    const params = command
      .slice(Command.RefreshProposal.length)
      .trim()
      .split(' ');
    return {
      command: Command.RefreshProposal,
      id: params[0],
    };
  }
  if (command.startsWith(Command.AddAction)) {
    const params = command.slice(Command.AddAction.length).trim().split(' ');
    const actionString = params.slice(1).join(' ');
    const action = parseAction(actionString);
    return {
      command: Command.AddAction,
      id: params[0],
      action,
      actionString,
    };
  }
  if (command.startsWith(Command.ReplaceAction)) {
    const params = command
      .slice(Command.ReplaceAction.length)
      .trim()
      .split(' ');
    let index = parseInt(params[1], 10);
    if (isNaN(index)) throw new Error('Invalid index');
    index--; // 1-indexed => 0-indexed
    if (index < 0) throw new Error('Invalid index');
    const actionString = params.slice(2).join(' ');
    const action = parseAction(actionString);
    return {
      command: Command.ReplaceAction,
      id: params[0],
      index,
      action,
      actionString,
    };
  }
  if (command.startsWith(Command.RemoveAction)) {
    const params = command.slice(Command.RemoveAction.length).trim().split(' ');
    let index = parseInt(params[1], 10);
    if (isNaN(index)) throw new Error('Invalid index');
    index--; // 1-indexed => 0-indexed
    if (index < 0) throw new Error('Invalid index');
    return {
      command: Command.RemoveAction,
      id: params[0],
      index,
    };
  }
  if (command.startsWith(Command.RunProposal)) {
    const params = command.slice(Command.RunProposal.length).trim().split(' ');
    return {
      command: Command.RunProposal,
      id: params[0],
    };
  }
  if (command.startsWith(Command.ClearVote)) {
    const params = command.slice(Command.ClearVote.length).trim().split(' ');
    return {
      command: Command.ClearVote,
      id: params[0],
    };
  }
  if (command.startsWith(Command.InsertAction)) {
    const params = command.slice(Command.RemoveAction.length).trim().split(' ');
    let index = parseInt(params[1], 10);
    if (isNaN(index)) throw new Error('Invalid index');
    index--; // 1-indexed => 0-indexed
    if (index < 0) throw new Error('Invalid index');
    const actionString = params.slice(2).join(' ');
    const action = parseAction(actionString);
    return {
      command: Command.InsertAction,
      id: params[0],
      index,
      action,
      actionString,
    };
  }
}

export async function executeCommand(
  command: tCommand,
  messageObject: Message
) {
  // I choose an if chain over a switch statement
  // because each switch case shares it's
  // scope with other switch cases

  // CREATE PROPOSAL
  if (command.command == Command.CreateProposal) {
    const proposal = await createProposal(
      command.name,
      command.duration,
      messageObject
    );
    const embed = generateProposalEmbed(proposal);
    const proposalMessage = await messageObject.channel.send(embed);

    await setProposalMessage(proposal.id, proposalMessage);
  }

  // CANCEL PROPOSAL
  if (command.command == Command.CancelProposal) {
    const proposal = await getProposal(command.id);
    if (
      proposal.status == ProposalStatus.Cancelled ||
      proposal.status == ProposalStatus.Closed
    ) {
      throw new Error('Cannot cancel an already closed or cancelled proposal');
    }
    await setProposalStatus(proposal.id, ProposalStatus.Cancelled);
    proposal.status = ProposalStatus.Cancelled;
    const newEmbed = generateProposalEmbed(proposal);
    await refreshProposalMessage(messageObject.client, proposal, newEmbed);
  }

  // UPDATE PROPOSAL
  if (command.command == Command.UpdateProposal) {
    const proposal = await getProposal(command.id);
    if (proposal.status != ProposalStatus.Building) {
      throw new Error('Cannot modify a closed or running proposal');
    }
    if (command.field == 'description') {
      const description = command.value as string;
      if (description.length > 1024) return;
      proposal.description = description;
      await setProposalDescription(proposal.id, description);
    }
    if (command.field == 'duration') {
      const duration = command.value as number;
      proposal.duration = duration;
      await setProposalDuration(proposal.id, duration);
    }
    const newEmbed = generateProposalEmbed(proposal);
    await refreshProposalMessage(messageObject.client, proposal, newEmbed);
  }

  // REFRESH PROPOSAL
  if (command.command == Command.RefreshProposal) {
    const proposal = await getProposal(command.id);
    let newEmbed: any;
    if (proposal.status != ProposalStatus.Building) {
      const votes = await countVotes(command.id);
      const actions = await getActions(proposal.id);
      newEmbed = generateProposalEmbed(proposal, votes, actions);
    } else {
      const actions = await getActions(proposal.id);
      newEmbed = generateProposalEmbed(proposal, null, actions);
    }
    await refreshProposalMessage(messageObject.client, proposal, newEmbed);
  }

  // RUN PROPOSAL
  if (command.command == Command.RunProposal) {
    const proposal = await getProposal(command.id);
    if (proposal.status != ProposalStatus.Building) {
      throw new Error('Cannot run an already running or closed proposal');
    }
    const expirationDate = new Date(Date.now() + proposal.duration * 1000);
    await setExpirationDate(proposal.id, expirationDate);
    await setProposalStatus(proposal.id, ProposalStatus.Running);
    proposal.status = ProposalStatus.Running;
    const newEmbed = generateProposalEmbed(proposal);
    await refreshProposalMessage(messageObject.client, proposal, newEmbed);
    scheduleProposal(messageObject.client, proposal, proposal.duration * 1000);
  }

  // CLEAR VOTE
  if (command.command == Command.ClearVote) {
    const proposal = await getProposal(command.id);
    if (proposal.status != ProposalStatus.Running) {
      throw new Error("Cannot cancel a vote on a proposal that isn't running");
    }
    await clearVote(proposal.id, messageObject.author.id);
    const votes = await countVotes(proposal.id);
    const newEmbed = generateProposalEmbed(proposal, votes);
    await refreshProposalMessage(messageObject.client, proposal, newEmbed);
  }

  // INSERT ACTION
  if (command.command == Command.InsertAction) {
    const proposal = await getProposal(command.id);
    if (proposal.status != ProposalStatus.Building) {
      throw new Error(
        'Cannot add actions to an already running or closed proposal'
      );
    }
    // Validate action
    const actionValid = await validateAction(
      messageObject.guild,
      command.action
    );
    if (actionValid !== true) throw new Error(actionValid);
    const actions = await getActions(proposal.id);
    actions.splice(command.index, 0, command.action);
    const actionsValid = await validateActions(messageObject.guild, actions);
    if (actionsValid !== true) {
      throw new Error('Removal incompatible with other actions'); // TODO: Update view to show WHICH action or HOW
    }
    // Insert action into DB
    await insertAction(proposal.id, command.index, command.actionString);
    // Update proposal view
    const newEmbed = generateProposalEmbed(proposal, null, actions);
    await refreshProposalMessage(messageObject.client, proposal, newEmbed);
  }

  // ADD ACTION
  if (command.command == Command.AddAction) {
    const proposal = await getProposal(command.id);
    if (proposal.status != ProposalStatus.Building) {
      throw new Error(
        'Cannot add actions to an already running or closed proposal'
      );
    }
    // Validate action
    const actionValid = await validateAction(
      messageObject.guild,
      command.action
    );
    if (actionValid !== true) throw new Error(actionValid);
    const actions = await getActions(proposal.id);
    const newIndex = await getNextIndex(proposal.id);
    actions[newIndex] = command.action;
    // Validate new list of actions
    const actionsValid = await validateActions(messageObject.guild, actions);
    if (actionsValid !== true) {
      throw new Error('Action incompatible with other actions'); // TODO: Update view to show WHICH action or HOW
    }
    // Create action in DB
    await createAction(proposal.id, newIndex, command.actionString);
    // Update proposal view
    const newEmbed = generateProposalEmbed(proposal, null, actions);
    await refreshProposalMessage(messageObject.client, proposal, newEmbed);
  }

  if (command.command == Command.ReplaceAction) {
    const proposal = await getProposal(command.id);
    if (proposal.status != ProposalStatus.Building) {
      throw new Error(
        'Cannot add actions to an already running or closed proposal'
      );
    }
    // Validate new action
    const newActionValid = await validateAction(
      messageObject.guild,
      command.action
    );
    if (newActionValid !== true) throw new Error(newActionValid);
    const actions = await getActions(proposal.id);
    if (command.index >= actions.length) {
      throw new Error('Invalid index');
    }
    actions[command.index] = command.action;
    // Validate new list of actions
    const actionsValid = await validateActions(messageObject.guild, actions);
    if (actionsValid !== true) {
      throw new Error('Action incompatible with other actions'); // TODO: Update view to show WHICH action or HOW
    }
    // Replace action in DB
    await replaceAction(proposal.id, command.index, command.actionString);
    // Update proposal view
    const newEmbed = generateProposalEmbed(proposal, null, actions);
    await refreshProposalMessage(messageObject.client, proposal, newEmbed);
  }

  if (command.command == Command.RemoveAction) {
    const proposal = await getProposal(command.id);
    if (proposal.status != ProposalStatus.Building) {
      throw new Error(
        'Cannot add actions to an already running or closed proposal'
      );
    }
    // Validate new list of actions
    const actions = await getActions(proposal.id);
    if (command.index >= actions.length) {
      throw new Error('Invalid index');
    }
    actions.splice(command.index, 1);
    const actionsValid = await validateActions(messageObject.guild, actions);
    if (actionsValid !== true) {
      throw new Error('Removal incompatible with other actions'); // TODO: Update view to show WHICH action or HOW
    }
    // Remove action from db
    await removeAction(proposal.id, command.index);
    // Update proposal view
    const newEmbed = generateProposalEmbed(proposal, null, actions);
    await refreshProposalMessage(messageObject.client, proposal, newEmbed);
  }
}

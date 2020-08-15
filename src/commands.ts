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
  getMessageObject,
} from './proposals';
import { Message, TextChannel, Client } from 'discord.js';

enum Command {
  CreateProposal = 'create proposal',
  CancelProposal = 'cancel proposal',
  UpdateProposal = 'update proposal',
  RefreshProposal = 'refresh proposal',
  AddAction = 'add action',
  ReplaceAction = 'replace action',
  RemoveAction = 'remove action',
  RunProposal = 'run proposal',
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

function parseDuration(duration: string): number {
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

export function parseCommand(
  command: string,
  channel: string
):
  | CreateProposalCommand
  | CancelProposalCommand
  | UpdateProposalCommand
  | RefreshProposalCommand
  | RunProposalCommand {
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
  }
  if (command.startsWith(Command.ReplaceAction)) {
  }
  if (command.startsWith(Command.RemoveAction)) {
  }
  if (command.startsWith(Command.RunProposal)) {
    const params = command.slice(Command.RunProposal.length).trim().split(' ');
    return {
      command: Command.RunProposal,
      id: params[0],
    };
  }
}

export async function executeCommand(
  command:
    | CreateProposalCommand
    | CancelProposalCommand
    | UpdateProposalCommand
    | RefreshProposalCommand
    | RunProposalCommand,
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
    await refreshProposalMessage(messageObject.client, proposal);
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
    await refreshProposalMessage(messageObject.client, proposal);
  }

  // REFRESH PROPOSAL
  if (command.command == Command.RefreshProposal) {
    const proposal = await getProposal(command.id);
    await refreshProposalMessage(messageObject.client, proposal);
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
    await refreshProposalMessage(messageObject.client, proposal);
    scheduleProposal(messageObject.client, proposal, proposal.duration * 1000);
  }
}

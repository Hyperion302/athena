import { Command, tCommand } from '.';
import { parseDuration, parseAction } from '../action';

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
  if (command.startsWith(Command.DestroyProposal)) {
    const params = command
      .slice(Command.DestroyProposal.length)
      .trim()
      .split(' ');
    return {
      command: Command.DestroyProposal,
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
  if (command.startsWith(Command.ResendProposal)) {
    const params = command
      .slice(Command.ResendProposal.length)
      .trim()
      .split(' ');
    return {
      command: Command.ResendProposal,
      id: params[0],
    };
  }
  if (command.startsWith(Command.RetryProposal)) {
    const params = command
      .slice(Command.RetryProposal.length)
      .trim()
      .split(' ');
    return {
      command: Command.RetryProposal,
      id: params[0],
    };
  }
}

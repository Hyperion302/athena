import {
  Command,
  tCommand,
  MIN_PROPOSAL_DESCRIPTION_LENGTH,
  MAX_PROPOSAL_DESCRIPTION_LENGTH,
  MAX_DURATION,
  MIN_DURATION,
  MIN_PROPOSAL_NAME_LENGTH,
  MAX_PROPOSAL_NAME_LENGTH,
} from '.';
import { parseDuration, parseAction } from '../action';
import { CommandSyntaxError } from '../errors/CommandSyntaxError';

export function parseCommand(command: string, channel: string): tCommand {
  if (command.startsWith(Command.CreateProposal)) {
    const params = command
      .slice(Command.CreateProposal.length)
      .trim()
      .split(' ');
    const durationString = params.shift();
    if (!durationString) {
      throw new Error();
    }

    const duration = parseDuration(durationString);
    if (!duration) {
      throw new CommandSyntaxError(`Invalid duration ${durationString}`);
    }
    if (duration > MAX_DURATION || duration < MIN_DURATION) {
      throw new CommandSyntaxError(`Duration too long or too short (5s to 2d)`);
    }
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
    let field: 'description' | 'duration' | 'name';
    if (params[1] == 'description') {
      value = params.slice(2).join(' ');
      if (
        value.length < MIN_PROPOSAL_DESCRIPTION_LENGTH ||
        value.length > MAX_PROPOSAL_DESCRIPTION_LENGTH
      ) {
        throw new CommandSyntaxError(
          `Proposal description too long or too short (${MIN_PROPOSAL_DESCRIPTION_LENGTH}-${MAX_PROPOSAL_DESCRIPTION_LENGTH})`
        );
      }
      field = 'description';
    } else if (params[1] == 'duration') {
      value = parseDuration(params[2]);
      if (!value) {
        throw new CommandSyntaxError(`Invalid duration ${params[2]}`);
      }
      if (value > MAX_DURATION || value < MIN_DURATION) {
        throw new CommandSyntaxError(
          `Duration too long or too short (5s to 2d)`
        );
      }
      field = 'duration';
    } else if (params[1] == 'name') {
      value = params.slice(2).join(' ');
      if (
        value.length < MIN_PROPOSAL_NAME_LENGTH ||
        value.length > MAX_PROPOSAL_NAME_LENGTH
      ) {
        throw new CommandSyntaxError(
          `Proposal description too long or too short (${MIN_PROPOSAL_NAME_LENGTH}-${MAX_PROPOSAL_NAME_LENGTH})`
        );
      }
      field = 'name';
    } else {
      throw new CommandSyntaxError(`Unrecognized field ${params[1]}`);
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
    // Action parser takes care of length
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
    if (isNaN(index)) {
      throw new CommandSyntaxError(`Invalid index ${params[1]}`);
    }
    index--; // 1-indexed => 0-indexed
    if (index < 0) {
      throw new CommandSyntaxError(`Invalid index ${params[1]}`);
    }
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
    if (isNaN(index)) {
      throw new CommandSyntaxError(`Invalid index ${params[1]}`);
    }
    index--; // 1-indexed => 0-indexed
    if (index < 0) {
      throw new CommandSyntaxError(`Invalid index ${params[1]}`);
    }
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
  if (command.startsWith(Command.Help)) {
    const section = command.slice(Command.Help.length).trim();
    return {
      command: Command.Help,
      section,
    };
  }
  return {
    command: Command.Help,
    section: '',
  };
}

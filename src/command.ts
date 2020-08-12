enum Command {
  CreateProposal = 'create proposal',
  CancelProposal = 'cancel proposal',
  UpdateProposal = 'update proposal',
  AddAction = 'add action',
  ReplaceAction = 'replace action',
  RemoveAction = 'remove action',
  RunProposal = 'run proposal',
}

interface CreateProposalCommand {
  command: Command.CreateProposal;
  duration: number; // Seconds
  name: string;
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
  command: string
): CreateProposalCommand | CancelProposalCommand | UpdateProposalCommand {
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
  if (command.startsWith(Command.AddAction)) {
  }
  if (command.startsWith(Command.ReplaceAction)) {
  }
  if (command.startsWith(Command.RemoveAction)) {
  }
  if (command.startsWith(Command.RunProposal)) {
  }
}

import {
  Command,
  tCommand,
} from '@/command';

export function parseCommand(command: string, channel: string): tCommand {
  if (command.startsWith(Command.ListProposals)) {
    return {
      command: Command.ListProposals
    };
  }
  if (command.startsWith(Command.GetProposal)) {
    const id = command.slice(Command.GetProposal.length).trim();
    return {
      command: Command.GetProposal,
      id
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

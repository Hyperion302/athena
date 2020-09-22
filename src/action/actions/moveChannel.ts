import { createToken, IToken } from 'chevrotain';
import { Guild } from 'discord.js';
import { ActionSyntaxError } from '../../errors';
import { Action, ResourceReference, MoveRelativePosition } from '..';
import { resolveChannelReference, ResourceList } from '../executor';
import { PlainText } from '../lexer';
import { parseChannelToken } from '../parser';
import { ActionValidationResult, validateChannelReference } from '../validator';

export interface MoveChannelAction {
  action: Action.MoveChannel;
  channel: ResourceReference;
  direction: MoveRelativePosition;
  subject: ResourceReference;
}
export const moveChannelToken = createToken({
  name: Action.MoveChannel,
  pattern: new RegExp(Action.MoveChannel),
  longer_alt: PlainText,
});
export function parseMoveChannelAction(tokens: IToken[]): MoveChannelAction {
  const channelRef = parseChannelToken(tokens[1]);
  const subjectRef = parseChannelToken(tokens[3]);
  let direction: MoveRelativePosition;
  if (tokens[2].image == MoveRelativePosition.Above) {
    direction = MoveRelativePosition.Above;
  } else if (tokens[2].image == MoveRelativePosition.Below) {
    direction = MoveRelativePosition.Below;
  } else {
    throw new ActionSyntaxError(`Unrecognized direction ${tokens[2].image}`);
  }
  return {
    action: Action.MoveChannel,
    channel: channelRef,
    direction,
    subject: subjectRef,
  };
}
export async function validateMoveChannelAction(
  guild: Guild,
  action: MoveChannelAction
): Promise<ActionValidationResult> {
  const channelValidation = validateChannelReference(guild, action.channel);
  const subjectValidation = validateChannelReference(guild, action.channel);
  return {
    valid: channelValidation.valid && subjectValidation.valid,
    referenceValidations: [channelValidation, subjectValidation],
  };
}
export async function executeMoveChannelAction(
  guild: Guild,
  action: MoveChannelAction,
  resourceList: ResourceList
) {
  const channel = await resolveChannelReference(
    guild,
    resourceList,
    action.channel
  );
  const relativeTo = await resolveChannelReference(
    guild,
    resourceList,
    action.subject
  );
  const subjectPos = relativeTo.position;
  let newPos = 0;
  switch (action.direction) {
    case MoveRelativePosition.Above:
      newPos = subjectPos - 1;
      newPos = Math.max(newPos, 0);
      break;
    case MoveRelativePosition.Below:
      if (channel.type == 'category') {
        newPos = subjectPos + 1;
      } else {
        newPos = subjectPos;
      }
      break;
  }
  await channel.setPosition(newPos);
}

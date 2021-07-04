import { Guild } from 'discord.js';
import { MoveChannelAction, MoveRelativePosition } from "athena-common";
import { resolveChannelReference, ResourceList } from '@/action/executor';
import { ActionValidationResult, validateChannelReference } from '@/action/validator';

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

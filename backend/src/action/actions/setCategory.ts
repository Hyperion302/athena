import { CategoryChannel, Guild } from 'discord.js';
import { SetCategoryAction } from "athena-common";
import { ExecutionError } from '@/errors';
import { resolveChannelReference, ResourceList } from '@/action/executor';
import {
  ActionValidationResult,
  validateCategoryReference,
  validateChannelReference,
} from '@/action/validator';

export async function validateSetCategoryAction(
  guild: Guild,
  action: SetCategoryAction
): Promise<ActionValidationResult> {
  const channelValidation = validateChannelReference(guild, action.channel);
  const categoryValidation = await validateCategoryReference(
    guild,
    action.category
  );
  return {
    valid: channelValidation.valid && categoryValidation.valid,
    referenceValidations: [channelValidation && categoryValidation],
  };
}
export async function executeSetCategoryAction(
  guild: Guild,
  action: SetCategoryAction,
  resourceList: ResourceList,
  i: number
) {
  const channel = await resolveChannelReference(
    guild,
    resourceList,
    action.channel
  );
  if (action.category == null) {
    await channel.setParent(null);
  } else {
    const category = await resolveChannelReference(
      guild,
      resourceList,
      action.category
    );
    if (category.type != 'category') {
      throw new ExecutionError(i, `Target category isn't category`);
    }
    await channel.setParent(category as CategoryChannel); // Must be casted since I check the type above
  }
}

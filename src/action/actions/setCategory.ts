import { createToken, IToken } from 'chevrotain';
import { CategoryChannel, Guild } from 'discord.js';
import { ExecutionError } from '../../errors';
import { Action, ResourceReference } from '..';
import { resolveChannelReference, ResourceList } from '../executor';
import { PlainText } from '../lexer';
import { parseChannelToken } from '../parser';
import {
  ActionValidationResult,
  validateCategoryReference,
  validateChannelReference,
} from '../validator';

export interface SetCategoryAction {
  action: Action.SetCategory;
  channel: ResourceReference;
  category: ResourceReference;
}
export const setCategoryToken = createToken({
  name: Action.SetCategory,
  pattern: new RegExp(Action.SetCategory),
  longer_alt: PlainText,
});
export function parseSetCategoryAction(tokens: IToken[]): SetCategoryAction {
  const channelRef = parseChannelToken(tokens[1]);
  const parentToken = tokens[2];
  if (parentToken.image == 'none') {
    // Unset parent
    return {
      action: Action.SetCategory,
      channel: channelRef,
      category: null,
    };
  }
  const parentRef = parseChannelToken(parentToken);
  return {
    action: Action.SetCategory,
    channel: channelRef,
    category: parentRef,
  };
}
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

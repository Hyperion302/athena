import {
  tResolvedAction,
  Action,
  RoleSetting,
  ChannelSetting,
  ServerSetting,
  MoveRelativePosition,
  ChannelType,
} from 'athena-common';
import durationFormat from "./durationFormat";
import { getPermissionStringsFor } from "./permissions";

export interface RenderedParameter {
  name: string,
  value: string
}
export interface RenderedAction {
  title: string,
  parameters: RenderedParameter[]
}

export function renderAction(action: tResolvedAction): RenderedAction {
  switch(action.action) {
    case Action.Kick:
      return {
        title: `Kick ${action.user.name}`,
        parameters: [{ name: 'User', value: action.user.name }]
      };
    case Action.Ban:
      return {
        title: `Ban ${action.user.name}`,
        parameters: [{ name: 'User', value: action.user.name }]
      };
    case Action.CreateRole:
      return {
        title: `Create a role called ${action.name}`,
        parameters: [{ name: 'Name', value: action.name }]
      };
    case Action.DestroyRole:
      return {
        title: `Destroy @${action.role.name}`,
        parameters: [{ name: 'Role', value: action.role.name }]
      };
    case Action.ChangeRoleAssignment:
      return {
        title: `Change assignment of @${action.role.name}`,
        parameters: [
          { name: 'Role', value: action.role.name },
          { name: 'Grant', value: action.grant.map((u) => u.name).join(", ") },
          { name: 'Revoke', value: action.revoke.map((u) => u.name).join(", ") }
        ]
      };
    case Action.ChangeRolePermissions:
      return {
        title: `Change permissions of @${action.role.name}`,
        parameters: [
          { name: 'Role', value: action.role.name },
          { name: 'Allow', value: getPermissionStringsFor(action.allow).join(", ") },
          { name: 'Deny', value: getPermissionStringsFor(action.deny).join(", ") }
        ]
      };
    case Action.ChangePermissionOverrideOn:
      return {
        title: `Change override for @${action.subject.name} on ${action.channel.name}`,
        parameters: [
          { name: 'Role/User', value: action.subject.name },
          { name: 'Channel', value: action.channel.name },
          { name: 'Allow', value: getPermissionStringsFor(action.allow).join(", ") },
          { name: 'Unset', value: getPermissionStringsFor(action.unset).join(", ") },
          { name: 'Deny', value: getPermissionStringsFor(action.deny).join(", ") }
        ]
      };
    case Action.ChangeRoleSetting:
      switch(action.setting) {
        case RoleSetting.Color:
          return {
            title: `Set @${action.role.name}'s color to ${action.value}`,
            parameters: [
              { name: 'Role', value: action.role.name },
              { name: 'Color', value: action.value.toString() }
            ]
          };
        case RoleSetting.Name:
          return {
            title: `Rename @${action.role.name} to @${action.value}`,
            parameters: [
              { name: 'Role', value: action.role.name },
              { name: 'New Name', value: action.value }
            ]
          };
        case RoleSetting.Mentionable:
          return {
            title: `${action.value ? 'Allow people to mention' : 'Prevent people from mentioning'} @${action.role.name}`,
            parameters: [
              { name: 'Role', value: action.role.name },
              { name: 'Mentionable', value: action.value ? 'Yes' : 'No' }
            ]
          };
        case RoleSetting.Hoist:
          return {
            title: `Display @${action.role.name} ${action.value ? `seperately` : `under "online"`}`,
            parameters: [
              { name: 'Role', value: action.role.name },
              { name: 'Hoist', value: action.value ? 'Yes' : 'No' }
            ]
          };
      }
    case Action.MoveRole:
      return {
        title: `Move @${action.role.name} ${action.direction === MoveRelativePosition.Above ? 'above' : 'below'} @${action.subject.name}`,
        parameters: [
          { name: 'Role', value: action.role.name },
          { name: 'Direction', value: action.direction === MoveRelativePosition.Above ? 'Above' : 'Below' },
          { name: 'Point of Reference', value: action.subject.name }
        ]
      };
    case Action.MoveChannel:
      return {
        title: `Move ${action.channel.name} ${action.direction === MoveRelativePosition.Above ? 'above' : 'below'} ${action.subject.name}`,
        parameters: [
          { name: 'Channel', value: action.channel.name },
          { name: 'Direction', value: action.direction === MoveRelativePosition.Above ? 'Above' : 'Below' },
          { name: 'Point of Reference', value: action.subject.name }
        ]
      };
    case Action.CreateChannel:
      let channelType: string;
      switch(action.type) {
        case ChannelType.Voice:
          channelType = 'Voice';
          break;
        case ChannelType.Text:
          channelType = 'Text';
          break;
        case ChannelType.Category:
          channelType = 'Category';
          break;
      }
      return {
        title: `Create a ${channelType.toLowerCase()} called ${action.name}`,
        parameters: [
          { name: 'Name', value: action.name },
          { name: 'Type', value: channelType }
        ]
      };
    case Action.DestroyChannel:
      return {
        title: `Destroy ${action.channel.name}`,
        parameters: [
          { name: 'Channel', value: action.channel.name }
        ]
      };
    case Action.ChangeServerSetting:
      switch (action.setting) {
        case ServerSetting.AFKChannel:
          return {
            title: `Set the AFK channel to ${action.value.name}`,
            parameters: [
              { name: 'AFK Channel', value: action.value.name }
            ]
          };
        case ServerSetting.AFKTimeout:
          return {
            title: `Set the AFK timeout to ${durationFormat(action.value * 1000)}`,
            parameters: [
              { name: 'AFK Timeout', value: durationFormat(action.value * 1000) }
            ]
          };
        case ServerSetting.Name:
          return {
            title: `Set the server name to ${action.value}`,
            parameters: [
              { name: 'Name', value: action.value }
            ]
          };
        case ServerSetting.ContentFilter:
          return {
            title: `${action.value ? 'Enable' : 'Disable'} the content filter`,
            parameters: [
              { name: 'Filter', value: action.value ? 'Yes' : 'No' }
            ]
          };
      }
    case Action.ChangeChannelSetting:
      switch (action.setting) {
        case ChannelSetting.Name:
          return {
            title: `Rename ${action.channel.name} to ${action.value}`,
            parameters: [
              { name: 'Channel', value: action.channel.name },
              { name: 'Name', value: action.value }
            ]
          };
        case ChannelSetting.Topic:
          return {
            title: `Update ${action.channel.name}'s topic`,
            parameters: [
              { name: 'Channel', value: action.channel.name },
              { name: 'Topic', value: action.value }
            ]
          };
      }
    case Action.SetCategory:
      return {
        title: `Categorize ${action.channel.name} under ${action.category.name}`,
        parameters: [
          { name: 'Channel', value: action.channel.name },
          { name: 'Category', value: action.category.name }
        ]
      };
    case Action.SyncToCategory:
      return {
        title: `Sync ${action.channel.name}'s permission's to its category's`,
        parameters: [
          { name: 'Channel', value: action.channel.name }
        ]
      };
    default:
      return {
        title: '',
        parameters: [],
      };
  }
}

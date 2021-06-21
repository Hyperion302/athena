import {
  Proposal,
  ProposalStatus,
  Vote,
  Votes,
  tResolvedAction,
  Action,
  ReferenceType,
  ResolvedResourceReference,
  ChannelSetting,
  ChannelType,
  RoleSetting,
  ServerSetting,
  MoveRelativePosition,
  NewProposalRequest,
} from "athena-common";
export async function getRecentProposals(
  server: string,
  token: string,
): Promise<Proposal[]> {
  return [
    {
      author: "118427639835918338",
      id: "118427639835918338",
      createdOn: new Date(1612324429 * 1000),
      expiresOn: new Date((1612324400 + 60 * 60) * 1000),
      duration: 60 * 60,
      name: "Awesome test proposal",
      description: "Really awesome test description",
      status: ProposalStatus.Failed,
      server: "339838865370120192",
    },
  ];
}

export async function getClosingProposals(
  server: string,
  token: string,
): Promise<Proposal[]> {
  return [];
}

export async function getProposal(
  proposal: string,
  token: string,
): Promise<Proposal | null> {
  return {
    author: "118427639835918338",
    id: "118427639835918338",
    createdOn: new Date(1613855337 * 1000),
    expiresOn: new Date((1613855337 + 60 * 60) * 1000),
    duration: 60 * 60,
    name: "Awesome test proposal",
    description: "Really awesome test description",
    status: ProposalStatus.Passed,
    server: "339838865370120192",
  };
}

export async function getVotes(
  proposal: string,
  token: string,
): Promise<Votes> {
  return {
    [Vote.Yes]: 9,
    [Vote.No]: 3,
    [Vote.Abstain]: 3,
  };
}

export async function getMyVote(
  proposal: string,
  token: string,
): Promise<Vote | null> {
  return Vote.Yes;
}

export async function vote(
  vote: Vote | null,
  proposal: string,
  token: string,
): Promise<Votes | null> {
  return await getVotes(proposal, token);
}

export async function getActions(
  proposal: string,
  token: string,
): Promise<tResolvedAction[]> {
  const userRef: ResolvedResourceReference = {
    type: ReferenceType.Resolved,
    name: "iCloud#0001",
  };
  const roleRef: ResolvedResourceReference = {
    type: ReferenceType.Resolved,
    name: "Citizen",
  };
  const channelRef: ResolvedResourceReference = {
    type: ReferenceType.Resolved,
    name: "#general",
  };
  const roleRef2: ResolvedResourceReference = {
    type: ReferenceType.Resolved,
    name: "Council Member",
  };
  const channelRef2: ResolvedResourceReference = {
    type: ReferenceType.Resolved,
    name: "#images-5",
  };
  const channelRef3: ResolvedResourceReference = {
    type: ReferenceType.Resolved,
    name: "Text2",
  };
  return [
    {
      action: Action.Kick,
      user: userRef,
    },
    {
      action: Action.Ban,
      user: userRef,
    },
    {
      action: Action.CreateRole,
      name: "Test Role",
    },
    {
      action: Action.DestroyRole,
      role: roleRef,
    },
    {
      action: Action.ChangeRoleAssignment,
      role: roleRef,
      grant: [userRef],
      revoke: [],
    },
    {
      action: Action.ChangeRolePermissions,
      role: roleRef,
      allow: 2048, // Send messages
      deny: 0,
    },
    {
      action: Action.ChangePermissionOverrideOn,
      channel: channelRef,
      subject: roleRef,
      allow: 2048,
      deny: 0,
      unset: 0,
    },
    {
      action: Action.ChangeRoleSetting,
      role: roleRef,
      setting: RoleSetting.Name,
      value: "CitizenV2",
    },
    {
      action: Action.MoveRole,
      role: roleRef,
      direction: MoveRelativePosition.Above,
      subject: roleRef2,
    },
    {
      action: Action.MoveChannel,
      channel: channelRef,
      direction: MoveRelativePosition.Below,
      subject: channelRef2,
    },
    {
      action: Action.CreateChannel,
      name: "images-6",
      type: ChannelType.Text,
    },
    {
      action: Action.DestroyChannel,
      channel: channelRef,
    },
    {
      action: Action.ChangeServerSetting,
      setting: ServerSetting.Name,
      value: "FAXPEX LEGENDS",
    },
    {
      action: Action.ChangeChannelSetting,
      channel: channelRef,
      setting: ChannelSetting.Name,
      value: "general333939393",
    },
    {
      action: Action.SetCategory,
      channel: channelRef,
      category: channelRef3,
    },
    {
      action: Action.SyncToCategory,
      channel: channelRef,
    },
  ];
}


export async function createProposal(proposal: NewProposalRequest): Promise<void> {

}

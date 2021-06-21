
export const permissions = [
  {
    id: 1 << 0,
    display: "Create Invite",
  },
  {
    id: 1 << 1,
    display: "Kick",
  },
  {
    id: 1 << 2,
    display: "Ban",
  },
  {
    id: 1 << 3,
    display: "Administrator",
  },
  {
    id: 1 << 4,
    display: "Manage Channels",
  },
  {
    id: 1 << 5,
    display: "Manage Guild",
  },
  {
    id: 1 << 6,
    display: "Add Reactions",
  },
  {
    id: 1 << 7,
    display: "View Audit Log",
  },
  {
    id: 1 << 8,
    display: "Priority Speaker",
  },
  {
    id: 1 << 9,
    display: "Stream",
  },
  {
    id: 1 << 10,
    display: "View Channel",
  },
  {
    id: 1 << 11,
    display: "Send Messages",
  },
  {
    id: 1 << 12,
    display: "Send TTS Messages",
  },
  {
    id: 1 << 13,
    display: "Manage Messages",
  },
  {
    id: 1 << 14,
    display: "Embed Links",
  },
  {
    id: 1 << 15,
    display: "Attach Files",
  },
  {
    id: 1 << 16,
    display: "Read Message History",
  },
  {
    id: 1 << 17,
    display: "Mention @everyone",
  },
  {
    id: 1 << 18,
    display: "Use External Emoji",
  },
  {
    id: 1 << 19,
    display: "View Insights",
  },
  {
    id: 1 << 20,
    display: "Connect to VC",
  },
  {
    id: 1 << 21,
    display: "Speak",
  },
  {
    id: 1 << 22,
    display: "Mute Members",
  },
  {
    id: 1 << 23,
    display: "Deafen Members",
  },
  {
    id: 1 << 24,
    display: "Move Members",
  },
  {
    id: 1 << 25,
    display: "Use Voice Activity",
  },
  {
    id: 1 << 26,
    display: "Change Nickname",
  },
  {
    id: 1 << 27,
    display: "Manage Nicknames",
  },
  {
    id: 1 << 28,
    display: "Manage Roles",
  },
  {
    id: 1 << 29,
    display: "Manage Webhooks",
  },
  {
    id: 1 << 30,
    display: "Manage Emoji",
  },
  {
    id: 1 << 31,
    display: "Use Slash Commands",
  },
  {
    id: 1 << 32,
    display: "Request to Speak in Stage",
  },
  {
    id: 1 << 33,
    display: "Manage Threads",
  },
  {
    id: 1 << 34,
    display: "Use Public Threads",
  },
  {
    id: 1 << 35,
    display: "Use Private Threads",
  },
];

export function getPermissionStringsFor(permission: number): String[] {
  return permissions.filter((e) => e.id & permission).map((e) => e.display);
}

import { discord, drkt, tokenOpts } from "./api";
import { Channel, ChannelType, Role, User } from "athena-common";

// Channel
export type getChannelsReturnObject = {
  [ChannelType.Text]: Channel[];
  [ChannelType.Voice]: Channel[];
  [ChannelType.Category]: Channel[];
};
export async function getChannels(token: string, server: string): Promise<getChannelsReturnObject> {
  const response = await drkt.get(`server/${server}/proxy/channel`, tokenOpts(token));
  return {
    [ChannelType.Text]: response.data.text.map((partialChannel: any) => ({
      id: partialChannel.id,
      name: partialChannel.name,
      type: ChannelType.Text
    })),
    [ChannelType.Voice]: response.data.voice.map((partialChannel: any) => ({
      id: partialChannel.id,
      name: partialChannel.name,
      type: ChannelType.Voice
    })),
    [ChannelType.Category]: response.data.category.map((partialChannel: any) => ({
      id: partialChannel.id,
      name: partialChannel.name,
      type: ChannelType.Category
    }))
  };/*
  return response.data.reduce((obj: getChannelsReturnObject, channel: any) => {
    const type: ChannelType | null = channel.type
    if (type === null) return;
    if (obj[type] === undefined) obj[type] = [];
    obj[type].push({
      id: channel.id,
      name: channel.name,
      type: type
    });
  });*/
}
/* Not Needed
export async function getChannel(token: string, server: string, channel: string): Promise<Channel> {
}
*/

// Role
function parseRole(raw: any): Role {
  return {
    id: raw.id,
    name: raw.name,
    position: raw.position,
    hoist: raw.hoist
  };
}
export async function getRoles(token: string, server: string): Promise<Role[]> {
  const response = await drkt.get(`/server/${server}/proxy/role`, tokenOpts(token));
  return response.data.map(parseRole);
}

/* Not Needed
export async function getRole(token: string, server: string, role: string): Promise<Role> {

}
*/

// Member
function parseUser(raw: any): User {
  return {
    id: raw.id,
    username: raw.username,
    discriminator: raw.discriminator,
    avatar: raw.avatar
  };
}
const LIMIT = 1000;
export async function getMembers(token: string, server: string, query: string): Promise<User[]> {
  const response = await drkt.get(`/server/${server}/proxy/member`, {
    ...tokenOpts(token),
    params: {
      l: LIMIT,
      q: query
    }
  });
  return response.data;
  /*
  let largestID = "0";
  let flipPage = true;
  let pages = 0;
  const users: User[] = [];
  do {
    const response = await drkt.get(`/proxy/${server}/member`, {
      ...tokenOpts(token),
      params: {
        limit: MAX_USERS_PER_PAGE,
        after: largestID
      }
    });
    const usersInPage: User[] = response.data.map(parseUser);
    largestID = usersInPage.sort((a, b) => {
      const bA = BigInt(a.id)
      const bB = BigInt(b.id)
      return (bA < bB) ? -1 : ((bA > bB) ? 1 : 0)
    }).pop().id;
    users.concat(usersInPage);
    pages++;
    // Do we need to flip the page?
    if (pages == MAX_PAGES) flipPage = false;
    if (usersInPage.length < MAX_USERS_PER_PAGE) flipPage = false;
  } while (flipPage);
  return users;*/
}

export async function getMember(token: string, server: string, member: string): Promise<User> {
  const response = await drkt.get(`/server/${server}/proxy/member/${member}`, tokenOpts(token));
  return parseUser(response.data);
}

export async function getMe(token: string): Promise<User> {
  const response = await discord.get("/users/@me", tokenOpts(token));
  return parseUser(response.data);
}

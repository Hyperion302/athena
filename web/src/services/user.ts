import { User } from "athena-common";
import { discord } from "./api";

export async function getMe(token: string): Promise<User> {
  const response = await discord.request({
    method: "get",
    url: "/users/@me",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return {
    id: response.data.id,
    username: response.data.username,
    discriminator: response.data.discriminator,
    avatar: response.data.avatar,
  };
}

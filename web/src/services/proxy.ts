import { User } from "athena-common";
import { discord } from "./api";

// User

export async function getUser(
  server: string,
  id: string,
  token: string,
): Promise<User> {
  // Will use our proxy after integration
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

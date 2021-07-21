import { OAuthTokenResponse } from "@/models/auth";
import { drkt } from "./api";

export async function login(accessCode: string): Promise<OAuthTokenResponse> {
  const response = await drkt.request({
    method: "post",
    url: "/auth/token",
    data: {
      code: accessCode,
    },
  });
  return {
    accessToken: response.data.access_token,
    refreshToken: response.data.refresh_token,
    expiresIn: response.data.expires_in,
  };
}

export async function refresh(
  refreshToken: string,
): Promise<OAuthTokenResponse> {
  const response = await drkt.request({
    method: "post",
    url: "/auth/refresh",
    data: {
      refreshToken,
    },
  });
  return {
    accessToken: response.data.access_token,
    refreshToken: response.data.refresh_token,
    expiresIn: response.data.expires_in,
  };
}

import axios from "axios";

export const drkt = axios.create({
  baseURL: `${process.env.VUE_APP_API_URL}/api/v1/`
});

export const discord = axios.create({
  baseURL: "https://discord.com/api/v8/",
});

export function tokenOpts(token: string) {
  return {
    headers: { "Authorization": `Bearer ${token}` }
  };
}


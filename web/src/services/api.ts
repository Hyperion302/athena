import axios from "axios";

export const drkt = axios.create({
  baseURL: "http://athena.local:8081/api/v1/",
});

export const discord = axios.create({
  baseURL: "https://discord.com/api/v8/",
});

export function tokenOpts(token: string) {
  return {
    headers: { "Authorization": `Bearer ${token}` }
  };
}


import { User } from "@/models/user";
import { Server } from "@/models/server";

export interface AuthState {
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  refreshIntervalID?: ReturnType<typeof setTimeout>;
  expiresIn?: number;
  loginURL: string;

  servers: { [id: string]: Server };
}



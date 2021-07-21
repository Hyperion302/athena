import Vue from "vue";
import { User } from "@/models/user";
import { login, refresh } from "@/services/auth";
import { Server } from "@/models/server";
import { getMe } from "@/services/user";
import {
  Dispatch,
  ActionTree,
  MutationTree,
  GetterTree,
  Module
} from "vuex";
import { getServers, filterServers } from "@/services/servers";
import { AuthState } from './types';
import { RootState } from '../types';

// State

const clientID = process.env.VUE_APP_CLIENT_ID
const redirect = `${process.env.VUE_APP_URL}/authRedirect`
const state: AuthState = {
  loginURL: `https://discord.com/api/oauth2/authorize?client_id=${
    clientID
  }&redirect_uri=${encodeURIComponent(
    redirect
  )}&response_type=code&scope=identify%20guilds`,
  servers: {}
}

// Getters
const getters: GetterTree<AuthState, RootState> = {
  loggedIn(state): boolean {
    return state.accessToken !== undefined;
  },
  userReady(state): boolean {
    return state.user !== undefined;
  },
  loginURL(state): string { return state.loginURL; },
  token(state): string {
    const { accessToken } = state;
    return accessToken || '';
  }
};

// Mutations
const mutations: MutationTree<AuthState> = {
  setServers(state, payload: Server[]) {
    state.servers = {};
    payload.forEach((server) => {
      Vue.set(state.servers, server.id, server);
    });
  },
  logout(state) {
    Vue.delete(state, "accessToken");
    Vue.delete(state, "expiresIn")
    clearInterval(state.refreshIntervalID);
    Vue.delete(state, "refereshIntervalID");
    Vue.delete(state, "user");
    window.localStorage.removeItem("accessToken");
    window.localStorage.removeItem("refreshToken");
    window.localStorage.removeItem("expiration");
  },
  setUser(state, payload: User) {
    Vue.set(state, "user", payload);
  },
  setTokens(state, payload: {
    access: string;
    refresh: string;
    expires: number;
  }) {
    Vue.set(state, "accessToken", payload.access);
    Vue.set(state, "refereshToken", payload.refresh);
    Vue.set(state, "expiresIn", payload.expires);
    window.localStorage.setItem("accessToken", payload.access);
    window.localStorage.setItem("refreshToken", payload.refresh);
    window.localStorage.setItem(
      "expiration",
      (Math.floor(Date.now() / 1000) + payload.expires).toString(),
    );
  },
  startInterval(state, payload: { dispatchFunc: Dispatch }) {
    if (state.expiresIn === undefined) return;
    state.refreshIntervalID = setInterval(() => {
      Vue.delete(state, "accessToken");
      Vue.delete(state, "expiresIn");
      payload.dispatchFunc("refresh");
    }, state.expiresIn * 1000);
  },
  clearInterval(state) {
    if (state.refreshIntervalID === undefined) return;
    clearInterval(state.refreshIntervalID);
  }
};

// Actions
const actions: ActionTree<AuthState, RootState> = {
  async fetchUser({ state, commit }): Promise<void> {
    if (state.accessToken === undefined) return;
    const meResponse = await getMe(state.accessToken);
    commit("setUser", meResponse);
  },
  async login({ dispatch, commit }, payload: { code: string }): Promise<void> {
    const tokenResponse = await login(payload.code);
    commit("clearInterval");
    commit("setTokens", {
      access: tokenResponse.accessToken,
      refresh: tokenResponse.refreshToken,
      expires: tokenResponse.expiresIn,
    });
    commit("startInterval", {
      dispatchFunc: dispatch,
    });
    await dispatch("fetchUser");
  },
  async refresh({ state, commit, dispatch }): Promise<void> {
    if (state.refreshToken === undefined) return;
    const tokenResponse = await refresh(state.refreshToken);
    commit("clearInterval");
    commit("setTokens", {
      access: tokenResponse.accessToken,
      refresh: tokenResponse.refreshToken,
      expires: tokenResponse.expiresIn,
    });
    commit("startInterval", {
      dispatchFunc: dispatch,
    });
  },
  async loadTokens({ commit, dispatch }): Promise<void> {
    const access = window.localStorage.getItem("accessToken");
    const refresh = window.localStorage.getItem("refreshToken");
    const expiration = parseInt(
      window.localStorage.getItem("expiration") ?? "",
    );
    // Check if we expired yet
    if (expiration && Math.floor(Date.now() / 1000) < expiration - 10) {
      // Do we have tokens?
      if (access && refresh) {
        commit("setTokens", {
          access,
          refresh,
          expires: expiration - Math.floor(Date.now() / 1000),
        });
        commit("clearInterval");
        commit("startInterval", {
          dispatchFunc: dispatch,
        });
      } else if (refresh) {
        commit("setTokens", {
          access: "",
          refresh,
          expires: -1,
        });
        await dispatch("refresh");
      } else {
        return;
      }
      // If we were able to load tokens, fetch the user
      dispatch("fetchUser", { token: access });
    }
  },
  async fetchServers({ state, commit }): Promise<void> {
    if (state.accessToken === undefined) return;
    const servers = await getServers(state.accessToken).then((srs) => filterServers(state.accessToken, srs));
    commit("setServers", servers);
  }
};

const auth: Module<AuthState, RootState> = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

export default auth;

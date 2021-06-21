// Using https://codeburst.io/vuex-and-typescript-3427ba78cfa8
import Vuex, { StoreOptions } from "vuex";
import Vue from "vue";

import { RootState } from "@/store/types";
import auth from "@/store/auth";

Vue.use(Vuex);

const store: StoreOptions<RootState> = {
  modules: {
    auth
  }
};

export default new Vuex.Store<RootState>(store);

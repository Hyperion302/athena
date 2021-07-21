import Vue from "vue";
import App from "@/App.vue";
import router from "@/router";
import store from "@/store";
import vuetify from "./plugins/vuetify";

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
  vuetify,

  beforeCreate() {
    if (this.$route.path !== "/authRedirect") {
      this.$store.dispatch("auth/loadTokens")
      .then(() => {
        if (this.$store.getters["auth/loggedIn"]) {
          this.$store.dispatch("auth/fetchServers");
        }
      });
    }
  },
}).$mount("#app");

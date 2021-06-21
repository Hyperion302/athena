<template>
  <p>Loading</p>
</template>

<script lang="ts">
import Vue from "vue";
import {
  mapState,
  mapActions
} from "vuex";
/*import { Component, Vue } from "vue-property-decorator";
import { namespace } from "vuex-class";*/

export default Vue.extend({
  data: function() { return {}; },
  computed: mapState('auth', {
    accessToken: 'accessToken'
  }),
  methods: mapActions('auth', [
    'login'
  ]),
  mounted() {
    const error = this.$route.query.error;
    const code = this.$route.query.code;
    const state = this.$route.query.state;

    console.log({ error, code, state });
    if (error) {
      // TODO: Auth error
      console.error(`[AUTH] ${error}`);
      this.$router.push({ name: "Home" });
      return;
    }
    // Verify state
    const expectedState = window.localStorage.getItem("state");
    if (state !== expectedState) {
      // TODO: Auth error
      console.error(`[AUTH] State ${state} does not match expected ${expectedState}`);
      this.$router.push({ name: "Home" });
      return;
    }
    if (!(code instanceof Array)) {
      console.log(`[AUTH] Logging in with ${code}`);
      this.login({ code }).then(() => {
        this.$router.push({ name: "Dashboard" });
      });
    }
  }
});

/*const authModule = namespace("Auth");
@Component
export default class AuthRedirect extends Vue {
  @authModule.Action
  private login!: (payload: { code: string }) => Promise<void>;
  @authModule.State
  private accessToken!: string;

  public mounted() {
    const error = this.$route.query.error;
    const code = this.$route.query.code;
    const state = this.$route.query.state;

    console.log({ error, code, state });
    if (error) {
      // TODO: Auth error
      console.error(`[AUTH] ${error}`);
      this.$router.push({ name: "Home" });
      return;
    }
    // Verify state
    const expectedState = window.localStorage.getItem("state");
    if (state !== expectedState) {
      // TODO: Auth error
      console.error(`[AUTH] State ${state} does not match expected ${expectedState}`);
      this.$router.push({ name: "Home" });
      return;
    }
    if (!(code instanceof Array)) {
      console.log(`[AUTH] Logging in with ${code}`);
      this.login({ code }).then(() => {
        this.$router.push({ name: "Dashboard" });
      });
    }
  }
}*/
</script>

<style></style>

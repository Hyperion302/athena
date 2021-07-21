<template>
  <v-app-bar
    dense
    dark
    color="#0039cb"
    flat 
    app
  >
    <v-toolbar-title style="cursor: pointer" @click="$router.push('/')">ATHENA</v-toolbar-title>
    <v-spacer />
    <v-toolbar-items>
      <v-btn
        plain
        to="/docs"
      >Docs</v-btn>
      <template v-if="loggedIn">
        <v-btn
          plain
          to="/newProposal"
        >New Proposal</v-btn>
        <navbar-profile v-if="userReady" :user="user" />
      </template>
      <v-btn
        plain 
        :href="`${loginURL}&state=${state}`"
        @click="updateState()"
        v-else
        >
        Log in
      </v-btn>
    </v-toolbar-items>
  </v-app-bar>
</template>

<script lang="ts">
import Vue from "vue";
import {
  mapState,
  mapGetters,
  mapMutations
} from "vuex";
import NavbarProfile from "@/components/NavbarProfile.vue";
import generateState from "@/util/generateState";


export default Vue.extend({
  data() { return { state: 0 }; },
  components: { NavbarProfile },
  computed: {
    ...mapState("auth", {
      loginURL: "loginURL",
      user: "user"
    }),
    ...mapGetters("auth", [
      "loggedIn",
      "userReady"
    ])
  },
  methods: {
    ...mapMutations('auth', {
      logout: 'logout'
    }),
    updateState() { this.state = generateState(); }
  }
});
</script>

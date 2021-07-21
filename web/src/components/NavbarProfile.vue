<template>
  <span>
    <v-menu 
      rounded
      offset-y
    >
      <template v-slot:activator="{ on }">
        <v-btn
          icon
          v-on="on">
          <v-avatar size="32">
            <img :src="avatarURL">
          </v-avatar>
        </v-btn>
      </template>
      <v-list>
        <v-list-item>
          <v-btn
            depressed
            text
            to="/dashboard">Dashboard</v-btn>
        </v-list-item>
        <v-list-item>
          <v-btn
            depressed
            text
            @click="logout()">Log out</v-btn>
        </v-list-item>

      </v-list>
    </v-menu>
  </span>
</template>

<script lang="ts">
import Vue from "vue";
import { mapActions } from "vuex";
import { User } from "@/models/user";
import Dropdown from "@/components/Dropdown.vue";

export default Vue.extend({
  data() { return { dropdown: false }; },
  props: ['user'],
  computed: {
    avatarURL(): string {
      if (this.user.avatar) {
        const extension = this.user.avatar.startsWith("a_") ? "gif" : "png";
        return `https://cdn.discordapp.com/avatars/${this.user.id}/${this.user.avatar}.${extension}`;
      } else {
        return `https://cdn.discordapp.com/avatars/${this.user.discriminator}.png`;
      }
    }
  },
  methods: {
    toggleDropdown() { this.dropdown = !this.dropdown; },
    ...mapActions('auth', {
      logout: 'logout'
    })
  }
});
</script>

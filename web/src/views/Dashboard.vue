<template>
  <v-main>
    <v-container fill-height fluid>
      <v-row dense>
        <v-col
          v-for="server in servers"
          :key="server.id"
          cols=3>
          <v-card
            :to="`/servers/${server.id}`">
            <v-img
              aspect-ratio="1"
              height="200px"
              class="white--text align-end"
              gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
              :src="getBackgroundString(server.id, server.icon)">
              <v-card-title v-text="server.name" />
            </v-img>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script lang="ts">
import Vue from "vue"
import { mapState } from "vuex"
import { Proposal } from "athena-common";
import { Server } from "@/models/server";

export default Vue.extend({
  data() { return {}; },
  computed: mapState('auth', {
    servers: 'servers'
  }),
  methods: {
    getBackgroundString(id: string, icon: string): string {
      if (!id || !icon) {
        return "";
      }
      let extension = "png";
      if (icon[0] === "a" && icon[1] === "_") {
        extension = "gif";
      }
      return `url("https://cdn.discordapp.com/icons/${id}/${icon}.${extension}")`;
    }
  },
  mounted() {
    this.$store.dispatch('auth/fetchServers');
  }
});
</script>

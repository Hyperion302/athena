<template>
  <v-main>
    <v-container fluid>
      <v-row>
        <v-col>
          <h1>Recent</h1>
          <v-progress-linear
            v-if="recentProposalsLoading"
            indeterminate
          />
          <p v-else-if="recentProposals.length == 0">No proposals</p>
          <proposal-tile
            v-for="proposal in recentProposals"
            :key="proposal.id"
            :proposal="proposal"
            v-else
          />
        </v-col>
        <v-col>
          <h1>Closing Soon</h1>
          <v-progress-linear
            v-if="closingProposalsLoading"
            indeterminate
          />
          <p v-else-if="closingProposals.length == 0">No proposals</p>
          <proposal-tile
            v-for="proposal in closingProposals"
            :key="proposal.id"
            :proposal="proposal"
            v-else
          />
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapGetters } from "vuex";
import ProposalTile from "@/components/ProposalTile.vue";
import { Proposal } from "athena-common";
import { getRecentProposals, getClosingProposals } from "@/services/proposals";

export default Vue.extend({
  props: [ "serverID" ],
  components: { ProposalTile },
  data() { return {
    recentProposals: <Proposal[]>[],
    recentProposalsLoading: false,
    closingProposals: <Proposal[]>[],
    closingProposalsLoading: false,
  }; },
  computed: {
    ...mapState("auth", {
      servers: "servers"
    }),
    ...mapGetters("auth", [
      "token"
    ])
  },
  created() {
    if (!this.serverID) {
      return;
    }
    this.recentProposalsLoading = true;
    getRecentProposals(this.serverID, this.token).then((proposals) => {
      this.recentProposals = proposals;
      this.recentProposalsLoading = false;
    });

    this.closingProposalsLoading = true;
    getClosingProposals(this.serverID, this.token).then((proposals) => {
      this.closingProposals = proposals;
      this.closingProposalsLoading = false;
    });
  }
});
</script>

<style lang="scss">
.quick-actions {
  padding: 25px;
  margin: 0;
  .dynamic-button:first-child {
    margin: 10px 10px 10px 0;
  }
  .dynamic-button:last-child {
    margin: 10px 0 10px 10px;
  }
}
.server-body {
  display: flex;
  width: 100%;
  box-sizing: border-box;
  padding: 25px;

  .recent-proposals {
    flex: 50%;
  }
  .closing-soon {
    flex: 50%;
  }
}
</style>

<template>
  <v-main>
    <v-container fluid>
      <v-row>
        <v-col>
          <h1>All Proposals</h1>
        </v-col>
      </v-row>
      <v-row
        justify="center"
      >
        <v-col
          cols="6"
        >
          <v-data-table
            :headers="headers"
            :items="renderedProposals"
            :loading="largestID === null"
            class="elevation-1"
          >
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script lang="ts">
import Vue from "vue";
import { mapGetters } from "vuex";

import { Vote, ResolvedProposal, Proposal, ProposalStatus } from "athena-common";
import durationFormat from "@/util/durationFormat";
import { getProposals } from "@/services/proposals";

export default Vue.extend({
  data() { return {
    proposals: <Proposal[]>[],
    largestID: <string | null>null,
    headers: <any[]>[
      { text: "Name", value: "name" },
      { text: "Author", value: "author" },
      { text: "Duration", value: "duration" },
      { text: "Status", value: "status" },
      { text: "Yes", value: "yes" },
      { text: "No", value: "no" },
      { text: "Abstain", value: "abstain" }
    ],
    statusMap: {
      [ProposalStatus.Building]: "Building",
      [ProposalStatus.Running]: "Running",
      [ProposalStatus.Cancelled]: "Cancelled",
      [ProposalStatus.Failed]: "Failed",
      [ProposalStatus.Passed]: "Passed",
      [ProposalStatus.ExecutionError]: "Could not execute"
    }
  }; },
  props: ["serverID"],
  created() {
    // Fetch proposals
    this.fetchLoop();
  },
  computed: {
    ...mapGetters("auth", [ "token" ]),
    renderedProposals() {
      return this.proposals.map((p: ResolvedProposal) => {
        return {
          name: p.name,
          author: p.author.name,
          duration: durationFormat(p.duration * 1000),
          status: this.statusMap[p.status],
          yes: p.votes[Vote.Yes],
          no: p.votes[Vote.No],
          abstain: p.votes[Vote.Abstain]
        }
      });
    }
  },
  methods: {
    async fetchLoop() {
      let lastCount = 0;
      do {
        try {
          const newBatch = await getProposals(
            this.serverID,
            this.largestID,
            this.token
            );
          lastCount = newBatch.length;
          this.proposals = this.proposals.concat(newBatch);
          const ids = newBatch
          .map((p: Proposal) => BigInt(p.id))
          .sort((a: bigint, b: bigint) => (a < b) ? -1 : ((a > b) ? 1 : 0))
          this.largestID = ids[ids.length - 1].toString();
        } catch {
          return;
        }
      } while (lastCount > 0);
    }
  }
});
</script>

<style>

</style>

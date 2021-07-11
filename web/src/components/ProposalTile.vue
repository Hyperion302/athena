<template>
  <v-card
    outlined
    max-width="400"
    @click="$router.push(`/servers/${proposal.server.original.id}/proposals/${proposal.id}`)"
  >
    <v-progress-linear
      :value="barValue"
      :color="myVote == Vote.No ? 'error' : 'success'"
      :indeterminate="!proposal"
    />
    <v-row no-gutters v-if="proposal">
      <v-col>
        <v-card-title
          class="text-h5"
          v-text="trunc(proposal.name, 32)"
        />
        <v-card-subtitle
          v-text="trunc(proposal.description, 64)"
        />
      </v-col>
      <v-col
        cols="3"
        align-self="center"
      >
        <v-card-actions v-if="proposal.status == ProposalStatus.Running">
          <v-btn 
            :disabled="myVote == Vote.Yes"
            @click.stop="vote(Vote.Yes)"
            dark
            icon>
            <h1>👍</h1>
          </v-btn>
          <v-btn
            :disabled="myVote == Vote.No"
            @click.stop="vote(Vote.No)"
            dark
            icon>
            <h1>👎</h1>
          </v-btn>
        </v-card-actions>
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import { mapGetters } from "vuex";
import { Proposal, Vote, ProposalStatus } from "athena-common";
import truncate from "../util/truncate";
import { getMyVote, getProposal, vote } from "@/services/proposals";

export default Vue.extend({
  data() { return {
    myVote: <Vote>null,
    ProposalStatus,
    proposal: <Proposal>null,
    Vote,
  }; },
  props: ['proposalID', 'serverID'],
  created() {
    if (!this.proposalID) { return; }
    this.fetchProposal();
    // Fetch MY vote
    this.fetchMyVote();
  },
  computed: {
    ...mapGetters("auth", [
      'token'
    ]),
    barValue() {
      if (!this.proposal) return 0;
      const total = this.proposal.votes[Vote.Yes] + this.proposal.votes[Vote.No] + this.proposal.votes[Vote.Abstain];
      const count = this.myVote === Vote.No ? this.proposal.votes.no : this.proposal.votes.yes;
      return (count * 100) / total;
    }
  },
  methods: {
    async fetchProposal() {
      if (!this.proposalID) { return; }
      this.proposal = await getProposal(this.serverID, this.proposalID, this.token);
    },
    async fetchMyVote() {
      this.myVote = await getMyVote(this.serverID, this.proposalID, this.token);
    },
    async vote(v: Vote) {
      if (!this.proposal) { return; }
      const votes = await vote(v, this.proposal.server.original.id, this.proposal.id, this.token);
      if (votes !== null) {
        this.myVote = v;
        this.proposal.votes = votes;
      }
    },
    trunc: truncate
  },
});
</script>

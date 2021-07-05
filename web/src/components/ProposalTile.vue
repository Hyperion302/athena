<template>
  <v-card
    outlined
    max-width="400"
    @click="$router.push(`/servers/${proposal.server}/proposals/${proposal.id}`)"
  >
    <v-progress-linear
      :value="((myVote == Vote.No ? no : yes) * 100) / (yes + no + abstain)"
      :color="myVote == Vote.No ? 'error' : 'success'"
    />
    <v-row no-gutters>
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
import { getVotes, getMyVote, vote } from "@/services/proposals";

export default Vue.extend({
  data() { return {
    yes: 0,
    no: 0,
    abstain: 0,
    myVote: null,
    ProposalStatus,
    Vote,
  }; },
  props: ['proposal'],
  created() {
    if (!this.proposal) { return; }
    // Fetch votes
    this.fetchVotes();
    // Fetch MY vote
  },
  computed: mapGetters("auth", [
    'token'
  ]),
  methods: {
    async fetchVotes() {
      if (!this.proposal) { return; }
      const votes = await getVotes(this.proposal.server, this.proposal.id, this.token);
      this.yes = votes[Vote.Yes];
      this.no = votes[Vote.No];
      this.abstain = votes[Vote.Abstain];
    },
    async fetchMyVote() {
      if (!this.proposal) { return; }
      this.myVote = await getMyVote(this.proposal.server, this.proposal.id, this.token);
    },
    async vote(v: Vote) {
      if (!this.proposal) { return; }
      const votes = await vote(v, this.proposal.server, this.proposal.id, this.token);
      if (votes !== null) {
        this.myVote = v;
        this.yes = votes[Vote.Yes];
        this.no = votes[Vote.No];
        this.abstain = votes[Vote.Abstain];
      }
    },
    trunc: truncate
  },
});
</script>

<template> 
  <v-main>
    <v-container>
      <v-row><h1>Proposals</h1></v-row>
      <v-row><p>Proposals are the main idea of Athena.  Members create 
      proposals that describe changes to be made.  Other members then vote on 
      proposals.  Winning proposals have their changes implemented.</p></v-row>
      <v-row><p>You can view <b>Recent Proposals</b> and proposals that are 
      <b>Expiring Soon</b> on a server's page.  You can also view a full list 
      of a server's proposals by clicking <b>View All</b> on a server's page.</p></v-row>
      <v-row><h2>Creating</h2></v-row>
      <v-row><p>The first step in using Athena is creating a proposal.  
      Proposals can be voted on by the rest of the server.  Consider them a 
      "request for changes".  All proposals are scoped to a specific server.  
      Click <b>New Proposal</b> in your navbar and enter the desired name, 
      description (optional), duration, and server for the proposal.</p></v-row>
      <v-row>
        <v-alert outlined text type="info">
          To see a list of all the servers you belong to that are also running 
          Athena, view your <b><router-link to="/dashboard">Dashboard</router-link></b>
        </v-alert>
      </v-row>
      <v-row><p>After selecting a server, you can optionally add 
      <i>actions</i> to your proposal.  Press the plus button that appears 
      after selecting a server to be prompted to select an action type.  Actions
      are run in order of appearence.  To remove the last action added, press 
      the minus button.</p></v-row>
      <v-row>
        <v-alert outlined text type="warning">
          <b>Proposals cannot be modified or deleted after they are made.</b>  Make sure the proposal is just how you want it to be before creating it.
        </v-alert>
      </v-row>
      <v-row><h2>Voting</h2></v-row>
      <v-row><p>Once a proposal is made, it can be voted on for a period of 
      time called its <i>duration</i>.  You can vote either <b>Yes</b> or 
      <b>No</b>.  If you would like to abstain from choosing a side but would 
      still like to be tallied, you can <b>Abstain</b>.  You can vote either in
      a proposal's main screen or in the small tile that shows on a server's
      detail page</p></v-row>
      <v-row><h2>Execution</h2></v-row>
      <v-row><p>Once proposal's voting phase ends, Athena tallies its votes.  If
      a proposal has majority yes votes it is <i>executed</i>.  During
      execution, all actions run in order.  If any actions encounter an error (e.g.
      the user it was supposed to kick has already left the server)
      execution will halt and no more actions will be run.</p></v-row>
      <v-row>
        <v-alert outlined text type="warning">
          Because execution can be halted by faulty actions, it is recommended to
          place actions that are likely to cause errors (kicks, bans, etc.) at the
          end of your proposals.
        </v-alert>
      </v-row>
      <v-row><h1>Known Issues</h1></v-row>
      <v-row><p>The <b>New Proposal</b> screen <i>will not</i> warn you if you
      attempt to remove a role from a user who doesn't already have said role.
      If you create an action that does that, it will error.  Similarily,
      attempting to sync a channel with no category to its category will produce
      and error.</p></v-row>
    </v-container>
  </v-main>
</template>
<script lang="ts">
import Vue from "vue";

export default Vue.extend({});
</script>

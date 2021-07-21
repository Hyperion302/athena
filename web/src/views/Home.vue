<template>
  <v-main class="home">
    <v-container fill-height fluid>
      <v-row
        align="center"
        justify="center">
          <v-spacer />
          <v-col>
            <div class="title">Athenian Democracy</div>
            <div class="subtitle">in Discord</div>
          </v-col>
          <v-col>
            <v-btn
              outlined
              depressed
              dark
              href="https://discord.com/oauth2/authorize?client_id=431986820612620310&scope=bot&permissions=2013265974"
            >Add to Discord</v-btn>
          </v-col>
          <v-spacer />
      </v-row>
    </v-container>
  </v-main>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({ });
</script>
<style lang="scss">
.home {
  background: #0039cb;
  .title {
    color: #eeeeee;
  }
  .subtitle {
    color: #eeeeee;
  }
}

</style>

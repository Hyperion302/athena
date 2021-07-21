<template>
  <v-app>
    <navbar />
    <router-view/>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import Navbar from "@/components/Navbar.vue";

export default Vue.extend({
  name: "App",
  data() { return {}; },

  components: { Navbar },
});
</script>
<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap');

html {
  font-family: 'Noto Sans', sans-serif;
}
</style>

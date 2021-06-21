<template>
  <v-expansion-panels accordion>
    <v-expansion-panel
      v-for="(action, i) in renderedActions"
      :key="i"
    >
      <v-expansion-panel-header>{{ action.title }}</v-expansion-panel-header>
      <v-expansion-panel-content>
        <div
          v-for="(param, i) in action.parameters"
          :key="i"
        >
          {{ param.name }} : {{ param.value }}
        </div>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>
<script lang="ts">
import Vue from 'vue';
import {
  RenderedAction,
  renderAction
} from "@/util/renderAction";

export default Vue.extend({
  props: ['actions'],
  data: function () {
    return { }
  },
  computed: {
    renderedActions(): RenderedAction[] { return this.actions.map(renderAction); }
  }
});
</script>

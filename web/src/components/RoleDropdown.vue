<template>
  <v-autocomplete
    v-model="selected"
    :rules="rules"
    :items="roles"
    :label="label"
    return-object
    item-text="name"
  />
</template>
<script lang="ts">
import Vue from "vue";
import { User } from "athena-common";

export default Vue.extend({
  props: ['roles', 'rules', 'value', 'label'],
  computed: {
    selected: {
      get() { return this.value; },
      set(newUser: User) { this.$emit('input', newUser); }
    }
  }
})
</script>

<template>
  <v-autocomplete
    v-model="selection"
    :rules="rules"
    :items="permissions"
    :label="label"
    return-object
    item-text="display"
    chips
    deletable-chips
    multiple
    small-chips
  />
</template>
<script lang="ts">
import Vue from "vue";
import { permissions } from "@/util/permissions";

export default Vue.extend({
  props: ['value', 'multiple', 'label', 'rules'],
  data() { return {
    permissions
  }; },
  computed: {
    selection: {
      get() { return this.value; },
      set(newValue: any) { this.$emit('input', newValue); }
    }
  }
})
</script>

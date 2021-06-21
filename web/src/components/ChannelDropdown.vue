<template>
  <v-autocomplete
    v-model="selected"
    :rules="rules"
    :items="flatChannels"
    :label="label"
    return-object
    item-text="name"
  />
</template>
<script lang="ts">
import Vue from "vue";
import { User, ChannelType } from "athena-common";

export default Vue.extend({
  props: ['channels', 'rules', 'value', 'label', 'text', 'voice', 'category'],
  computed: {
    selected: {
      get() { return this.value; },
      set(newUser: User) { this.$emit('input', newUser); }
    },
    flatChannels() {
      let channels: any[] = [];
      if (this.text !== undefined) { channels = channels.concat(this.channels[ChannelType.Text]); }
      if (this.voice !== undefined) { channels = channels.concat(this.channels[ChannelType.Voice]); }
      if (this.category !== undefined) { channels = channels.concat(this.channels[ChannelType.Category]); }
      return channels;
    }
  }
})
</script>

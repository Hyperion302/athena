<template>
  <v-select
    v-model="selection"
    :rules="rules"
    :items="settings"
    :label="label"
    return-object
    item-text="name"
  />
</template>
<script lang="ts">
import Vue from "vue";
import { RoleSetting, ChannelSetting, ServerSetting } from "athena-common";

export default Vue.extend({
  props: ['value', 'multiple', 'label', 'rules', 'server', 'channel', 'role'],
  data() { return {
    roleSettings: [
      { name: "Name", value: RoleSetting.Name },
      { name: "Color", value: RoleSetting.Color },
      { name: "Hoist", value: RoleSetting.Hoist },
      { name: "Mentionable", value: RoleSetting.Mentionable }
    ],
    channelSettings: [
      { name: "Name", value: ChannelSetting.Name },
      { name: "Topic", value: ChannelSetting.Topic }
    ],
    serverSettings: [
      { name: "AFK Channel", value: ServerSetting.AFKChannel },
      { name: "AFK Timeout", value: ServerSetting.AFKTimeout },
      { name: "Name", value: ServerSetting.Name },
      { name: "Content Filter Enabled", value: ServerSetting.ContentFilter }
    ]
  }; },
  computed: {
    selection: {
      get() {
        return this.settings.find((el: { name: string, value: RoleSetting | ChannelSetting | ServerSetting }) => el.value === this.value );
      },
      set(newValue: any) { this.$emit('input', newValue.value); }
    },
    settings() {
      return [
        ...(this.role !== undefined ? this.roleSettings : []),
        ...(this.channel !== undefined ? this.channelSettings : []),
        ...(this.server !== undefined ? this.serverSettings : [])
      ]
    }
  }
})
</script>

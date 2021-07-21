<template>
  <v-autocomplete
    v-model="selection"
    :loading="loading"
    :items="items"
    :rules="rules"
    :search-input.sync="search"
    item-text="username"
    cache-items
    hide-no-data
    return-object
    flat
    :label="label"
    :chips="multiple"
    :deletable-chips="multiple"
    :multiple="multiple"
    :small-chips="multiple"
  >
        <template v-slot:item="data">
      <v-list-item-avatar>
        <v-img :src="`https://cdn.discordapp.com/avatars/${data.item.id}/${data.item.avatar}.png?desiredSize=64`" />
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title>{{ data.item.username }}#{{ data.item.discriminator }}</v-list-item-title>
      </v-list-item-content>
    </template>
  </v-autocomplete>
</template>
<script lang="ts">
import Vue from "vue";
import { mapGetters } from "vuex";
import { debounce } from "underscore";
import { getMembers } from "@/services/discord";
import { User } from "athena-common";

export default Vue.extend({
  props: ['server', 'value', 'label', 'rules', 'multiple'],
  data() { return {
    loading: false,
    search: <string>null,
    items: <User[]>[],
  }; },
  computed: {
    ...mapGetters("auth", [
      "token"
    ]),
    selectedFullName(): string | null {
      if (this.selection === undefined) return null;
      if (this.multiple) return null; // Meaningless with multiple names
      return `${this.selection.username}#${this.selection.discriminator}`;
    },
    selection: {
      get: function () { return this.value; },
      set: function (newValue: User | User[]) { return this.$emit('input', newValue); }
    },
  },
  methods: {
    searchUsers: debounce(function (v: string) {
      this.loading = true;
      getMembers(this.token, this.server, v)
      .then((members) => {
        this.items = members;
        this.loading = false;
      })
    }, 300)
  },
  watch: {
    search (searchString: string) {
      searchString &&
      searchString !== this.selectedFullName &&
      this.searchUsers(searchString);
    },
  },
});
</script>


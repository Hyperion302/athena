<template>
  <v-main>
    <v-container fluid>
      <v-progress-linear
        color="blue"
        indeterminate
        absolute
        top
        v-if="loadingRoles || loadingChannels"
      />
     <v-row>
      <v-col>
        <div class="text-h2 text-center">Create a Proposal</div>
      </v-col>
     </v-row>
     <v-form
      v-model="valid"
     >
      <v-row justify="center">
        <v-col :cols="$vuetify.breakpoint.smAndDown ? 10 : 4">
          <v-text-field
            label="Name"
            :rules="[rules.required]"
            v-model="name"
          />
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-col :cols="$vuetify.breakpoint.smAndDown ? 10 : 4">
          <v-textarea
            label="Description"
            auto-grow
            counter
            :rules="[rules.proposalDescriptionMin, rules.proposalDescriptionMax]"
            v-model="description"
          />
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-subheader>Duration</v-subheader>
        <v-col :cols="$vuetify.breakpoint.smAndDown ? 2 : 1">
          <v-text-field
            label="Sec"
            class="mt-0 pt-0"
            type="number"
            outlined
            dense
            :rules="[rules.required, rules.nonNegative]"
            v-model="durationSeconds"
          />
        </v-col>
        <v-col :cols="$vuetify.breakpoint.smAndDown ? 2 : 1">
          <v-text-field
            label="Min"
            class="mt-0 pt-0"
            type="number"
            outlined
            dense
            :rules="[rules.required, rules.nonNegative]"
            v-model="durationMinutes"
          />
        </v-col>
        <v-col :cols="$vuetify.breakpoint.smAndDown ? 2 : 1">
          <v-text-field
            label="Hr"
            class="mt-0 pt-0"
            type="number"
            outlined
            dense
            :rules="[rules.required, rules.nonNegative]"
            v-model="durationHours"
          />
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-col :cols="$vuetify.breakpoint.smAndDown ? 10 : 4">
          <v-select
            :items="servers"
            :rules="[rules.required]"
            item-text="name"
            item-value="id"
            label="Server"
            v-model="selectedServer"
          />
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-col cols="6">
          <v-expansion-panels accordion>
            <v-expansion-panel
              v-for="(action, index) in actions[selectedServer]"
              :key="index"
            >
              <!-- Kick -->
              <template v-if="action.type == Action.Kick">
                <v-expansion-panel-header>Kick {{ action.user !== undefined ? action.user.username : '' }}</v-expansion-panel-header>
                <v-expansion-panel-content>
                  <member-dropdown
                    v-model="action.user"
                    label="Who to kick"
                    :rules="[rules.required]"
                    :server="selectedServer"
                  />
                </v-expansion-panel-content>
              </template>
              <!-- Ban -->
              <template v-if="action.type == Action.Ban">
                <v-expansion-panel-header>Ban {{ action.user !== undefined ? action.user.username : '' }}</v-expansion-panel-header>
                <v-expansion-panel-content>
                  <member-dropdown
                    v-model="action.user"
                    label="Who to ban"
                    :rules="[rules.required]"
                    :server="selectedServer"
                  />
                </v-expansion-panel-content>
              </template>
              <!-- CreateRole -->
              <template v-if="action.type == Action.CreateRole">
                <v-expansion-panel-header>Create a role called {{ action.name }}</v-expansion-panel-header>
                <v-expansion-panel-content>
                  <v-text-field
                    v-model="action.name"
                    :rules="[rules.required, rules.roleNameMin, rules.roleNameMax]"
                    label="Role name"
                  />
                </v-expansion-panel-content>
              </template>
              <!-- DestroyRole -->
              <template v-if="action.type == Action.DestroyRole">
                <v-expansion-panel-header>Destroy @{{ action.role !== undefined ? action.role.name : ''}}</v-expansion-panel-header>
                <v-expansion-panel-content>
                  <role-dropdown
                    v-model="action.role"
                    :rules="[rules.required]"
                    :roles="derefRoles"
                    label="Role to destroy"
                  />
                </v-expansion-panel-content>
              </template>
              <!-- ChangeRoleAssignment -->
              <template v-if="action.type == Action.ChangeRoleAssignment">
                <v-expansion-panel-header>Change assignment of @{{ action.role !== undefined ? action.role.name : ''}}</v-expansion-panel-header>
                <v-expansion-panel-content>
                  <role-dropdown
                    v-model="action.role"
                    :rules="[rules.required]"
                    :roles="derefRoles"
                    label="Role"
                  />
                  <member-dropdown
                    v-model="action.grant"
                    label="Who to add to the role"
                    :server="selectedServer"
                    multiple
                  />
                  <member-dropdown
                    v-model="action.revoke"
                    label="Who to remove from the role"
                    :server="selectedServer"
                    multiple
                  />
                </v-expansion-panel-content>
              </template>
              <!-- ChangeRolePermissions -->
              <template v-if="action.type == Action.ChangeRolePermissions">
                <v-expansion-panel-header>Change permissions of @{{ action.role !== undefined ? action.role.name : ''}}</v-expansion-panel-header>
                <v-expansion-panel-content>
                  <role-dropdown
                    v-model="action.role"
                    :rules="[rules.required]"
                    :roles="derefRoles"
                    label="Role"
                  />
                  <permission-dropdown
                    v-model="action.allow"
                    label="Permissions to add"
                  />
                  <permission-dropdown
                    v-model="action.deny"
                    label="Permissions to remove"
                  />
                </v-expansion-panel-content>
              </template>
              <!-- ChangePermissionOverrideOn -->
              <template v-if="action.type == Action.ChangePermissionOverrideOn">
                <v-expansion-panel-header>Change permission override for @{{ action.subject !== undefined ? action.subject.name : '' }}</v-expansion-panel-header>
                <v-expansion-panel-content>
                  <v-select
                    v-model="action.subjectType"
                    :items="['Role', 'User']"
                    label="What are you changing permissions for?"
                  />
                  <member-dropdown
                    v-model="action.subject"
                    :rules="[rules.required]"
                    :server="selectedServer"
                    label="Who?"
                    v-if="action.subjectType == 'User'"
                  />
                  <role-dropdown
                    v-model="action.subject"
                    :rules="[rules.required]"
                    :roles="derefRoles"
                    label="Which role?"
                    v-if="action.subjectType == 'Role'"
                  />
                  <channel-dropdown
                    v-model="action.channel"
                    :rules="[rules.required]"
                    :channels="derefChannels"
                    label="What channel?"
                    text
                    voice
                    category
                  />
                  <permission-dropdown
                    v-model="action.allow"
                    label="Permissions to allow"
                  />
                  <permission-dropdown
                    v-model="action.unset"
                    label="Permissions to unset"
                  />
                  <permission-dropdown
                    v-model="action.deny"
                    label="Permissions to deny"
                  />
                </v-expansion-panel-content>
              </template>
              <!-- ChangeRoleSetting -->
              <template v-if="action.type == Action.ChangeRoleSetting">
                <v-expansion-panel-header>Change a setting on {{ action.role !== undefined ? action.role.name : '' }}</v-expansion-panel-header>
                <v-expansion-panel-content>
                  <role-dropdown
                    v-model="action.role"
                    :roles="derefRoles"
                    :rules="[rules.required]"
                    label="Role to modify"
                  />
                  <setting-dropdown
                    v-model="action.setting"
                    :rules="[rules.required]"
                    role
                  />
                  <v-text-field
                    v-model="action.value"
                    v-if="action.setting == RoleSetting.Name"
                    :rules="[rules.required, rules.roleNameMin, rules.roleNameMax]"
                    label="New name"
                  />
                  <v-color-picker
                    v-model="action.value"
                    v-if="action.setting == RoleSetting.Color"
                    :rules="[rules.required]"
                    label="New color"
                  />
                  <v-switch
                    v-model="action.value"
                    v-if="action.setting == RoleSetting.Hoist"
                    label="Hoistable"
                  />
                  <v-switch
                    v-model="action.value"
                    v-if="action.setting == RoleSetting.Mentionable"
                    label="Mentionable"
                  />
                </v-expansion-panel-content>
              </template>
              <!-- MoveRole -->
              <template v-if="action.type == Action.MoveRole">
                <v-expansion-panel-header>
                  Move
                  <template v-if="action.role !== undefined"> @{{ action.role.name }}</template>
                  <template v-if="action.direction !== undefined"> {{ action.direction == MoveRelativePosition.Above ? 'above' : 'below' }}</template>
                  <template v-if="action.subject !== undefined"> @{{ action.subject.name }}</template>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <role-dropdown
                    v-model="action.role"
                    :rules="[rules.required]"
                    :roles="derefRoles"
                    label="Role"
                  />
                  <v-radio-group
                    v-model="action.direction"
                  >
                    <v-radio
                      label="Above"
                      :value="MoveRelativePosition.Above"
                    />
                    <v-radio
                      label="Below"
                      :value="MoveRelativePosition.Below"
                    />
                  </v-radio-group>
                  <role-dropdown
                    v-model="action.subject"
                    :rules="[rules.required]"
                    :roles="derefRoles"
                    label="Relative to what role?"
                  />
                </v-expansion-panel-content>
              </template>
              <!-- MoveChannel -->
              <template v-if="action.type == Action.MoveChannel">
                <v-expansion-panel-header>
                  Move
                  <template v-if="action.channel !== undefined"> @{{ action.channel.name }}</template>
                  <template v-if="action.direction !== undefined"> {{ action.direction == MoveRelativePosition.Above ? 'above' : 'below' }}</template>
                  <template v-if="action.subject !== undefined"> @{{ action.subject.name }}</template>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <channel-dropdown
                    v-model="action.channel"
                    :rules="[rules.required]"
                    :channels="derefChannels"
                    label="Channel"
                    text
                    voice
                    category
                  />
                  <v-radio-group
                    v-model="action.direction"
                  >
                    <v-radio
                      label="Above"
                      :value="MoveRelativePosition.Above"
                    />
                    <v-radio
                      label="Below"
                      :value="MoveRelativePosition.Below"
                    />
                  </v-radio-group>
                  <channel-dropdown
                    v-model="action.subject"
                    :rules="[rules.required]"
                    :channels="derefChannels"
                    label="Relative to what channel?"
                    text
                    voice
                    category
                  />
                </v-expansion-panel-content>
              </template>
              <!-- CreateChannel -->
              <template v-if="action.type == Action.CreateChannel">
                <v-expansion-panel-header>Create a channel called {{ action.name }}</v-expansion-panel-header>
                <v-expansion-panel-content>
                  <v-radio-group
                    v-model="action.channelType"
                    row
                  >
                    <v-radio
                      label="Text"
                      :value="ChannelType.Text"
                    />
                    <v-radio
                      label="Voice"
                      :value="ChannelType.Voice"
                    />
                    <v-radio
                      label="Category"
                      :value="ChannelType.Category"
                    />
                  </v-radio-group>
                  <v-text-field
                    v-model="action.name"
                    :rules="[rules.required, rules.channelNameMin, rules.channelNameMax]"
                  />
                </v-expansion-panel-content>
              </template>
              <!-- DestroyChannel -->
              <template v-if="action.type == Action.DestroyChannel">
                <v-expansion-panel-header>Destroy {{ action.channel !== undefined ? action.channel.name : '' }}</v-expansion-panel-header>
                <v-expansion-panel-content>
                  <channel-dropdown
                    v-model="action.channel"
                    :channels="derefChannels"
                    :rules="[rules.required]"
                    label="Channel to destroy"
                    text
                    voice
                    category
                  />
                </v-expansion-panel-content>
              </template>
              <!-- ChangeServerSetting -->
              <template v-if="action.type == Action.ChangeServerSetting">
                <v-expansion-panel-header>Change server setting</v-expansion-panel-header>
                <v-expansion-panel-content>
                  <setting-dropdown
                    v-model="action.setting"
                    :rules="[rules.required]"
                    server
                  />
                  <channel-dropdown
                    v-model="action.value"
                    :channels="derefChannels"
                    :rules="[rules.required]"
                    label="New AFK channel"
                    voice
                    v-if="action.setting == ServerSetting.AFKChannel"
                  />
                  <v-slider
                    v-model="action.value"
                    :tick-labels="['1 minute', '5 minutes', '15 minutes', '30 minutes', '1 hour']"
                    :max="4"
                    ticks="always"
                    tick-size="2"
                    v-if="action.setting == ServerSetting.AFKTimeout"
                  />
                  <v-text-field
                    v-model="action.value"
                    :rules="[rules.required, rules.serverNameMin, rules.serverNameMax]"
                    label="New name"
                    v-if="action.setting == ServerSetting.Name"
                  />
                  <v-switch
                    v-model="action.value"
                    label="Enable content filter"
                    v-if="action.setting == ServerSetting.ContentFilter"
                  />
                </v-expansion-panel-content>
              </template>
              <!-- ChangeChannelSetting -->
              <template v-if="action.type == Action.ChangeChannelSetting">
                <v-expansion-panel-header>Change a setting on {{ action.channel !== undefined ? action.channel.name : '' }}</v-expansion-panel-header>
                <v-expansion-panel-content>
                  <channel-dropdown
                    v-model="action.channel"
                    :channels="derefChannels"
                    :rules="[rules.required]"
                    label="Channel"
                    text
                    voice
                    category
                  />
                  <setting-dropdown
                    v-model="action.setting"
                    :rules="[rules.required]"
                    channel
                  />
                  <v-text-field
                    v-model="action.value"
                    :rules="[rules.required, rules.channelNameMin, rules.channelNameMax]"
                    label="New name"
                    v-if="action.setting == ChannelSetting.Name"
                  />
                  <v-textarea
                    v-model="action.value"
                    :rules="[rules.required, rules.channelTopicMin, rules.channelTopicMax]"
                    label="New topic"
                    v-if="action.setting == ChannelSetting.Topic"
                    outlined
                  />
                </v-expansion-panel-content>
              </template>
              <!-- SetCategory -->
              <template v-if="action.type == Action.SetCategory">
                <v-expansion-panel-header>Set {{ action.channel !== undefined ? action.channel.name : '' }}'s category</v-expansion-panel-header>
                <v-expansion-panel-content>
                  <channel-dropdown
                    v-model="action.channel"
                    :channels="derefChannels"
                    :rules="[rules.required]"
                    label="Channel"
                    text
                    voice
                  />
                  <channel-dropdown
                    v-model="action.category"
                    :channels="derefChannels"
                    :rules="[rules.required]"
                    label="Category"
                    category
                  />
                </v-expansion-panel-content>
              </template>
              <!-- SyncToCategory -->
              <template v-if="action.type == Action.SyncToCategory">
                <v-expansion-panel-header>Synchronize {{ action.channel !== undefined ? action.channel.name : ''}}'s permissionst with its parent's</v-expansion-panel-header>
                <v-expansion-panel-content>
                  <channel-dropdown
                    v-model="action.channel"
                    :channels="derefChannels"
                    :rules="[rules.required]"
                    label="Channel"
                    text
                    voice
                  />
                </v-expansion-panel-content>
              </template>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-dialog 
          scrollable
          max-width="300px"
          v-model="actionTypeDialog"
          v-if="selectedServer"
        >
          <template v-slot:activator="{ on }">
            <v-btn
              fab
              dark
              color="#0039cb"
              class="mx-4"
              :disabled="loadingRoles || loadingChannels"
              v-on="on"
            >
              <v-icon dark>
                mdi-plus
              </v-icon>
            </v-btn>
            <v-btn 
              fab
              dark
              color="error"
              class="mx-4"
              :disabled="actions[selectedServer].length === 0 || loadingRoles || loadingChannels"
              @click="removeAction()"
            >
              <v-icon dark>
                mdi-minus
              </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-title>Select Action Type</v-card-title>
            <v-divider />
            <v-card-text style="height: 300px;">
              <v-radio-group
                v-model="newActionType"
                column
              >
                <!-- Kick -->
                <v-radio
                  label="Kick"
                  :value="Action.Kick"
                />
                <!-- Ban -->
                <v-radio
                  label="Ban"
                  :value="Action.Ban"
                />
                <!-- CreateRole -->
                <v-radio
                  label="Create Role"
                  :value="Action.CeateRole"
                />
                <!-- DestroyRole -->
                <v-radio
                  label="Destroy Role"
                  :value="Action.DestroyRole"
                />
                <!-- ChangeRoleAssignment -->
                <v-radio
                  label="Change Role Assignment"
                  :value="Action.ChangeRoleAssignment"
                />
                <!-- ChangeRolePermissions -->
                <v-radio
                  label="Change Role Permissions"
                  :value="Action.ChangeRolePermissions"
                />
                <!-- ChangePermissionOverride -->
                <v-radio
                  label="Change Permission Override"
                  :value="Action.ChangePermissionOverrideOn"
                />
                <!-- ChangeRoleSetting -->
                <v-radio
                  label="Change Role Setting"
                  :value="Action.ChangeRoleSetting"
                />
                <!-- MoveRole -->
                <v-radio
                  label="Move Role"
                  :value="Action.MoveRole"
                />
                <!-- MoveChannel -->
                <v-radio
                  label="Move Channel"
                  :value="Action.MoveChannel"
                />
                <!-- CreateChannel -->
                <v-radio
                  label="Create Channel"
                  :value="Action.CreateChannel"
                />
                <!-- DestroyChannel -->
                <v-radio
                  label="Destroy Channel"
                  :value="Action.DestroyChannel"
                />
                <!-- ChangeServerSetting -->
                <v-radio
                  label="Change Server Setting"
                  :value="Action.ChangeServerSetting"
                />
                <!-- ChangeChannelSetting -->
                <v-radio
                  label="Change Channel Setting"
                  :value="Action.ChangeChannelSetting"
                />
                <!-- SetCategory -->
                <v-radio
                  label="Set Channel Category"
                  :value="Action.SetCategory"
                />
                <!-- SyncToCategory -->
                <v-radio
                  label="Sync to Parent Category"
                  :value="Action.SyncToCategory"
                />
              </v-radio-group>
            </v-card-text>
            <v-divider />
            <v-card-actions>
              <v-btn
                text
                @click="actionTypeDialog = false"
              >
                Close
              </v-btn>
              <v-btn
                text
                @click="actionTypeDialog = false; addAction()"
              >
                Create
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
     </v-form>
     <v-row
      justify="center"
      align="center"
     >
      <v-col
        cols="1"
      >
        <v-btn
          :disabled="!(valid && durationValid)"
          @click="create()"
          class="my-8"
          color="#0039cb"
          dark
        >Create</v-btn>
      </v-col>
     </v-row>
    </v-container>
  </v-main>
</template>
<script lang="ts">
import Vue from "vue";
import { mapState, mapGetters } from "vuex";
import {
  Action,
  tAction,
  ResourceReference,
  ChannelType,
  RoleSetting,
  ChannelSetting,
  ServerSetting,
  ReferenceType,
  MoveRelativePosition,
  NewProposalRequest,
  CHANNEL_NAME_MIN,
  CHANNEL_NAME_MAX,
  CHANNEL_TOPIC_MIN,
  CHANNEL_TOPIC_MAX,
  ROLE_NAME_MIN,
  ROLE_NAME_MAX,
  SERVER_NAME_MIN,
  SERVER_NAME_MAX,
  PROPOSAL_NAME_MIN,
  PROPOSAL_NAME_MAX,
  PROPOSAL_DESCRIPTION_MIN,
  PROPOSAL_DESCRIPTION_MAX
} from "athena-common";
import { getChannels, getRoles } from "@/services/discord";
import { createProposal } from "@/services/proposals";
import MemberDropdown from "@/components/MemberDropdown.vue";
import RoleDropdown from "@/components/RoleDropdown.vue";
import ChannelDropdown from "@/components/ChannelDropdown.vue";
import PermissionDropdown from "@/components/PermissionDropdown.vue";
import SettingDropdown from "@/components/SettingDropdown.vue";

export default Vue.extend({
  components: {
    MemberDropdown,
    RoleDropdown,
    PermissionDropdown,
    ChannelDropdown,
    SettingDropdown
  },
  data() { return {
    name: '',
    description: '',
    durationSeconds: "0",
    durationMinutes: "0",
    durationHours: "0",
    valid: false,
    rules: {
      required: (value: string): boolean | string => !!value || 'Required',
      nonNegative: (value: string): boolean | string => parseInt(value) >= 0 || 'Must be positive',
      proposalNameMin: (value: string): boolean | string => value.length >= PROPOSAL_NAME_MIN || `Min ${PROPOSAL_NAME_MIN} characters`,
      proposalNameMax: (value: string): boolean | string => value.length <= PROPOSAL_NAME_MAX || `Max ${PROPOSAL_NAME_MAX} characters`,
      proposalDescriptionMin: (value: string): boolean | string => value.length >= PROPOSAL_DESCRIPTION_MIN || `Min ${PROPOSAL_DESCRIPTION_MIN} characters`,
      proposalDescriptionMax: (value: string): boolean | string => value.length <= PROPOSAL_DESCRIPTION_MAX || `Max ${PROPOSAL_DESCRIPTION_MAX} characters`,
      channelNameMin: (value: string): boolean | string => value.length >= CHANNEL_NAME_MIN || `Min ${CHANNEL_NAME_MIN} characters`,
      channelNameMax: (value: string): boolean | string => value.length <= CHANNEL_NAME_MAX || `Max ${CHANNEL_NAME_MAX} characters`,
      channelTopicMin: (value: string): boolean | string => value.length >= CHANNEL_TOPIC_MIN || `Min ${CHANNEL_TOPIC_MIN} characters`,
      channelTopicMax: (value: string): boolean | string => value.length <= CHANNEL_TOPIC_MAX || `Max ${CHANNEL_TOPIC_MAX} characters`,
      roleNameMin: (value: string): boolean | string => value.length >= ROLE_NAME_MIN || `Min ${ROLE_NAME_MIN} characters`,
      roleNameMax: (value: string): boolean | string => value.length <= ROLE_NAME_MAX || `Max ${ROLE_NAME_MAX} characters`,
      serverNameMin: (value: string): boolean | string => value.length >= SERVER_NAME_MIN || `Min ${SERVER_NAME_MIN} characters`,
      serverNameMax: (value: string): boolean | string => value.length <= SERVER_NAME_MAX || `Max ${SERVER_NAME_MAX} chracters`,
    },
    actionTypeDialog: false,
    newActionType: <Action>null,
    actions: {},
    selectedServer: <string>null,
    // Roles and channels ARE NOT the exact same as their respective types in athena-common
    // Instead, they both have an attached `type` property that is used to differentiate
    // Between pointers and direct references
    // e.g. they are more like a union between their respsective types and reference types
    roles: {},
    loadingRoles: false,
    channels: {},
    loadingChannels: false,
    // Injected enums
    Action,
    ChannelType,
    RoleSetting,
    ChannelSetting,
    ServerSetting,
    MoveRelativePosition
  }; },
  computed: {
    ...mapState("auth", {
      serversObject: "servers"
    }),
    ...mapGetters("auth", [
      "token"
    ]),
    durationValid() { return parseInt(this.durationSeconds) + parseInt(this.durationMinutes) + parseInt(this.durationHours) > 0; },
    servers() { return Object.values(this.serversObject); },
    derefChannels() {
      const originalChannels = this.channels[this.selectedServer];
      const actions = this.actions[this.selectedServer];
      if (originalChannels === undefined) return undefined;
      if (actions === undefined) return undefined;
      const newText = <any[]>[];
      const newVoice = <any[]>[];
      const newCategory = <any[]>[];
      actions.forEach((action: any, index: number) => {
        if (action.type !== Action.CreateChannel) return;
        switch (action.channelType) {
          case ChannelType.Text:
            newText.push({ name: action.name, index });
            break;
          case ChannelType.Voice:
            newVoice.push({ name: action.name, index });
            break;
          case ChannelType.Category:
            newCategory.push({ name: action.name, index });
            break;
        }
      });
      return {
        [ChannelType.Text]: [...originalChannels[ChannelType.Text], ...newText],
        [ChannelType.Voice]: [...originalChannels[ChannelType.Voice], ...newVoice],
        [ChannelType.Category]: [...originalChannels[ChannelType.Category], ...newCategory]
      };
    },
    derefRoles() {
      const originalRoles = this.roles[this.selectedServer];
      const actions = this.actions[this.selectedServer];
      if (originalRoles === undefined) return [];
      if (actions === undefined) return [];
      const newRoles = <any>[];
      actions.forEach((action: any, index: number) => {
        if (action.type !== Action.CreateRole) return;
        newRoles.push({ name: action.name, index });
      });
      return newRoles.concat(originalRoles);
    }
  },
  methods: {
    addAction() {
      if (this.newActionType == null) return;
      const actions = this.actions[this.selectedServer];
      actions.push({ type: this.newActionType });
      Vue.set(this.actions, this.selectedServer, actions);
      this.newActionType = null;
    },
    removeAction() {
      this.actions[this.selectedServer].pop();
    },
    fetchServerData() {
      if (this.selectedServer == null) return;
      const server = this.selectedServer; // Needed since server can change
      this.loadingRoles = true;
      getRoles(this.token, server)
      .then((roles) => {
        this.loadingRoles = false;
        roles.forEach((role: any) => role.type = ReferenceType.ID);
        Vue.set(this.roles, server, roles);
      });
      this.loadingChannels = true;
      getChannels(this.token, server)
      .then((channels: any) => {
        this.loadingChannels = false;
        channels[ChannelType.Text].forEach((channel: any) => channel.type = ReferenceType.ID);
        channels[ChannelType.Voice].forEach((channel: any) => channel.type = ReferenceType.ID);
        channels[ChannelType.Category].forEach((channel: any) => channel.type = ReferenceType.ID);
        Vue.set(this.channels, server, channels);
      });
    },
    serializeRef(ref: any): ResourceReference {
      if (ref.id === undefined) {
        return { type: ReferenceType.Pointer, index: ref.index };
      }
      return { type: ReferenceType.ID, id: ref.id };
    },
    reducePermissions(perms: { id: number, display: string }[] ): number {
      return perms.reduce((acc: number, val): number => {
        return acc |= val.id;
      }, 0);
    },
    serializeAction(action: any): tAction {
      // What we do depends on how horribly we mangled our types...
      switch(action.type) {
       case Action.Kick:
        return {
          action: Action.Kick,
          user: this.serializeRef(action.user)
        };
       case Action.Ban:
        return {
          action: Action.Ban,
          user: this.serializeRef(action.user)
        };
       case Action.CreateRole:
        return {
          action: Action.CreateRole,
          name: action.name
        };
       case Action.DestroyRole:
        return {
          action: Action.DestroyRole,
          role: this.serializeRef(action.role)
        };
       case Action.ChangeRoleAssignment:
        return {
          action: Action.ChangeRoleAssignment,
          role: this.serializeRef(action.role),
          grant: action.grant.map(this.serializeRef),
          revoke: action.revoke.map(this.serializeRef)
        };
       case Action.ChangeRolePermissions:
        return {
          action: Action.ChangeRolePermissions,
          role: this.serializeRef(action.role),
          allow: this.reducePermissions(action.allow),
          deny: this.reducePermissions(action.deny)
        }
       case Action.ChangePermissionOverrideOn:
        return {
          action: Action.ChangePermissionOverrideOn,
          channel: this.serializeRef(action.channel),
          subject: this.serializeRef(action.subject),
          allow: this.reducePermissions(action.allow),
          unset: this.reducePermissions(action.unset),
          deny: this.reducePermissions(action.deny)
        }
       case Action.ChangeRoleSetting:
        return {
          action: Action.ChangeRoleSetting,
          role: this.serializeRef(action.role),
          setting: action.setting,
          value: action.value
        }
       case Action.MoveRole:
        return {
          action: Action.MoveRole,
          role: this.serializeRef(action.role),
          direction: action.direction,
          subject: this.serializeRef(action.subject)
        }
       case Action.MoveChannel:
        return {
          action: Action.MoveChannel,
          channel: this.serializeRef(action.channel),
          direction: action.direction,
          subject: this.serailizeRef(action.subject)
        }
       case Action.CreateChannel:
        return {
          action: Action.CreateChannel,
          name: action.name,
          type: action.type
        }
       case Action.DestroyChannel:
        return {
          action: Action.DestroyChannel,
          channel: this.serializeRef(action.channel)
        }
       case Action.ChangeServerSetting:
        let value;
        switch (action.setting) {
          case ServerSetting.AFKChannel:
            value = this.serailizeRef(action.value);
            break;
          case ServerSetting.AFKTimeout:
            switch (action.value) {
              case 0: // 1 minute
                value = 60;
                break;
              case 1: // 5 minutes
                value = 60 * 5;
                break;
              case 2: // 15 minutes
                value = 60 * 15;
                break;
              case 3: // 30 minutes
                value = 60 * 30;
                break;
              case 4: // 1 hour
                value = 60 * 60;
                break;
              default: // Sane default
                value = 60;
            }
            break;
          case ServerSetting.Name:
          case ServerSetting.ContentFilter:
            value = action.value;
          break;
        }
        return {
          action: Action.ChangeServerSetting,
          setting: action.setting,
          value
        };
       case Action.ChangeChannelSetting:
        return {
          action: Action.ChangeChannelSetting,
          channel: this.serailizeRef(action.channel),
          setting: action.setting,
          value: action.value
        };
       case Action.SetCategory:
        return {
          action: Action.SetCategory,
          channel: this.serializeRef(action.channel),
          category: this.serializeRef(action.category)
        };
       case Action.SyncToCategory:
        return {
          action: Action.SyncToCategory,
          channel: this.serializeRef(action.channel)
        };
      }
    },
    create() {
      const actions = this.actions[this.selectedServer].map(this.serializeAction);
      const duration = parseInt(this.durationSeconds) + 60 * parseInt(this.durationMinutes) + 60 * 60 * parseInt(this.durationHours);

      const proposal: NewProposalRequest = {
        name: this.name,
        description: this.description,
        server: this.selectedServer,
        duration,
        actions
      };

      createProposal(proposal);
    }
  },
  watch: {
    selectedServer: function () {
      this.fetchServerData();
      if (this.actions[this.selectedServer] === undefined) {
        Vue.set(this.actions, this.selectedServer, []);
      }
    }
  }
});
</script>

Direkt is a moderation bot modelled around [direct democracy](https://en.wikipedia.org/wiki/Direct_democracy). Moderation happens through proposals, where users can vote for or against actions being taken. Actions, when approved, are taken automatically without the need for user intervention.

# Why?

Moderation in discord servers has historically been a top down system. A handful of predetermined (in rare cases, elected) moderators run the entire show. Direkt aims to allow server owners the choice in offloading moderating responsibilities onto the general public.

# Proposals

Direkt works with _proposals_. A proposal represents a single votable "thing". You can optionally attach actions to have changes be made automatically upon the vote passing, or leave actions out and use the proposal as a poll.

## Proposal basics

A proposal is created with the `create proposal` command and modified with the `update proposal` command. You can vote for or against proposals by reacting to the proposal embed with 👍or 👎. Your vote can be cleared with the `clear vote` command. Proposals can be deleted with the `destroy proposal` command.

## Proposal states

Proposals can be in the building, running, passed, failed, error, or cancelled states. They start in the building state (indicated with a gray line) where the author can modify their name, description, duration, and actions. From there, with the `run proposal` command, they are brought to the running state (indicated with a blue line) for their duration and are opened for votes. After the duration ends, votes are counted and proposals are either put into the passed or failed states (green and red respectively). If a proposal passed, it's actions are executed. If there are any errors running a proposal (e.g. a user left before they could be kicked), it will enter the error state (indicated with orange). The `retry proposal` command will retry it's execution. At any point, except while a proposal is running, the proposal can be destroyed with `destroy proposal` or by deleting its message. If the proposal is running, it must be cancelled with `cancel proposal` or by deleting its message before it can be destroyed.

## Proposal commands

- create proposal \<duration> \<name>
- update proposal \<"duration" or "description"> \<new duration or description>
- destroy proposal \<proposal ID>
- clear vote \<proposal ID>
- retry proposal \<proposal ID>
- run proposal \<proposal ID>

Note on durations: The format is \<number>\<unit>. Currently acceptable units are s (seconds), m (minutes), h (hours), and d (days)

## Examples

- `create proposal 5s New proposal` will create a proposal with a 5 second duration named "New proposal"
- `update proposal description 23 A good description` will update the description of proposal #23 to "A good description"
- `run proposal 44` will run proposal #44, opening it for votes
- `destroy proposal 345` will destroy proposal #345

# Actions

Actions are added to proposals to make them do things (this is optional, however, and Direkt can be used as a polling system when no actions are added to proposals). **The order of actions is important, since they are executed in the order they are shown**.

## Action commands

- add action \<proposal ID> \<action>
- insert action \<proposal ID> \<action position> \<action>
- replace action \<proposal ID> \<action position> \<action>
- remove action \<proposal ID> \<action position>

## Action types

### kick \<user reference>

Kicks a user from the server

Example: kick Jonas#0006

### ban \<user reference>

Bans a user from the server

Exmaple: ban Jonas#0006

### create role \<role name>

Creates a role with a given name

Example: create role Admin

### destroy role \<role reference>

Destroys a role

Example: destroy role @Moderator

### change role assignment \<role reference> [assignment...]

Adds or removes a role from users. To add the role to a user, write +\<user reference>. To remove it, write -\<user reference>.

Example: change role assignment @Admin +Jonas#0006 -OtherUser#0000

### grant role \<role reference> [user reference...]

Shorthand for change role assignment but only for granting

Example: grant role @Admin Jonas#0006 OtherAdmin#0000

### revoke role \<role reference> [user reference...]

Shorthand for change role assignment but only for revoking

Example: revoke role @Admin NoLongerAdmin#0001 NoLongerAdmin#0002

### move channel \<channel reference> above|below \<channel reference>

Moves a channel above or below another channel. Includes categories. When moving channels, note that you can only move a channel within its parents 'scope'. For example, if a channel were in a category, it can only be moved around other channels within that category _and of the same type_

Example: move channel #general above #images

### move role \<role reference> above|below \<role reference>

Moves a role above or below another role. **DRKT can only move roles beneath its highest role**

Example: move role @Admin above @Moderator

### change role permissions \<role reference> [permissions...]

Allow or prohibit permissions on a role. To add permissions, use a + before the permission. To remove permissions, use a -.

Note: While Direkt supports all Discord permissions, it has some modified spelling. See the addendum for a for list of permissions.

Example: change role permissions @Moderator +Manage Messages
Example: change role permissions @Unverified -Send Messages +Speak

### allow permissions \<role reference> [permission...]

Shorthand for change role permissions but only for allowing permissions.

Note: While Direkt supports all Discord permissions, it has some modified spelling. See the addendum for a for list of permissions.

Example: allow permissions @Admin Manage Server

### prohibit permissions \<role reference> [permission...]

Shorthand for change role permissions but only for prohibiting permissions.

Note: While Direkt supports all Discord permissions, it has some modified spelling. See the addendum for a for list of permissions.

Example: prohibit permissions @Member Manage Messages

### add permission override on \<channel reference> for \<user or role reference> [permission...]

Adds a permission override on a channel for a given user or role. To explicitly allow a user or role a permission, use + infront of the permission. To fall back onto the default, use ~ infront of the permission. To explicitly deny a permission, use - infront of the permission.

Note: While Direkt supports all Discord permissions, it has some modified spelling. See the addendum for a for list of permissions.

Example: add permission override on "VIP Only VC" for @VIP +Connect

### change permission override on \<channel reference> for \<user or role reference> [permission...]

Identical syntax to add permission override except it only modifies existing overrides.

Note: While Direkt supports all Discord permissions, it has some modified spelling. See the addendum for a for list of permissions.

Example: change permission override on \*2 for @Moderator +Manage Messages

### remove permission override on \<channel reference> for \<user or role>

Removes a permission override on a channel for a user or role

Example: remove permission override on #general-1 for @VIP

### destroy channel \<channel reference>

Destroys a channel

Example: destroy channel "Old VC"

### create channel \<name>

Creates a channel with a specified name

Example: create channel High capacity VC

### change server setting \<server setting> \<new value>

Changes a server setting. _While Direkt supports many server settings, there are some that have exceptions or are unimplemented. See the addendum for a full list of supported settings_.

Example: change server setting afk timeout 5m

### change channel setting \<channel reference> \<channel setting> \<new value>

Changes a channel setting. _While Direkt supports many channel settings, there are some that have exceptions or are unimplemented. See the addendum for a full list of supported settings_.

Example: change channel setting "Old VC name" name New VC name

### change role setting \<role reference> \<role setting> \<new value>

Changes a role setting. _While Direkt supports many role settings, there are some that have exceptions or are unimplemented. See the addendum for a full list of supported settings_.

Example: change role setting @Admin name Better Admin Name TBH

### set category \<category reference or none>

Sets a channel's category. Categories can only be referenced with pointers, IDs, and full names. **To remove a channel from its category, write "none" (without quotes) instead of the category reference**. This action will not sync the channel to its new category, see sync to category for that behavior.

Example: set category #general-1 "Member Zone"

### sync to category \<channel reference>

Syncs a channel's permissions with its parent category.

Example: sync to category "Member Zone"

## Reference types

When writing an action, there are 5 types of parameters.

1. Username+discriminator: Jonas#1723
2. Full text: "General 1"
3. Mention: #images-3, @Jonas
4. ID: i118715872973029376
5. Pointer: \*3 (see below)

Users can be input with username or ID.

Channels can be input with full text, mention (only text channels), pointer, or ID.

Categories can be input with full text, pointer, or ID.

Roles can be input with full text, mention, pointer, or ID.

When actions ask for names or descriptions (long pieces of text that do not reference anything), quotes are not accepted.

## Pointers

Advanced users of the bot may ask, _"If I want to both create a channel and change its topic in the same proposal, how can I mention a channel that doesn't exist yet?"_. The solution to this problem introduces _pointers_. The `create channel` and `create role` actions both can be _pointed to_ by other actions as inputs. Instead of mentioning or naming the channel, put an \* and the position of the outputing action. For example, to answer the previous question, these actions would create a channel and set it's topic:

`1. create channel text images-2`

`2. change channel setting *1 topic Only for images!`

Here the second action "points" to the result of the first action using `*1` in place of a channel.

# Addendum

## Full list of supported server settings and their value types

### afk channel \<channel reference>

Providing a non voice channel will cause an execution error.

### afk timeout \<duration>

The duration is specified with the same format the proposal durations are

### name \<name>

Maximum of 100 characters, no minimum

### content filter \<true or false>

Direkt does not currently support multiple levels of content filter, instead only setting between fully on and completely off.

## Full list of supported role settings and their value types

### color \<color number>

The color number is sourced from [this](https://leovoel.github.io/embed-visualizer/) tools color picker.

### hoist \<true or false>

Will display the role seperately from other roles and the 'online' list. Hoist is equivalent to the Discord setting "Display this role seperately from online members"

### mentionable \<true or false>

Will allow anyone to mention the role. Mentionable is equivalent to the Discord setting "Allow anyone to @Mention this role"

### name \<name>

Maximum of 64 characters, no minimum.

## Full list of supported channel settings and their value types

### name \<name>

Maxmimum of 100 characters, 2 minimum.

### topic \<topic>

Setting this on a non text channel will have no effect. Maximum of 1024 characters, no minimum.

## Full list of supported permissions

- Administrator

- Create Invite

- Manage Channels

- Manage Server

- Add Reactions

- View Audit Log

- Priority Speaker

- Stream

- View Channel

- Send Messages

- Send TTS Messages

- Manage Messages

- Embed Links

- Attach Files

- Read Message History

- Mention Everyone

- External Emojis

- View Guild Insights

- Connect

- Speak

- Mute

- Deafen

- Move

- VAD

- Change Nickname

- Manage Nicknames

- Manage Roles

- Manage Webhooks

- Manage Emojis

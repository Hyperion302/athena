Direkt is a moderation bot modelled around [direct democracy](https://en.wikipedia.org/wiki/Direct_democracy). Moderation happens through proposals, where users can vote for or against actions being taken. Actions, when approved, occur automatically without the need for user intervention.

# Why?

Moderation in discord servers has historically been a top down system. A handful of predetermined moderators run the entire show. Direkt aims to allow server owners the choice in offloading moderating responsibilities onto the general public.

# Proposals

Direkt works with _proposals_. A proposal represents a single votable "thing". You can optionally attach actions to have changes be made automatically upon the vote passing, or leave actions out and use the proposal as a poll.

## Using proposals

A proposal is created with the `create proposal` command and modified with the `update proposal` command. You can vote for or against proposals by reacting to the proposal embed with 👍or 👎. Your vote can be cleared with the `clear vote` command. Proposals can be deleted with the `destroy proposal` command.

Proposals can be in the building, running, passed, failed, error, or cancelled states. They start in the building state (indicated with a gray line) where the author can modify their name, description, duration, and actions. From there, with the `run proposal` command, they are brought to the running state (indicated with a blue line) for their duration and are opened for votes. After the duration ends, votes are counted and proposals are either put into the passed or failed states (green and red respectively). If a proposal passed, it's actions are executed. If there are any errors running a proposal (e.g. a user left before they could be kicked), it will enter the error state (indicated with orange). The `retry proposal` command will retry it's execution. At any point, except while a proposal is running, the proposal can be destroyed with `destroy proposal` or by deleting the embed message. If the proposal is running, it must be cancelled with `cancel proposal` or deleting the embed message before it can be destroyed.

## Proposal commands

- create proposal \<duration> \<name>
- update proposal \<duration or description> \<new duration or description>
- destroy proposal \<proposal ID>
- clear vote \<proposal ID>
- retry proposal \<proposal ID>
- run proposal \<proposal ID>

Note on durations: The format is \<number>\<unit>. Currently acceptable units are s (seconds), m (minutes), h (hours), and d (days)

# Actions

Actions are added to proposals to make them do things (this is optional, however, and Direkt can be used as a polling system aswell). **The order of actions is important, since they are executed in order**.

## Action commands

- add action \<proposal ID> \<action>
- insert action \<proposal ID> \<action position> \<action>
- replace action \<proposal ID> \<action position> \<action>
- remove action \<proposal ID> \<action position>

## Parameter types

When writing an action, there are 5 types of parameters.

1. Username (+discriminator): Jonas#1723
2. Full text: "General 1"
3. Mention: #images-3, @Jonas
4. ID: i118715872973029376
5. Reference: \*3

Users can be input with username or ID.

Channels can be input with full text, mention (only text channels), reference, or ID.

Roles can be input with full text, mention, reference, or ID.

When actions ask for names or descriptions (long pieces of text that do not reference anything), quotes are not accepted.

## Action types

## References

Advanced users of the bot may ask, _"If I want to both create a channel and change it's topic in the same proposal, how can I mention a channel that doesn't exist yet?"_. This problem introduces _references_. The `create channel` and `create role` actions both can be _referenced_ by other actions as inputs. Instead of mentioning or naming the channel, put an \* and the position of the outputing action. For example, to answer the previous question, these actions would create a channel and set it's topic:

`1. create channel text images-2`

`2. change channel setting *1 topic Only for images!`

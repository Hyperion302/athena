# Commands

## create proposal <duration> <name>

## cancel proposal <id>

## update proposal <id> <value> <new value>

## add action <id> <action>

## replace action <id> <index> <new action>

## remove action <id> <index>

## run proposal <id>

Opens the proposal to voting. NOTE: No changes to the proposal will be allowed after this.

# Actions

## Kick

`user`\
`reason`

## Ban

`user`\
`reason`

## Create role

`name`

## Destroy role

`role`

## Change assignments

`role`
`users*`

## Grant role - Shorthand for Change assignments for only grants

`role`\
`users*`

## Revoke role - Shorthand for Change assignments for only revocations

`role`\
`users*`

## Change permissions

`role`\
`permissions*`

## Allow permissions - Shorthand for Change permissions for only allows

`role`\
`permissions*`

## Prohibit permissions - Shorthand for Change permissions for only prohibits

`role`\
`permissions*`

## Change permissions override

`channel`\
`subject`\
`permissions*`

## Allow permissions override - Shorthand for Change permissions override for only allows

`channel`\
`subject`\
`permissions*`

## Prohibit permissions - Shorthand for Change permissions override for only prohibits

`channel`\
`subject`\
`permissions*`

## Change role setting

`role`\
`setting`\
`value` (boolean)

## Move role

`role`\
`above|below`\ (choose 1)
`subject`

## Move channel

`channel`\
`above|below`\ (choose 1)
`subject`

## Create channel

`name`

## Destroy channel

`channel`

## Change server setting

`setting`
`value`

# Parameter reference types

i339838865370120192 - ID\
"General 2" - Exact name\
<@!120704767843368961> or <#339838865370120193> or <@&344621156441128962> - Mention\
\*3 - Output reference

# Permission format

+Permission - Allow\
-Permission - Prohibit\
~Permission - Default (only used by overrides)

# Example commands to make a proposal

create proposal 10h Big fix\
update proposal description 7df4d Fixes a really big problem!\
add action 7df4d destroy role "Old Admin"\
add action 7df4d create role Admin\
add action 7df4d create channel New General
add action 7df4d grant role *2 @Jonas \
add action 7df4d update permissions *2 +Delete Messages +Send Messages\
add action 7df4d update permissions override "General 2" *2 ~Connect
add action 7df4d move role *2 above @everyone
add action 7df4d move channel \*3 below "General 2"

# Components

1. Command parsing - Parse out commands
2. Proposal timing - start a timer at the beginning of duration and check votes by end
3. Proposal management - Synchronize DB and messages, update DB, implement proposals

# Embed

```json
{
  "embed": {
    "description": "Fixes a really big problem!",
    "color": 5747153,
    "timestamp": "2020-08-12T15:34:05.634Z",
    "footer": {
      "icon_url": "https://cdn.discordapp.com/embed/avatars/0.png",
      "text": "Proposed by @Jonas"
    },
    "title": "Big Fix",
    "fields": [
      {
        "name": "Actions",
        "value": "1. Destroy role \"Old Admin\"\n2. Create role \"Admin\"\n3. Create channel \"New General\"\n4. Grant role \"Admin\" to @Jonas etc."
      },
      {
        "name": "👍",
        "value": "4",
        "inline": true
      },
      {
        "name": "👎",
        "value": "2",
        "inline": true
      }
    ]
  }
}
```

# Future features

Role position detection: alerts a server if there are members 'untouchable' by the bot

Quorums: Custom quorums and vote ratio requirements beyond a simple majority no-quorum requirement

Vote permission: A custom permission to allow or prohibit members from voting

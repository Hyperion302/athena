# Tokens

## Keywords

### Action types

kick

ban

create role

destroy role

change role assignment

grant role

revoke role

change role permissions

allow permissions

prohibit permissions

change permissions override

allow permissions override

unset permissions override

change role setting

destroy channel

change server setting

change channel setting

### Permissions

administrator

create instant invite

kick - ignore (see duplicate)

ban - ignore (see duplicate)

manage channels

manage guild

add reactions

view audit log

priority speaker

stream

view channel

send messages

send tts messages

manage messages

embed links

attach files

read message history

mention everyone

use external emojis

view guild insights

connect

speak

mute members

deafen members

move members

use vad

change nickname

manage nicknames

manage roles

manage webhooks

manage emojis

### Settings

color

hoist

mentionable

name

afk channel

afk timeout

explicit content filter

### Other

above

below

text

voice

## Syntax

cross - `\+`

dash - `-`

approx - `~`

## Identifiers

exact name - `".\*"`

id - `i\d+`

role mention - `<@&\d+>`

user mention - `<@!?\d+>`

channel mention - `<#\d+>`

output reference - `\*\d+`

# Examples of each

kick @Jonas bad

ban @Jonas even worse!

create role Admin

destroy role "Admin"

change role assignment @Admin +@Jonas -FrogFather#8623

grant role \*4 FrogFather#8623

revoke role @Admin @Jonas

change role permissions "Admin" +Create Instant Invite -Manage Nicknames

allow permissions i339843557303255050 Attach Files

prohibit permissions @Admin Change Nickname

add permission override on "General 2" for @Admin +View Channel

change permission override on "General 2" for @Admin ~View Channel

remove permission override on "General 2" for @Admin

change role setting \*2 color #ffddaa

create text channel images-3

create voice channel General 1

destroy channel "General 5"

change server setting name New server name!!

change channel setting #general name New channel name!!

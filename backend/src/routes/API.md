# API Routes

## Auth

### POST /auth/token

Forge a new token

### POST /auth/refresh

Retrieve a refresh token

## Server

### GET /server/

Expects up to 200 servers in a query field named `servers`.  Returns the IDs of
the servers in the list that are running Athena.

### GET /server/:server/recent?c=:count

Retrieve :count recent proposals

:count must be greater than 0 and less than 50

### GET /server/:server/endingSoon?w=:within&c=:count

Retrieve :count proposals ending within :within seconds

:within must be greater than 0 seconds and less than 86400 (1 day) seconds

:count must be greater than 0 and less than 50

### GET /server/:server/proposals?p=:page

Retrieve all of a servers proposals, ordered by creation date, paginated on :page

## Proposals

### POST /server/:server/proposals

Create a new proposal

### PATCH /server/:server/proposals/:proposal

Update :proposal

Caller must be :proposal's author AND :proposal must not have already been started

NOTE: This call is extremely unlikely to ever be used, since proposals are immediately started after creation with the new web UI

### DELETE /server/:server/proposals/:proposal

Delete :proposal

Caller must be :proposal's author AND :proposal must not have already been executed

### GET /server/:server/proposals/:proposal

Get :proposal

Caller must be a member of :server

### GET /server/:server/proposals/:proposal/votes

Get all votes for :proposal

Caller must be a member of :server

### GET /server/:server/proposals/:proposal/myVote

Get callers vote for :proposal, null if not voted

Caller must be a member of :server

### POST /server/:server/proposals/:proposal/vote

Vote for :propsoal

Returns the new vote tally

Caller must a member of :server

### GET /server/:server/proposals/:proposal/actions

Get and resolve all actions of :proposal

Caller must be a member of :server

## Proxy

The calling user must be a member of :server

### GET /proxy/:server/member/:member

Returns a single user object

### GET /proxy/:server/member

Returns a list of IDs and Nicknames

### GET /proxy/:server/role/:role

Returns a single role object

### GET /proxy/:server/role

Returns a list of IDs and role names 

### GET /proxy/:server/channel/:channel

Returns a single channel object

### GET /proxy/:server/channel

Returns a list of IDs and channel names for each channel category

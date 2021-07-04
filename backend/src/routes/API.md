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

## Proposals

### GET /server/:server/proposal?s=:start&c=:count

Retrieve all proposals for a server.  Page starts with ID :start and has *up to* :count
proposals. :count must be (0, 1000].

### POST /server/:server/proposal

Create a new proposal

### GET /server/:server/proposal/recent?c=:count

Retrieve :count recent proposals

:count must be greater than 0 and less than 50

### GET /server/:server/proposal/endingSoon?w=:within&c=:count

Retrieve :count proposals ending within :within seconds

:within must be greater than 0 seconds and less than 86400 (1 day) seconds

:count must be greater than 0 and less than 50

### DELETE /server/:server/proposal/:proposal

NOT IMPLEMENTED

Delete :proposal

Caller must be :proposal's author AND :proposal must not have already been executed

### GET /server/:server/proposal/:proposal

Get :proposal

Caller must be a member of :server

### GET /server/:server/proposal/:proposal/votes

Get all votes for :proposal

Caller must be a member of :server

### GET /server/:server/proposal/:proposal/vote

Get callers vote for :proposal, null if not voted

Caller must be a member of :server

### POST /server/:server/proposal/:proposal/vote

Vote for :proposal

Returns the new vote tally

Caller must a member of :server

### GET /server/:server/proposal/:proposal/actions?r=:resolve

Get (and resolve if :resolve is set) all actions of :proposal

Caller must be a member of :server

## Proxy

The calling user must be a member of :server

### GET /server/:server/proxy/member/:member

Returns a single user object

### GET /server/:server/proxy/member?q=:query&c=:count

Returns up to :count IDs and Nicknames that match a query :query.

### GET /server/:server/proxy/role/:role

Returns a single role object

### GET /server/:server/proxy/role

Returns a list of IDs and role names 

### GET /server/:server/proxy/channel/:channel

Returns a single channel object

### GET /server/:server/proxy/channel

Returns a list of IDs and channel names for each channel category

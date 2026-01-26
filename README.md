# Territory 2.0 - WebSocket Protocol

This document defines the WebSocket communication protocol for the battle system.

## Connection
Endpoint: `ws://api.territory.game/ws`
Auth: Bearer Token in `Sec-WebSocket-Protocol` or Query Param `?token=...`

## Client to Server (C2S) Events

### 1. Join Battle
Request to join or reconnect to a battle.
```json
{
  "event": "battle_join",
  "data": {
    "battleId": "uuid-v4"
  }
}
```

### 2. Commit Turn
Sent when player selects attack and block zones.
```json
{
  "event": "battle_turn",
  "data": {
    "battleId": "uuid-v4",
    "attack": "HEAD", // HEAD, CHEST, STOMACH, LEGS
    "blocks": ["CHEST", "LEGS"] // Array of 2 distinct zones
  }
}
```

### 3. Send Chat Message
```json
{
  "event": "chat_send",
  "data": {
    "channel": "battle_uuid",
    "message": "Hello world"
  }
}
```

## Server to Client (S2C) Events

### 1. Battle State (Sync)
Sent on join or when state changes significantly.
```json
{
  "event": "battle_state",
  "data": {
    "id": "uuid",
    "timeLeft": 30, // seconds
    "round": 1,
    "participants": [
      { "id": "p1", "hp": 100, "maxHp": 100, "isReady": true },
      { "id": "p2", "hp": 80, "maxHp": 80, "isReady": false }
    ]
  }
}
```

### 2. Turn Result (Round End)
Sent when both players have committed or time is up.
```json
{
  "event": "battle_result",
  "data": {
    "round": 1,
    "log": [
      { "attacker": "p1", "target": "p2", "zone": "HEAD", "damage": 15, "isCrit": false, "isBlocked": false },
      { "attacker": "p2", "target": "p1", "zone": "CHEST", "damage": 0, "isCrit": false, "isBlocked": true }
    ],
    "newState": { ... } // Updated HP values
  }
}
```

### 3. Battle End
```json
{
  "event": "battle_end",
  "data": {
    "winner": "p1",
    "rewards": {
      "exp": 100,
      "money": 50
    }
  }
}
```

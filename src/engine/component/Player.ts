import { defineComponent, defineQuery, enterQuery, exitQuery, Not } from "bitecs";

import { Owned } from "../network/network.game";

export const Player = defineComponent({});

export const playerQuery = defineQuery([Player]);
export const enteredPlayerQuery = enterQuery(playerQuery);
export const exitedPlayerQuery = exitQuery(playerQuery);

export const ownedPlayerQuery = defineQuery([Player, Owned]);
export const enteredOwnedPlayerQuery = enterQuery(ownedPlayerQuery);
export const exitedOwnedPlayerQuery = exitQuery(ownedPlayerQuery);

export const remotePlayerQuery = defineQuery([Player, Not(Owned)]);
export const enteredRemotePlayerQuery = enterQuery(remotePlayerQuery);
export const exitedRemotePlayerQuery = exitQuery(remotePlayerQuery);

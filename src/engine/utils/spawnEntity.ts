import { vec3, quat, mat4 } from "gl-matrix";

import { Axes, isolateQuaternionAxis, Transform } from "../component/transform";
import { GameState } from "../GameTypes";
import { teleportEntity } from "./teleportEntity";

const _p = vec3.create();
const _q = quat.create();

export function spawnEntity(
  ctx: GameState,
  spawnPoints: number[],
  eid: number,
  spawnPointIndex = Math.round(Math.random() * (spawnPoints.length - 1))
) {
  const spawnWorldMatrix = Transform.worldMatrix[spawnPoints[spawnPointIndex]];
  const spawnPosition = mat4.getTranslation(_p, spawnWorldMatrix);
  const spawnQuaternion = mat4.getRotation(_q, spawnWorldMatrix);
  spawnPosition[1] += 1.6;
  isolateQuaternionAxis(spawnQuaternion, Axes.Y);

  teleportEntity(ctx, eid, spawnPosition, spawnQuaternion);
}

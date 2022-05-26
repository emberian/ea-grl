import { copyToWriteBuffer, swapWriteBuffer } from "./allocator/TripleBuffer";
import { renderableBuffer } from "./component/buffers";
import { updateMatrixWorld } from "./component/transform";
import { GameState } from "./GameTypes";

export function TimeSystem(state: GameState) {
  const now = performance.now();
  state.dt = (now - state.elapsed) / 1000;
  state.elapsed = now;
}

export const UpdateWorldMatrixSystem = (state: GameState) => {
  updateMatrixWorld(state.scene);
};

export const RenderableTripleBufferSystem = ({ renderer }: GameState) => {
  copyToWriteBuffer(renderer.tripleBuffer, renderableBuffer);
  swapWriteBuffer(renderer.tripleBuffer);
};

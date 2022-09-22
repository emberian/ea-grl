import RAPIER from "@dimforge/rapier3d-compat";
import { addComponent, addEntity } from "bitecs";
import { mat4, vec3, quat } from "gl-matrix";
import { Vector3 } from "three";

import {
  createRemoteAudioData,
  createRemoteAudioSource,
  playAudio,
  RemoteAudioSource,
  RemoteAudioEmitter,
  createRemotePositionalAudioEmitter,
} from "../engine/audio/audio.game";
import { Transform, addChild, addTransformComponent, setEulerFromQuaternion } from "../engine/component/transform";
import { GameState } from "../engine/GameTypes";
import { createGLTFEntity } from "../engine/gltf/gltf.game";
import {
  ActionDefinition,
  ActionType,
  BindingType,
  ButtonActionState,
  enableActionMap,
} from "../engine/input/ActionMappingSystem";
import { InputModule } from "../engine/input/input.game";
import { createRemoteStandardMaterial, RemoteMaterial } from "../engine/material/material.game";
import { createSphereMesh } from "../engine/mesh/mesh.game";
import { defineModule, getModule } from "../engine/module/module.common";
import { Networked, Owned } from "../engine/network/network.game";
import { addRemoteNodeComponent } from "../engine/node/node.game";
import { dynamicObjectCollisionGroups } from "../engine/physics/CollisionGroups";
import { addRigidBody, PhysicsModule, RigidBody } from "../engine/physics/physics.game";
import { createPrefabEntity, registerPrefab } from "../engine/prefab/prefab.game";
import { addResourceRef } from "../engine/resource/resource.game";
import randomRange from "../engine/utils/randomRange";
import { InteractableType } from "./interaction/interaction.common";
import { addInteractableComponent } from "./interaction/interaction.game";

type SpawnablesModuleState = {
  hitAudioEmitters: Map<number, RemoteAudioEmitter>;
  actions: ActionDefinition[];
};

export const SpawnablesModule = defineModule<GameState, SpawnablesModuleState>({
  name: "spawnables",
  create() {
    const actions = Array(6)
      .fill(null)
      .map((_, i) => ({
        id: `${i + 1}`,
        path: `${i + 1}`,
        type: ActionType.Button,
        bindings: [
          {
            type: BindingType.Button,
            path: `Keyboard/Digit${i + 1}`,
          },
        ],
      }));

    return {
      hitAudioEmitters: new Map(),
      actions,
    };
  },
  init(ctx) {
    const module = getModule(ctx, SpawnablesModule);

    const crateAudioData = createRemoteAudioData(ctx, { name: "Crate Audio Data", uri: "/audio/hit.wav" });
    addResourceRef(ctx, crateAudioData.resourceId);

    registerPrefab(ctx, {
      name: "small-crate",
      create: (ctx, remote) => {
        const eid = createGLTFEntity(ctx, "/gltf/sci_fi_crate.glb", { isStatic: false, createTrimesh: false });

        Transform.scale[eid].set([1, 1, 1]);

        const hitAudioSource = createRemoteAudioSource(ctx, {
          audio: crateAudioData,
          loop: false,
          autoPlay: false,
        });

        const audioEmitter = createRemotePositionalAudioEmitter(ctx, {
          sources: [hitAudioSource],
        });

        addRemoteNodeComponent(ctx, eid, {
          audioEmitter,
        });

        module.hitAudioEmitters.set(eid, audioEmitter);

        const rigidBodyDesc = remote
          ? RAPIER.RigidBodyDesc.newKinematicPositionBased()
          : RAPIER.RigidBodyDesc.newDynamic();
        const rigidBody = physicsWorld.createRigidBody(rigidBodyDesc);

        const colliderDesc = RAPIER.ColliderDesc.cuboid(1 / 2, 1 / 2, 1 / 2)
          .setActiveEvents(RAPIER.ActiveEvents.CONTACT_EVENTS)
          .setCollisionGroups(dynamicObjectCollisionGroups);

        physicsWorld.createCollider(colliderDesc, rigidBody.handle);

        addRigidBody(ctx, eid, rigidBody);

        addInteractableComponent(ctx, eid, InteractableType.Object);

        return eid;
      },
    });

    registerPrefab(ctx, {
      name: "medium-crate",
      create: (ctx, remote) => {
        const eid = createGLTFEntity(ctx, "/gltf/sci_fi_crate.glb", { isStatic: false, createTrimesh: false });

        Transform.scale[eid].set([2, 2, 2]);

        const hitAudioSource = createRemoteAudioSource(ctx, {
          audio: crateAudioData,
          loop: false,
          autoPlay: false,
        });

        const audioEmitter = createRemotePositionalAudioEmitter(ctx, {
          sources: [hitAudioSource],
        });

        addRemoteNodeComponent(ctx, eid, {
          audioEmitter,
        });

        module.hitAudioEmitters.set(eid, audioEmitter);

        const rigidBodyDesc = remote
          ? RAPIER.RigidBodyDesc.newKinematicPositionBased()
          : RAPIER.RigidBodyDesc.newDynamic();
        const rigidBody = physicsWorld.createRigidBody(rigidBodyDesc);

        const colliderDesc = RAPIER.ColliderDesc.cuboid(1, 1, 1)
          .setActiveEvents(RAPIER.ActiveEvents.CONTACT_EVENTS)
          .setCollisionGroups(dynamicObjectCollisionGroups);

        physicsWorld.createCollider(colliderDesc, rigidBody.handle);

        addRigidBody(ctx, eid, rigidBody);

        addInteractableComponent(ctx, eid, InteractableType.Object);

        return eid;
      },
    });

    registerPrefab(ctx, {
      name: "large-crate",
      create: (ctx, remote) => {
        const eid = createGLTFEntity(ctx, "/gltf/sci_fi_crate.glb", { isStatic: false, createTrimesh: false });

        Transform.scale[eid].set([3, 3, 3]);

        const hitAudioSource = createRemoteAudioSource(ctx, {
          audio: crateAudioData,
          loop: false,
          autoPlay: false,
        });

        const audioEmitter = createRemotePositionalAudioEmitter(ctx, {
          sources: [hitAudioSource],
        });

        addRemoteNodeComponent(ctx, eid, {
          audioEmitter,
        });

        module.hitAudioEmitters.set(eid, audioEmitter);

        const rigidBodyDesc = remote
          ? RAPIER.RigidBodyDesc.newKinematicPositionBased()
          : RAPIER.RigidBodyDesc.newDynamic();
        const rigidBody = physicsWorld.createRigidBody(rigidBodyDesc);

        const colliderDesc = RAPIER.ColliderDesc.cuboid(1.5, 1.5, 1.5)
          .setActiveEvents(RAPIER.ActiveEvents.CONTACT_EVENTS)
          .setCollisionGroups(dynamicObjectCollisionGroups);

        physicsWorld.createCollider(colliderDesc, rigidBody.handle);

        addRigidBody(ctx, eid, rigidBody);
        addInteractableComponent(ctx, eid, InteractableType.Object);

        return eid;
      },
    });

    const ballAudioData = createRemoteAudioData(ctx, { name: "Ball Audio Data", uri: "/audio/bounce.wav" });
    addResourceRef(ctx, ballAudioData.resourceId);

    const ballAudioData2 = createRemoteAudioData(ctx, { name: "Ball Audio Data 2", uri: "/audio/clink.wav" });
    addResourceRef(ctx, ballAudioData2.resourceId);

    const ballAudioData3 = createRemoteAudioData(ctx, { name: "Ball Audio Data 3", uri: "/audio/clink2.wav" });
    addResourceRef(ctx, ballAudioData3.resourceId);

    const emissiveMaterial = createRemoteStandardMaterial(ctx, {
      name: "Emissive Material",
      baseColorFactor: [0, 0.3, 1, 1],
      emissiveFactor: [0.7, 0.7, 0.7],
      metallicFactor: 0,
      roughnessFactor: 1,
    });

    addResourceRef(ctx, emissiveMaterial.resourceId);

    const mirrorMaterial = createRemoteStandardMaterial(ctx, {
      name: "Mirror Material",
      baseColorFactor: [1, 1, 1, 1],
      metallicFactor: 1,
      roughnessFactor: 0,
    });
    addResourceRef(ctx, mirrorMaterial.resourceId);

    const blackMirrorMaterial = createRemoteStandardMaterial(ctx, {
      name: "Black Mirror Material",
      baseColorFactor: [0, 0, 0, 1],
      metallicFactor: 1,
      roughnessFactor: 0,
    });
    addResourceRef(ctx, blackMirrorMaterial.resourceId);

    registerPrefab(ctx, {
      name: "mirror-ball",
      create: (ctx, remote) => {
        const eid = createBouncyBall(ctx, 1, mirrorMaterial, remote);

        const hitAudioSource = createRemoteAudioSource(ctx, {
          audio: ballAudioData3,
          loop: false,
          autoPlay: false,
          // TODO: this doesn't work
          gain: 0,
        });

        const audioEmitter = createRemotePositionalAudioEmitter(ctx, {
          sources: [hitAudioSource],
        });

        addRemoteNodeComponent(ctx, eid, {
          audioEmitter,
        });

        module.hitAudioEmitters.set(eid, audioEmitter);

        return eid;
      },
    });

    registerPrefab(ctx, {
      name: "black-mirror-ball",
      create: (ctx, remote) => {
        const eid = createBouncyBall(ctx, 1, blackMirrorMaterial, remote);

        const hitAudioSource = createRemoteAudioSource(ctx, {
          audio: ballAudioData2,
          loop: false,
          autoPlay: false,
          // TODO: this doesn't work
          gain: 0,
        });

        const audioEmitter = createRemotePositionalAudioEmitter(ctx, {
          sources: [hitAudioSource],
        });

        addRemoteNodeComponent(ctx, eid, {
          audioEmitter,
        });

        module.hitAudioEmitters.set(eid, audioEmitter);

        return eid;
      },
    });

    registerPrefab(ctx, {
      name: "emissive-ball",
      create: (ctx, remote) => {
        const eid = createBouncyBall(ctx, 1, emissiveMaterial, remote);

        const hitAudioSource = createRemoteAudioSource(ctx, {
          audio: ballAudioData,
          loop: false,
          autoPlay: false,
          // TODO: this doesn't work
          gain: 0,
        });

        const audioEmitter = createRemotePositionalAudioEmitter(ctx, {
          sources: [hitAudioSource],
        });

        addRemoteNodeComponent(ctx, eid, {
          audioEmitter,
        });

        module.hitAudioEmitters.set(eid, audioEmitter);

        return eid;
      },
    });

    // TODO: figure out why global emitters don't activate until a positional emitter is created/activated
    // const audioEmitter = createRemoteGlobalAudioEmitter(ctx, {
    //   sources: [hitAudioSource],
    // });
    // setInterval(() => {
    //   playAudio(hitAudioSource);
    // }, 1000);

    // collision handlers
    const { collisionHandlers, physicsWorld } = getModule(ctx, PhysicsModule);

    collisionHandlers.push((eid1?: number, eid2?: number, handle1?: number, handle2?: number) => {
      const body1 = physicsWorld.getRigidBody(handle1!);
      const body2 = physicsWorld.getRigidBody(handle2!);

      let gain = 1;

      if (body1 && body2) {
        const linvel1 = body1.linvel();
        const linvel2 = body2.linvel();

        const manhattanLength =
          Math.abs(linvel1.x) +
          Math.abs(linvel1.y) +
          Math.abs(linvel1.z) +
          Math.abs(linvel2.x) +
          Math.abs(linvel2.y) +
          Math.abs(linvel2.z);

        gain = manhattanLength / 20;
      }

      const playbackRate = randomRange(0.3, 0.75);

      const emitter1 = module.hitAudioEmitters.get(eid1!);
      if (emitter1) {
        const source = emitter1.sources[0] as RemoteAudioSource;
        playAudio(source, { playbackRate, gain });
      }

      const emitter2 = module.hitAudioEmitters.get(eid2!);
      if (emitter2) {
        const source = emitter2.sources[0] as RemoteAudioSource;
        playAudio(source, { playbackRate, gain });
      }
    });

    // action mapping
    const { actions } = module;

    // id determines which prefab is spawned in the system
    actions[0].id = "small-crate";
    actions[1].id = "medium-crate";
    actions[2].id = "large-crate";
    actions[3].id = "mirror-ball";
    actions[4].id = "black-mirror-ball";
    actions[5].id = "emissive-ball";

    enableActionMap(ctx, {
      id: "spawnables",
      actions,
    });
  },
});

const CUBE_THROW_FORCE = 10;

const _direction = vec3.create();
const _impulse = new Vector3();
const _cameraWorldQuat = quat.create();

export const SpawnableSystem = (ctx: GameState) => {
  const input = getModule(ctx, InputModule);
  const { actions } = getModule(ctx, SpawnablesModule);

  const spawnables = actions.filter((a) => (input.actions.get(a.path) as ButtonActionState)?.pressed);

  for (const spawnable of spawnables) {
    const eid = createPrefabEntity(ctx, spawnable.id);

    // caveat: must add owned before networked (should maybe change Owned to Remote)
    addComponent(ctx.world, Owned, eid);
    // Networked component isn't reset when removed so reset on add
    addComponent(ctx.world, Networked, eid, true);

    mat4.getTranslation(Transform.position[eid], Transform.worldMatrix[ctx.activeCamera]);

    mat4.getRotation(_cameraWorldQuat, Transform.worldMatrix[ctx.activeCamera]);
    const direction = vec3.set(_direction, 0, 0, -1);
    vec3.transformQuat(direction, direction, _cameraWorldQuat);

    // place object at direction
    const placement = vec3.clone(direction);
    // vec3.scale(placement, placement, 4);
    vec3.add(Transform.position[eid], Transform.position[eid], placement);

    vec3.scale(direction, direction, CUBE_THROW_FORCE);

    _impulse.fromArray(direction);

    const body = RigidBody.store.get(eid);

    if (!body) {
      console.warn("could not find RigidBody for spawned entity " + eid);
      continue;
    }

    setEulerFromQuaternion(Transform.rotation[eid], _cameraWorldQuat);

    body.applyImpulse(_impulse, true);

    addChild(ctx.activeScene, eid);
  }
};

export const createBouncyBall = (state: GameState, size: number, material?: RemoteMaterial, remote = false) => {
  const { world } = state;
  const { physicsWorld } = getModule(state, PhysicsModule);
  const eid = addEntity(world);
  addTransformComponent(world, eid);

  const mesh = createSphereMesh(state, 1, material);

  addRemoteNodeComponent(state, eid, { mesh });

  const rigidBodyDesc = remote ? RAPIER.RigidBodyDesc.newKinematicPositionBased() : RAPIER.RigidBodyDesc.newDynamic();
  const rigidBody = physicsWorld.createRigidBody(rigidBodyDesc);

  const colliderDesc = RAPIER.ColliderDesc.ball(size / 2)
    .setActiveEvents(RAPIER.ActiveEvents.CONTACT_EVENTS)
    .setCollisionGroups(dynamicObjectCollisionGroups)
    .setRestitution(1)
    .setDensity(1);

  physicsWorld.createCollider(colliderDesc, rigidBody.handle);

  addRigidBody(state, eid, rigidBody);

  addInteractableComponent(state, eid, InteractableType.Object);

  return eid;
};

import RAPIER from "@dimforge/rapier3d-compat";
import { addComponent, addEntity } from "bitecs";
import { Object3D, Quaternion, Vector3 } from "three";

import { createCamera } from "../engine/camera/camera.game";
import { addChild, addTransformComponent, Transform } from "../engine/component/transform";
import { GameState } from "../engine/GameTypes";
import {
  ActionMap,
  ActionType,
  BindingType,
  ButtonActionState,
  enableActionMap,
} from "../engine/input/ActionMappingSystem";
import { getInputController, InputModule } from "../engine/input/input.game";
import { InputController } from "../engine/input/InputController";
import { defineModule, getModule } from "../engine/module/module.common";
import { GameNetworkState } from "../engine/network/network.game";
import { NetworkModule } from "../engine/network/network.game";
import { playerCollisionGroups, playerShapeCastCollisionGroups } from "../engine/physics/CollisionGroups";
import { addRigidBody, PhysicsModule, PhysicsModuleState, RigidBody } from "../engine/physics/physics.game";
import { addPrefabComponent } from "../engine/prefab/prefab.game";
import { CharacterRig, characterRigQuery } from "./rigs/character.game";
import { addCameraPitchTargetComponent, addCameraYawTargetComponent } from "./FirstPersonCamera";

function physicsCharacterControllerAction(key: string) {
  return "PhysicsCharacterController/" + key;
}

export const PhysicsCharacterControllerActions = {
  Move: physicsCharacterControllerAction("Move"),
  Jump: physicsCharacterControllerAction("Jump"),
  Sprint: physicsCharacterControllerAction("Sprint"),
  Crouch: physicsCharacterControllerAction("Crouch"),
};

export const PhysicsCharacterControllerActionMap: ActionMap = {
  id: "physics-character-controller",
  actions: [
    {
      id: "move",
      path: PhysicsCharacterControllerActions.Move,
      type: ActionType.Vector2,
      bindings: [
        {
          type: BindingType.DirectionalButtons,
          up: "Keyboard/KeyW",
          down: "Keyboard/KeyS",
          left: "Keyboard/KeyA",
          right: "Keyboard/KeyD",
        },
      ],
    },
    {
      id: "jump",
      path: PhysicsCharacterControllerActions.Jump,
      type: ActionType.Button,
      bindings: [
        {
          type: BindingType.Button,
          path: "Keyboard/Space",
        },
      ],
    },
    {
      id: "crouch",
      path: PhysicsCharacterControllerActions.Crouch,
      type: ActionType.Button,
      bindings: [
        {
          type: BindingType.Button,
          path: "Keyboard/KeyC",
        },
      ],
    },
    {
      id: "sprint",
      path: PhysicsCharacterControllerActions.Sprint,
      type: ActionType.Button,
      bindings: [
        {
          type: BindingType.Button,
          path: "Keyboard/ShiftLeft",
        },
      ],
    },
  ],
};

type PhysicsCharacterControllerModuleState = {};

export const PhysicsCharacterControllerModule = defineModule<GameState, PhysicsCharacterControllerModuleState>({
  name: "physics-character-controller",
  create() {
    return {};
  },
  init(ctx) {
    const input = getModule(ctx, InputModule);
    const controller = input.defaultController;
    enableActionMap(controller, PhysicsCharacterControllerActionMap);
  },
});

const obj = new Object3D();

const walkSpeed = 60;
const drag = 30;
const maxWalkSpeed = 100;
const maxSprintSpeed = 100;
const sprintModifier = 3;
const jumpForce = 10;
const inAirModifier = 0.5;
const inAirDrag = 8;
const crouchModifier = 0.7;
const crouchJumpModifier = 1.5;
const minSlideSpeed = 3;
const slideModifier = 50;
const slideDrag = 150;
const slideCooldown = 1;

const moveForce = new Vector3();
const dragForce = new Vector3();
const linearVelocity = new Vector3();
const shapeCastPosition = new Vector3();
const shapeCastRotation = new Quaternion();
let isSliding = false;
const slideForce = new Vector3();
let lastSlideTime = 0;

const colliderShape = new RAPIER.Capsule(0.1, 0.5);

const shapeTranslationOffset = new Vector3(0, 0, 0);
const shapeRotationOffset = new Quaternion(0, 0, 0, 0);

export const createPlayerRig = (state: GameState, prefab: string, setActiveCamera = false) => {
  const { world } = state;

  const playerRig = addEntity(world);
  addTransformComponent(world, playerRig);

  // avatar to use for this rig
  addPrefabComponent(world, playerRig, prefab);

  addPlayerRig(state, playerRig, setActiveCamera);

  return playerRig;
};

export function addPlayerRig(state: GameState, playerRig: number, setActiveCamera = false) {
  const { world } = state;
  const { physicsWorld } = getModule(state, PhysicsModule);

  addComponent(world, CharacterRig, playerRig);

  addCameraYawTargetComponent(world, playerRig);

  const rigidBodyDesc = RAPIER.RigidBodyDesc.newDynamic();
  const rigidBody = physicsWorld.createRigidBody(rigidBodyDesc);

  const colliderDesc = RAPIER.ColliderDesc.capsule(0.5, 0.5);
  colliderDesc.setCollisionGroups(playerCollisionGroups);
  physicsWorld.createCollider(colliderDesc, rigidBody.handle);
  addRigidBody(state, playerRig, rigidBody);

  const camera = createCamera(state, setActiveCamera);
  addCameraPitchTargetComponent(world, camera);
  addChild(playerRig, camera);
  const cameraPosition = Transform.position[camera];
  cameraPosition[1] = 1.2;
}

function updatePhysicsCharacterController(
  ctx: GameState,
  { physicsWorld }: PhysicsModuleState,
  controller: InputController,
  network: GameNetworkState,
  playerRig: number
) {
  const body = RigidBody.store.get(playerRig);
  if (!body) {
    return;
  }

  const peerId = network.entityIdToPeerId.get(playerRig);
  if (!peerId) {
    return;
  }

  obj.quaternion.x = Transform.quaternion[playerRig][0];
  obj.quaternion.y = Transform.quaternion[playerRig][1];
  obj.quaternion.z = Transform.quaternion[playerRig][2];
  obj.quaternion.w = Transform.quaternion[playerRig][3];
  body.setRotation(obj.quaternion, true);

  // Handle Input
  const moveVec = controller.actions.get(PhysicsCharacterControllerActions.Move) as Float32Array;
  const jump = controller.actions.get(PhysicsCharacterControllerActions.Jump) as ButtonActionState;
  const crouch = controller.actions.get(PhysicsCharacterControllerActions.Crouch) as ButtonActionState;
  const sprint = controller.actions.get(PhysicsCharacterControllerActions.Sprint) as ButtonActionState;

  linearVelocity.copy(body.linvel() as Vector3);

  shapeCastPosition.copy(body.translation() as Vector3).add(shapeTranslationOffset);
  shapeCastRotation.copy(obj.quaternion).multiply(shapeRotationOffset);

  // todo: tune interaction groups
  const shapeCastResult = physicsWorld.castShape(
    shapeCastPosition,
    shapeCastRotation,
    physicsWorld.gravity,
    colliderShape,
    ctx.dt * 6,
    playerShapeCastCollisionGroups
  );

  const isGrounded = !!shapeCastResult;
  const isSprinting = isGrounded && sprint.held && !isSliding;

  const speed = linearVelocity.length();
  const maxSpeed = isSprinting ? maxSprintSpeed : maxWalkSpeed;

  if (speed < maxSpeed) {
    moveForce
      .set(moveVec[0], 0, -moveVec[1])
      .normalize()
      .applyQuaternion(obj.quaternion)
      .multiplyScalar(walkSpeed * ctx.dt);

    if (!isGrounded) {
      moveForce.multiplyScalar(inAirModifier);
    } else if (isGrounded && crouch.held && !isSliding) {
      moveForce.multiplyScalar(crouchModifier);
    } else if (isGrounded && sprint.held && !isSliding) {
      moveForce.multiplyScalar(sprintModifier);
    }
  }

  // TODO: Check to see if velocity matches orientation before sliding
  if (crouch.pressed && speed > minSlideSpeed && isGrounded && !isSliding && ctx.dt > lastSlideTime + slideCooldown) {
    slideForce.set(0, 0, (speed + 1) * -slideModifier).applyQuaternion(obj.quaternion);
    moveForce.add(slideForce);
    isSliding = true;
    lastSlideTime = ctx.elapsed;
  } else if (crouch.released || ctx.dt > lastSlideTime + slideCooldown) {
    isSliding = false;
  }

  if (speed !== 0) {
    let dragMultiplier = drag;

    if (isSliding) {
      dragMultiplier = slideDrag;
    } else if (!isGrounded) {
      dragMultiplier = inAirDrag;
    }

    dragForce
      .copy(linearVelocity)
      .negate()
      .multiplyScalar(dragMultiplier * ctx.dt);

    dragForce.y = 0;

    moveForce.add(dragForce);
  }

  if (jump.pressed && isGrounded) {
    const jumpModifier = crouch.held ? crouchJumpModifier : 1;
    moveForce.y += jumpForce * jumpModifier;
  }

  body.applyImpulse(moveForce, true);
  body.applyForce(physicsWorld.gravity as Vector3, true);
}

export const PhysicsCharacterControllerSystem = (ctx: GameState) => {
  const physics = getModule(ctx, PhysicsModule);
  const input = getModule(ctx, InputModule);
  const network = getModule(ctx, NetworkModule);

  const rigs = characterRigQuery(ctx.world);
  for (let i = 0; i < rigs.length; i++) {
    const eid = rigs[i];
    const controller = getInputController(input, eid);
    updatePhysicsCharacterController(ctx, physics, controller, network, eid);
  }
};

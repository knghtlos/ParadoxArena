import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Coord, GameState, PlayerId } from "@paradox/simulation";

interface Props {
  state: GameState;
  reducedMotion: boolean;
}

interface Actor {
  group: THREE.Group;
  materials: THREE.MeshStandardMaterial[];
  halo: THREE.Mesh;
  impact: THREE.Mesh;
  from: THREE.Vector3;
  to: THREE.Vector3;
  jumpStartedAt: number;
  damageStartedAt: number;
  integrity: number;
  phase: number;
}

const BOARD_STEP = 1.5;
const JUMP_MS = 720;

export function CharacterStage({ state, reducedMotion }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const actorsRef = useRef<Record<PlayerId, Actor> | undefined>(undefined);
  const animationRef = useRef(0);
  const reducedMotionRef = useRef(reducedMotion);
  reducedMotionRef.current = reducedMotion;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-4.3, 4.3, 4.3, -4.3, 0.1, 40);
    camera.position.set(0, 0.4, 12);
    camera.lookAt(0, 0.35, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.className = "character-stage-canvas";
    host.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xb8fff8, 0x071018, 2.25));
    const key = new THREE.DirectionalLight(0xffffff, 3.4);
    key.position.set(-4, 7, 8);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x8c70ff, 2.8);
    rim.position.set(5, 1, 5);
    scene.add(rim);

    const p1 = createAvatar(0x51f0dc, 0x13252a, -0.12);
    const p2 = createAvatar(0xff6275, 0x2b151c, 0.12);
    scene.add(p1.group, p2.group);

    const actors: Record<PlayerId, Actor> = {
      p1: makeActor(p1, state.players.p1.position, state.players.p1.integrity, 0),
      p2: makeActor(p2, state.players.p2.position, state.players.p2.integrity, Math.PI)
    };
    actorsRef.current = actors;

    const resize = () => {
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      renderer.setSize(width, height, false);
      const aspect = width / height;
      camera.left = -4.3 * aspect;
      camera.right = 4.3 * aspect;
      camera.top = 4.3;
      camera.bottom = -4.3;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    const clock = new THREE.Clock();
    const animate = () => {
      const elapsed = clock.getElapsedTime();
      const now = performance.now();
      for (const id of ["p1", "p2"] as PlayerId[]) animateActor(actors[id], elapsed, now, reducedMotionRef.current);
      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      observer.disconnect();
      for (const actor of Object.values(actors)) disposeActor(actor);
      renderer.dispose();
      renderer.domElement.remove();
      actorsRef.current = undefined;
    };
  }, []);

  useEffect(() => {
    const actors = actorsRef.current;
    if (!actors) return;
    const sameDestination =
      state.players.p1.position.row === state.players.p2.position.row
      && state.players.p1.position.col === state.players.p2.position.col;
    for (const id of ["p1", "p2"] as PlayerId[]) {
      const actor = actors[id];
      const player = state.players[id];
      const destination = coordToWorld(player.position);
      if (sameDestination) destination.x += id === "p1" ? -0.22 : 0.22;
      if (!actor.to.equals(destination)) {
        actor.from.copy(actor.group.position);
        actor.to.copy(destination);
        actor.jumpStartedAt = performance.now();
        actor.impact.visible = true;
        (actor.impact.material as THREE.MeshBasicMaterial).opacity = 0;
      }
      if (player.integrity < actor.integrity) actor.damageStartedAt = performance.now();
      actor.integrity = player.integrity;
    }
  }, [state]);

  return <div className="character-stage" ref={hostRef} aria-hidden="true" />;
}

function makeActor(
  avatar: ReturnType<typeof createAvatar>,
  coord: Coord,
  integrity: number,
  phase: number
): Actor {
  const position = coordToWorld(coord);
  avatar.group.position.copy(position);
  return {
    ...avatar,
    from: position.clone(),
    to: position.clone(),
    jumpStartedAt: -Infinity,
    damageStartedAt: -Infinity,
    integrity,
    phase
  };
}

function createAvatar(accent: number, shell: number, lean: number) {
  const group = new THREE.Group();
  group.rotation.z = lean;
  const materials = [
    new THREE.MeshStandardMaterial({ color: shell, roughness: 0.28, metalness: 0.72, emissive: accent, emissiveIntensity: 0.08 }),
    new THREE.MeshStandardMaterial({ color: accent, roughness: 0.18, metalness: 0.35, emissive: accent, emissiveIntensity: 0.55 }),
    new THREE.MeshStandardMaterial({ color: 0xeaffff, roughness: 0.12, metalness: 0.15, emissive: accent, emissiveIntensity: 0.22 })
  ];

  const pelvis = mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.18, 8), materials[0], 0, 0.26, 0);
  const torso = mesh(new THREE.CylinderGeometry(0.3, 0.22, 0.48, 8), materials[0], 0, 0.57, 0);
  torso.rotation.y = Math.PI / 8;
  const core = mesh(new THREE.OctahedronGeometry(0.13, 0), materials[1], 0, 0.6, 0.27);
  const neck = mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.11, 8), materials[1], 0, 0.86, 0);
  const head = mesh(new THREE.IcosahedronGeometry(0.235, 1), materials[0], 0, 1.08, 0);
  const visor = mesh(new THREE.BoxGeometry(0.31, 0.085, 0.06), materials[2], 0, 1.1, 0.205);
  visor.rotation.x = -0.08;

  const upperArmGeometry = new THREE.CapsuleGeometry(0.075, 0.26, 4, 8);
  const leftArm = mesh(upperArmGeometry, materials[0], -0.36, 0.61, 0);
  const rightArm = mesh(upperArmGeometry, materials[0], 0.36, 0.61, 0);
  leftArm.rotation.z = -0.32;
  rightArm.rotation.z = 0.32;
  const legGeometry = new THREE.CapsuleGeometry(0.085, 0.25, 4, 8);
  const leftLeg = mesh(legGeometry, materials[0], -0.14, 0.04, 0);
  const rightLeg = mesh(legGeometry, materials[0], 0.14, 0.04, 0);

  const haloMaterial = new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.7 });
  const halo = mesh(new THREE.TorusGeometry(0.42, 0.018, 8, 32), haloMaterial, 0, 0.55, -0.06);
  halo.rotation.x = Math.PI / 2;
  const impactMaterial = new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0, depthWrite: false });
  const impact = mesh(new THREE.RingGeometry(0.18, 0.24, 32), impactMaterial, 0, -0.12, 0);
  impact.visible = false;

  group.add(pelvis, torso, core, neck, head, visor, leftArm, rightArm, leftLeg, rightLeg, halo, impact);
  group.scale.setScalar(0.82);
  return { group, materials, halo, impact };
}

function mesh<T extends THREE.BufferGeometry, M extends THREE.Material>(
  geometry: T,
  material: M,
  x: number,
  y: number,
  z: number
): THREE.Mesh<T, M> {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(x, y, z);
  object.castShadow = true;
  object.receiveShadow = true;
  return object;
}

function coordToWorld(coord: Coord): THREE.Vector3 {
  return new THREE.Vector3((coord.col - 2) * BOARD_STEP, (2 - coord.row) * BOARD_STEP, 0);
}

function animateActor(actor: Actor, elapsed: number, now: number, reducedMotion: boolean): void {
  const jumpProgress = Math.min(1, Math.max(0, (now - actor.jumpStartedAt) / (reducedMotion ? 260 : JUMP_MS)));
  const jumping = jumpProgress < 1;
  const eased = 1 - Math.pow(1 - jumpProgress, 3);
  actor.group.position.lerpVectors(actor.from, actor.to, eased);
  const idle = reducedMotion ? 0 : Math.sin(elapsed * 2.4 + actor.phase) * 0.035;
  actor.group.position.y += idle;

  if (jumping) {
    const arc = reducedMotion ? 0.12 : Math.sin(jumpProgress * Math.PI) * 0.78;
    actor.group.position.y += arc;
    actor.group.rotation.y = Math.sin(jumpProgress * Math.PI) * (actor.phase === 0 ? -0.45 : 0.45);
    const anticipation = jumpProgress < 0.12 ? 0.88 + jumpProgress : 1;
    actor.group.scale.set(0.82 / anticipation, 0.82 * anticipation, 0.82 / anticipation);
  } else {
    actor.group.rotation.y *= 0.82;
    const sinceLanding = now - (actor.jumpStartedAt + (reducedMotion ? 260 : JUMP_MS));
    const squash = sinceLanding >= 0 && sinceLanding < 180 ? Math.sin((sinceLanding / 180) * Math.PI) * 0.16 : 0;
    actor.group.scale.set(0.82 + squash, 0.82 - squash * 0.75, 0.82 + squash);
    if (sinceLanding >= 0 && sinceLanding < 360) {
      const progress = sinceLanding / 360;
      actor.impact.visible = true;
      actor.impact.scale.setScalar(1 + progress * 3.8);
      (actor.impact.material as THREE.MeshBasicMaterial).opacity = (1 - progress) * 0.75;
    } else {
      actor.impact.visible = false;
    }
  }

  actor.halo.rotation.z = elapsed * (actor.phase === 0 ? 1.2 : -1.2);
  const damagePulse = Math.max(0, 1 - (now - actor.damageStartedAt) / 360);
  const baseEmissive = [0.08, 0.55, 0.22];
  actor.materials.forEach((material, index) => {
    material.emissiveIntensity = baseEmissive[index] + damagePulse * 2.4;
  });
  if (damagePulse > 0 && !reducedMotion) actor.group.position.x += Math.sin(now * 0.09) * 0.055 * damagePulse;
}

function disposeActor(actor: Actor): void {
  actor.group.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.geometry.dispose();
  });
  for (const material of actor.materials) material.dispose();
  (actor.halo.material as THREE.Material).dispose();
  (actor.impact.material as THREE.Material).dispose();
}

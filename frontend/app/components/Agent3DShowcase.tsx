'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, Pause, Play, Sparkles, Maximize2, RefreshCw } from 'lucide-react';
import { RoleInfo } from '../types';

interface Agent3DShowcaseProps {
  agent: RoleInfo;
  className?: string;
}

class CorkscrewCurve extends THREE.Curve<THREE.Vector3> {
  scale: number;
  constructor(scale = 1) {
    super();
    this.scale = scale;
  }
  getPoint(t: number): THREE.Vector3 {
    const angle = t * Math.PI * 4.4;
    const r = (0.045 + t * 0.065) * this.scale;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    const z = -t * 0.18 * this.scale;
    return new THREE.Vector3(x, y, z);
  }
}

export const Agent3DShowcase: React.FC<Agent3DShowcaseProps> = ({ agent, className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState(true);
  const isRotatingRef = useRef(true);
  isRotatingRef.current = isRotating;

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const turntableGroupRef = useRef<THREE.Group | null>(null);
  const pigMeshesRef = useRef<{
    head: THREE.Group;
    earL: THREE.Object3D;
    earR: THREE.Object3D;
    armL: THREE.Object3D;
    armR: THREE.Object3D;
    tail: THREE.Group;
  } | null>(null);

  // Drag interaction state
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const rotationVelocityRef = useRef(0);
  const manualRotYRef = useRef(0);
  const manualPitchRef = useRef(0.1);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    // 1. Scene & Camera setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 1.5, 3.8);
    camera.lookAt(0, 0.95, 0);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Studio Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5ea, 1.6);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 15;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.8);
    fillLight.position.set(-3, 3, -2);
    scene.add(fillLight);

    // Role-tinted rim / back light for game character hero glow
    const agentColorHex = parseInt((agent.color || '#2563eb').replace('#', ''), 16);
    const rimLight = new THREE.PointLight(agentColorHex, 2.8, 8);
    rimLight.position.set(0, 2.5, -2.8);
    scene.add(rimLight);

    // Under-glow light matching agent theme
    const underLight = new THREE.PointLight(agentColorHex, 2.0, 5);
    underLight.position.set(0, 0.3, 0);
    scene.add(underLight);

    // 4. Turntable Root Group
    const turntableGroup = new THREE.Group();
    turntableGroupRef.current = turntableGroup;
    scene.add(turntableGroup);

    // 5. RPG Pedestal Stage
    const pedestalBase = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 1.55, 0.25, 36),
      new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.85,
        roughness: 0.25,
      })
    );
    pedestalBase.position.y = 0.125;
    pedestalBase.receiveShadow = true;
    turntableGroup.add(pedestalBase);

    // Glowing Inner Ring
    const ringGeo = new THREE.TorusGeometry(1.32, 0.04, 16, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: agentColorHex,
      transparent: true,
      opacity: 0.9,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 0.26;
    turntableGroup.add(ringMesh);

    // Subtle floating stage runes / accent dots
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 8, 8),
        new THREE.MeshBasicMaterial({ color: agentColorHex })
      );
      dot.position.set(Math.cos(angle) * 1.25, 0.26, Math.sin(angle) * 1.25);
      turntableGroup.add(dot);
    }

    // 6. LuLu Pig Character Assembly
    const pigGroup = new THREE.Group();
    pigGroup.position.set(0, 0.26, 0);
    turntableGroup.add(pigGroup);

    // Flocked Velvet Skin & Material Suite (Designer Vinyl Collectible Aesthetic)
    const skinMat = new THREE.MeshPhysicalMaterial({
      color: 0xffdbe4, // Soft baby blossom peach pink
      roughness: 0.74, // Flocked velvet matte finish (TOYZEROPLUS vinyl texture)
      metalness: 0.0,
      sheen: 1.25,
      sheenColor: 0xffb0c2, // Peach-pink fuzzy rim glow (velvet flocking)
      sheenRoughness: 0.45,
      clearcoat: 0.04,
      clearcoatRoughness: 0.3,
    });

    // Iconic LuLu Honey-Apricot Yellow Snout Button
    const snoutMat = new THREE.MeshPhysicalMaterial({
      color: 0xf5a536, // Warm honey apricot yellow (authentic LuLu trademark signature!)
      roughness: 0.48,
      metalness: 0.0,
      sheen: 0.85,
      sheenColor: 0xfde047,
      sheenRoughness: 0.3,
      clearcoat: 0.15,
    });

    const innerEarMat = new THREE.MeshPhysicalMaterial({
      color: 0xfbcfe8, // Soft rosy petal pink inner ear
      roughness: 0.72,
      sheen: 0.7,
      sheenColor: 0xffccd5,
    });

    const tummyMat = new THREE.MeshPhysicalMaterial({
      color: 0xfff4f6, // Milky warm cream belly
      roughness: 0.75,
      sheen: 0.8,
      sheenColor: 0xffccd5,
    });

    const bobaEyeMat = new THREE.MeshPhysicalMaterial({
      color: 0x090d16, // Pure glossy obsidian black
      roughness: 0.04,
      metalness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
    });

    // 1. Unified Pear / Teardrop Body (Seamless chubby mochi, no neck gap)
    // Lower Chubby Belly & Pelvis
    const pelvisGeo = new THREE.SphereGeometry(0.58, 32, 32);
    pelvisGeo.scale(1.16, 1.05, 1.12);
    const pelvis = new THREE.Mesh(pelvisGeo, skinMat);
    pelvis.position.set(0, 0.52, 0.02);
    pelvis.castShadow = true;
    pigGroup.add(pelvis);

    // Mid Torso / Shoulders Transition
    const torsoGeo = new THREE.SphereGeometry(0.52, 32, 32);
    torsoGeo.scale(1.08, 1.04, 1.05);
    const torso = new THREE.Mesh(torsoGeo, skinMat);
    torso.position.set(0, 0.82, 0.01);
    torso.castShadow = true;
    pigGroup.add(torso);

    // 2. Cream Belly Patch (Front +Z)
    const tummy = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 24), tummyMat);
    tummy.position.set(0, 0.48, 0.36);
    tummy.scale.set(1.05, 0.96, 0.42);
    pigGroup.add(tummy);

    // 3. Cute Navel (Belly Button Dimple)
    const navelMat = new THREE.MeshBasicMaterial({ color: 0xe11d48, transparent: true, opacity: 0.5 });
    const navel = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.006, 6, 12), navelMat);
    navel.position.set(0, 0.36, 0.54);
    navel.rotation.x = 0.2;
    pigGroup.add(navel);

    // 4. Trotter Feet with Cleft Hoof & Rosy Paw Pads
    const footGeo = new THREE.SphereGeometry(0.16, 16, 16);
    footGeo.scale(1, 0.72, 1.32);

    const hoofPadMat = new THREE.MeshPhysicalMaterial({
      color: 0xf472b6,
      roughness: 0.55,
      sheen: 0.6,
    });

    [-0.28, 0.28].forEach((fx) => {
      const foot = new THREE.Group();
      foot.position.set(fx, 0.13, 0.38);

      const footMesh = new THREE.Mesh(footGeo, skinMat);
      footMesh.castShadow = true;
      foot.add(footMesh);

      // Soft pink cleft hoof indent
      const cleft = new THREE.Mesh(
        new THREE.BoxGeometry(0.014, 0.05, 0.08),
        new THREE.MeshBasicMaterial({ color: 0x9f1239 })
      );
      cleft.position.set(0, -0.01, 0.18);
      foot.add(cleft);

      const pad = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), hoofPadMat);
      pad.scale.set(1.0, 0.2, 1.2);
      pad.position.set(0, -0.07, 0.03);
      foot.add(pad);

      pigGroup.add(foot);
    });

    // 5. Chubby Trotter Paws (Stubby little arms)
    const armGeo = new THREE.SphereGeometry(0.15, 16, 16);
    armGeo.scale(0.85, 1.35, 0.85);

    const armL = new THREE.Group();
    armL.position.set(-0.42, 0.65, 0.24);
    armL.rotation.set(0.60, 0, 0.38);
    const armLMesh = new THREE.Mesh(armGeo, skinMat);
    armLMesh.castShadow = true;
    armL.add(armLMesh);
    const cleftL = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.05, 0.04), new THREE.MeshBasicMaterial({ color: 0x9f1239 }));
    cleftL.position.set(0, 0.16, 0.06);
    armL.add(cleftL);
    pigGroup.add(armL);

    const armR = new THREE.Group();
    armR.position.set(0.42, 0.65, 0.24);
    armR.rotation.set(0.60, 0, -0.38);
    const armRMesh = new THREE.Mesh(armGeo, skinMat);
    armRMesh.castShadow = true;
    armR.add(armRMesh);
    const cleftR = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.05, 0.04), new THREE.MeshBasicMaterial({ color: 0x9f1239 }));
    cleftR.position.set(0, 0.16, 0.06);
    armR.add(cleftR);
    pigGroup.add(armR);

    // 6. 3D Corkscrew Curly Spiral Tail
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, 0.38, -0.56);
    const corkscrewPath = new CorkscrewCurve(1.0);
    const tailGeo = new THREE.TubeGeometry(corkscrewPath, 24, 0.032, 8, false);
    const tailMesh = new THREE.Mesh(tailGeo, skinMat);
    tailMesh.castShadow = true;
    tailGroup.add(tailMesh);
    pigGroup.add(tailGroup);

    // 7. Head Parent Group (y = 1.10 - Seamlessly overlapping with torso)
    const head = new THREE.Group();
    head.position.set(0, 1.10, 0);

    const headGeo = new THREE.SphereGeometry(0.48, 32, 32);
    headGeo.scale(1.12, 0.98, 1.04);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.castShadow = true;
    head.add(headMesh);

    // Signature Chubby Droopy Mochi Jowls (Cheeks)
    const jowlGeo = new THREE.SphereGeometry(0.24, 20, 20);
    jowlGeo.scale(1.2, 0.9, 0.85);
    [-0.28, 0.28].forEach((jx) => {
      const jowl = new THREE.Mesh(jowlGeo, skinMat);
      jowl.position.set(jx, -0.08, 0.20);
      head.add(jowl);
    });

    // Iconic Honey-Apricot Yellow Snout Button
    const snoutGeo = new THREE.SphereGeometry(0.18, 24, 24);
    snoutGeo.scale(1.36, 0.86, 0.52);
    const snout = new THREE.Mesh(snoutGeo, snoutMat);
    snout.position.set(0, -0.04, 0.48);
    snout.castShadow = true;
    head.add(snout);

    // Soft Terracotta Amber Nostril Dimples
    const nostrilMat = new THREE.MeshBasicMaterial({ color: 0x92400e });
    [-0.07, 0.07].forEach((nx) => {
      const nostril = new THREE.Mesh(new THREE.SphereGeometry(0.024, 12, 12), nostrilMat);
      nostril.scale.set(0.85, 1.25, 0.4);
      nostril.position.set(nx, -0.038, 0.57);
      nostril.rotation.z = nx < 0 ? 0.12 : -0.12;
      head.add(nostril);
    });

    // Beady Obsidian Pearl Eyes with Clean Pinpoint Catchlight
    const shineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    [-0.22, 0.22].forEach((ex) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.044, 18, 18), bobaEyeMat);
      eye.position.set(ex, 0.065, 0.45);
      head.add(eye);

      const shine = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), shineMat);
      shine.position.set(ex + (ex > 0 ? -0.008 : 0.008), 0.08, 0.486);
      head.add(shine);
    });

    // Airbrushed Rosy Peach Cheek Blush
    const blushMat = new THREE.MeshBasicMaterial({
      color: 0xfb7185,
      transparent: true,
      opacity: 0.42,
    });
    [-0.30, 0.30].forEach((bx) => {
      const blush = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), blushMat);
      blush.scale.set(1.25, 0.75, 0.25);
      blush.position.set(bx, -0.065, 0.40);
      head.add(blush);
    });

    // Perky Petal Ears (Soft rounded leaf/petal cups)
    const earGeo = new THREE.SphereGeometry(0.19, 18, 18);
    earGeo.scale(1.0, 1.35, 0.32);

    const innerEarGeo = new THREE.SphereGeometry(0.14, 16, 16);
    innerEarGeo.scale(0.85, 1.15, 0.20);

    const earL = new THREE.Group();
    const earLOuter = new THREE.Mesh(earGeo, skinMat);
    earLOuter.castShadow = true;
    earL.add(earLOuter);
    const earLInner = new THREE.Mesh(innerEarGeo, innerEarMat);
    earLInner.position.set(0, -0.01, 0.05);
    earL.add(earLInner);
    earL.position.set(-0.36, 0.35, 0.04);
    earL.rotation.set(0.16, 0.22, 0.58);
    head.add(earL);

    const earR = new THREE.Group();
    const earROuter = new THREE.Mesh(earGeo, skinMat);
    earROuter.castShadow = true;
    earR.add(earROuter);
    const earRInner = new THREE.Mesh(innerEarGeo, innerEarMat);
    earRInner.position.set(0, -0.01, 0.05);
    earR.add(earRInner);
    earR.position.set(0.36, 0.35, 0.04);
    earR.rotation.set(0.16, -0.22, -0.58);
    head.add(earR);

    pigGroup.add(head);

    // 7. Role-Specific Signature Gear & Accessories
    const roleId = agent.id.toLowerCase();

    if (roleId === 'ceo') {
      // Golden CEO Glasses + Royal Bowtie
      const glassesMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.9,
        roughness: 0.1,
      });
      const glassL = new THREE.Mesh(new THREE.TorusGeometry(0.10, 0.016, 8, 16), glassesMat);
      glassL.position.set(-0.22, 0.065, 0.49);
      head.add(glassL);
      const glassR = new THREE.Mesh(new THREE.TorusGeometry(0.10, 0.016, 8, 16), glassesMat);
      glassR.position.set(0.22, 0.065, 0.49);
      head.add(glassR);

      const bow = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.11, 0.07),
        new THREE.MeshStandardMaterial({ color: 0x2563eb })
      );
      bow.position.set(0, 0.82, 0.42);
      pigGroup.add(bow);
    } else if (roleId === 'pm') {
      // Violet Project Binder & VIP Lanyard Badge
      const lanyardMat = new THREE.MeshStandardMaterial({ color: 0x7c3aed, roughness: 0.3 });
      const badge = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.02), lanyardMat);
      badge.position.set(0, 0.74, 0.46);
      pigGroup.add(badge);

      const binderMat = new THREE.MeshStandardMaterial({ color: 0xa855f7 });
      const binder = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.34, 0.05), binderMat);
      binder.position.set(0.36, 0.68, 0.32);
      binder.rotation.set(0.4, 0.2, -0.3);
      pigGroup.add(binder);
    } else if (roleId === 'designer') {
      // Red Artist Beret
      const beretMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.4 });
      const beret = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.28, 0.12, 16), beretMat);
      beret.position.set(0.12, 0.48, -0.05);
      beret.rotation.z = -0.3;
      head.add(beret);

      // Stylus Pen in paw
      const pen = new THREE.Mesh(
        new THREE.CylinderGeometry(0.016, 0.016, 0.26, 8),
        new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.8 })
      );
      pen.position.set(0.42, 0.72, 0.36);
      pen.rotation.set(0.7, 0, -0.4);
      pigGroup.add(pen);
    } else if (roleId === 'architect') {
      // Architect Monocle + Blueprint Tube
      const monoMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        metalness: 0.9,
        roughness: 0.1,
      });
      const monocle = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.016, 8, 16), monoMat);
      monocle.position.set(0.22, 0.065, 0.49);
      head.add(monocle);

      const tubeMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8 });
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.60, 12), tubeMat);
      tube.position.set(-0.40, 0.65, -0.15);
      tube.rotation.set(0.3, 0, 0.4);
      pigGroup.add(tube);
    } else if (roleId === 'database') {
      // Golden Data Platter
      const discMat = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        metalness: 0.7,
        roughness: 0.3,
      });
      const dbDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.13, 16), discMat);
      dbDisc.position.set(0.36, 0.64, 0.32);
      dbDisc.rotation.set(0.4, 0.3, -0.2);
      pigGroup.add(dbDisc);
    } else if (roleId === 'backend') {
      // Visor / Dark Cap + Steaming Coffee Mug
      const visor = new THREE.Mesh(
        new THREE.CylinderGeometry(0.48, 0.48, 0.07, 16, 1, false, 0, Math.PI),
        new THREE.MeshStandardMaterial({ color: 0x4f46e5 })
      );
      visor.position.set(0, 0.34, 0.18);
      visor.rotation.x = 0.2;
      head.add(visor);

      const mugMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.16, 12), mugMat);
      mug.position.set(0.38, 0.62, 0.36);
      pigGroup.add(mug);
    } else if (roleId === 'frontend') {
      // Tech Headphones
      const hpMat = new THREE.MeshStandardMaterial({ color: 0x059669 });
      const hpBand = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.04, 8, 24, Math.PI), hpMat);
      hpBand.position.set(0, 0.04, 0);
      hpBand.rotation.z = -Math.PI;
      head.add(hpBand);

      [-0.52, 0.52].forEach((hx) => {
        const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.09, 16), hpMat);
        cup.position.set(hx, 0.04, 0);
        cup.rotation.z = Math.PI / 2;
        head.add(cup);
      });
    } else if (roleId === 'security') {
      // Cool Dark Shades
      const shadeMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.1,
        metalness: 0.9,
      });
      const shades = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.13, 0.06), shadeMat);
      shades.position.set(0, 0.065, 0.50);
      head.add(shades);

      // Security Shield Badge
      const shieldMat = new THREE.MeshStandardMaterial({
        color: 0xdc2626,
        metalness: 0.7,
        roughness: 0.2,
      });
      const badge = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.18, 3), shieldMat);
      badge.rotation.z = Math.PI;
      badge.position.set(0, 0.78, 0.46);
      pigGroup.add(badge);
    } else if (roleId === 'qa') {
      // QA Magnifying Glass
      const glassFrame = new THREE.Mesh(
        new THREE.TorusGeometry(0.12, 0.018, 8, 16),
        new THREE.MeshStandardMaterial({ color: 0x0d9488, metalness: 0.8, roughness: 0.2 })
      );
      glassFrame.position.set(0.38, 0.68, 0.36);
      glassFrame.rotation.set(0.4, 0.2, -0.4);
      pigGroup.add(glassFrame);

      const glassHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.018, 0.16, 8),
        new THREE.MeshStandardMaterial({ color: 0x134e4a })
      );
      glassHandle.position.set(0.33, 0.58, 0.32);
      glassHandle.rotation.set(0.4, 0.2, -0.4);
      pigGroup.add(glassHandle);
    } else if (roleId === 'maintenance') {
      // Orange Safety Hardhat
      const hatMat = new THREE.MeshStandardMaterial({
        color: 0xf97316,
        roughness: 0.35,
        metalness: 0.2,
      });
      const hardhat = new THREE.Mesh(
        new THREE.SphereGeometry(0.45, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2),
        hatMat
      );
      hardhat.position.set(0, 0.38, 0.02);
      hardhat.scale.set(1.15, 0.75, 1.15);
      head.add(hardhat);

      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.035, 20), hatMat);
      brim.position.set(0, 0.34, 0.02);
      head.add(brim);

      // Steel Wrench
      const wrenchMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.8,
        roughness: 0.2,
      });
      const wrench = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.30, 0.035), wrenchMat);
      wrench.position.set(0.35, 0.72, 0.36);
      wrench.rotation.set(0.6, 0.2, -0.4);
      pigGroup.add(wrench);
    }

    pigMeshesRef.current = {
      head,
      earL,
      earR,
      armL,
      armR,
      tail: tailGroup,
    };

    // 8. Animation & Render Loop
    let animFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Slow Continuous Turntable Rotation
      if (isRotatingRef.current && !isDraggingRef.current) {
        manualRotYRef.current += 0.008; // Smooth ~0.48 rad/s turntable
      }

      // Smooth inertia from dragging
      if (!isDraggingRef.current && Math.abs(rotationVelocityRef.current) > 0.0001) {
        manualRotYRef.current += rotationVelocityRef.current;
        rotationVelocityRef.current *= 0.92;
      }

      if (turntableGroupRef.current) {
        turntableGroupRef.current.rotation.y = manualRotYRef.current;
        turntableGroupRef.current.rotation.x = manualPitchRef.current;
      }

      // Cute Living Idle Animations
      if (pigMeshesRef.current) {
        const { head, earL, earR, armL, armR, tail } = pigMeshesRef.current;
        // Subtle breathing
        head.position.y = 1.10 + Math.sin(time * 3) * 0.015;
        head.rotation.x = Math.sin(time * 2) * 0.03;

        // Ear twitches
        earL.rotation.z = 0.58 + Math.sin(time * 4) * 0.06;
        earR.rotation.z = -0.58 - Math.sin(time * 4) * 0.06;

        // Tail wag
        tail.rotation.y = (Math.PI / 2) + Math.sin(time * 6) * 0.35;

        // Gentle arm idle
        armL.position.y = 0.65 + Math.sin(time * 3) * 0.012;
        armR.position.y = 0.65 + Math.cos(time * 3) * 0.012;
      }

      // Pulse ring opacity
      ringMat.opacity = 0.75 + Math.sin(time * 4) * 0.2;

      renderer.render(scene, camera);
    };

    animate();

    // 9. Mouse & Touch Drag Handlers for 360-degree Inspection
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDraggingRef.current = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevMousePosRef.current = { x: clientX, y: clientY };
      rotationVelocityRef.current = 0;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - prevMousePosRef.current.x;
      const deltaY = clientY - prevMousePosRef.current.y;

      prevMousePosRef.current = { x: clientX, y: clientY };

      const rotSpeed = 0.009;
      manualRotYRef.current += deltaX * rotSpeed;
      rotationVelocityRef.current = deltaX * rotSpeed;

      // Limit pitch between -0.2 and 0.4 rad
      manualPitchRef.current = Math.max(-0.15, Math.min(0.35, manualPitchRef.current + deltaY * 0.005));
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    dom.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // 10. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newW = entry.contentRect.width;
        const newH = entry.contentRect.height;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();

      dom.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);

      dom.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);

      renderer.dispose();
      scene.clear();
      if (container.contains(dom)) {
        container.removeChild(dom);
      }
    };
  }, [agent]);

  const handleResetAngle = () => {
    manualRotYRef.current = 0;
    manualPitchRef.current = 0.1;
    rotationVelocityRef.current = 0;
  };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-slate-700/60 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 shadow-xl flex flex-col ${className}`}
    >
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={mountRef}
        className="w-full h-64 sm:h-72 cursor-grab active:cursor-grabbing select-none"
        title="Drag to rotate 360°"
      />

      {/* Top Overlay Badge */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/80 text-[11px] font-medium text-slate-300 pointer-events-none">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>3D Character Turntable</span>
      </div>

      {/* Interactive Turntable Controls Overlay */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md px-2 py-1 rounded-xl border border-slate-700/80 shadow-md">
        <button
          type="button"
          onClick={() => setIsRotating((prev) => !prev)}
          className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
            isRotating
              ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
          title={isRotating ? 'Pause Turntable' : 'Play Turntable'}
        >
          {isRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span className="text-[10px] hidden sm:inline">{isRotating ? 'Spinning' : 'Paused'}</span>
        </button>

        <button
          type="button"
          onClick={handleResetAngle}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Reset View Angle"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Drag instruction notice at bottom left */}
      <div className="absolute bottom-3 left-3 text-[10px] text-slate-400/80 font-mono pointer-events-none hidden sm:block">
        ↔ Drag with mouse to inspect 360°
      </div>
    </div>
  );
};

'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoleInfo } from '../types';
import {
  RotateCcw,
  Sparkles,
  Eye,
  Activity,
  Upload,
  HelpCircle,
  Check,
  Building2,
  Briefcase,
  Palette,
  Server,
  Code,
  Shield,
  Wrench,
  Sliders,
  Maximize2,
  Minimize2,
} from 'lucide-react';

class CorkscrewCurve extends THREE.Curve<THREE.Vector3> {
  scale: number;
  constructor(scale = 1) {
    super();
    this.scale = scale;
  }
  getPoint(t: number): THREE.Vector3 {
    const angle = t * Math.PI * 4.4;
    const r = (0.042 + t * 0.058) * this.scale;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    const z = -t * 0.16 * this.scale;
    return new THREE.Vector3(x, y, z);
  }
}

// Seamless Single-Mesh Organic Sculpting for LuLu the Piggy Head (No intersecting cheek spheres!)
function createSculptedHeadGeometry(): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(0.48, 56, 48);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const nx = Math.max(-1, Math.min(1, v.x / 0.48));
    const ny = Math.max(-1, Math.min(1, v.y / 0.48));
    const nz = Math.max(-1, Math.min(1, v.z / 0.48));

    // Base cute bun proportions
    let x = v.x * 1.14;
    let y = v.y * 0.96;
    let z = v.z * 1.02;

    // 1. Signature Chubby Mochi Cheek/Jowl Swell (seamless vertex deformation)
    const cheekVertical = Math.exp(-Math.pow((ny + 0.24) / 0.38, 2));
    const cheekSide = Math.pow(Math.max(0, Math.min(1, Math.abs(nx) * 1.15)), 1.35);
    const cheekFront = Math.max(0, (nz + 0.45) / 1.45);
    const cheekFactor = cheekVertical * cheekSide * cheekFront;

    x += Math.sign(nx) * 0.125 * cheekFactor;
    z += 0.065 * cheekFactor;
    y -= 0.042 * cheekFactor;

    // 2. Gentle rounded forehead dome taper
    if (ny > 0.15) {
      const foreheadT = (ny - 0.15) / 0.85;
      const taper = 1.0 - 0.08 * foreheadT * foreheadT;
      x *= taper;
      z *= taper;
    }

    // 3. Soften & flatten front facial plane slightly so snout/eyes sit naturally flush
    if (nz > 0.35) {
      const faceCenter = Math.exp(-(nx * nx) * 1.8 - Math.pow(ny + 0.02, 2) * 2.2);
      z -= 0.028 * faceCenter * ((nz - 0.35) / 0.65);
    }

    // 4. Smooth flat-ish chin/neck underside
    if (ny < -0.62) {
      const bottomT = (-0.62 - ny) / 0.38;
      y += 0.045 * bottomT * bottomT;
    }

    pos.setXYZ(i, x, y, z);
  }

  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  return geo;
}

// Seamless Single-Mesh Organic Sculpting for Chubby Pear/Mochi Torso (No stacked sphere seams!)
function createSculptedTorsoGeometry(): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(0.54, 52, 44);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const ny = Math.max(-1, Math.min(1, v.y / 0.54)); // Clamped -1 (bottom) to +1 (neck)
    const nz = Math.max(-1, Math.min(1, v.z / 0.54));

    // Normalized height t clamped strictly in [0, 1] to prevent Float32 negative base in Math.pow
    const t = Math.max(0, Math.min(1, (ny + 1) * 0.5));

    // Smooth pear silhouette profile: wide plump lower belly tapering into cozy shoulders
    const pearProfile = 1.18 - 0.28 * Math.pow(t, 1.35) + 0.12 * Math.sin(t * Math.PI);
    let x = v.x * pearProfile * 1.04;
    let y = v.y * 1.06;
    let z = v.z * pearProfile;

    // Plump round tummy curve on the front (+Z)
    if (nz > 0) {
      const bellyCurve = Math.exp(-Math.pow((ny + 0.18) / 0.48, 2)) * nz;
      z += 0.075 * bellyCurve;
    }

    // Cute rounded peach bottom on the back (-Z)
    if (nz < -0.1 && ny < 0.05) {
      const peachCurve = Math.exp(-Math.pow((ny + 0.35) / 0.4, 2)) * Math.abs(nz);
      z -= 0.045 * peachCurve;
    }

    // Flatten bottom slightly so the seated pig rests naturally on the chair cushion
    if (ny < -0.68) {
      const seatFlat = (-0.68 - ny) / 0.32;
      y += 0.075 * seatFlat * seatFlat;
    }

    pos.setXYZ(i, x, y, z);
  }

  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  return geo;
}

// Organically Curved & Folded LuLu Petal Ear Geometry
function createSculptedEarGeometry(isLeft: boolean): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(0.18, 28, 24);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  const dir = isLeft ? -1 : 1;

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const nx = Math.max(-1, Math.min(1, v.x / 0.18));
    const ny = Math.max(-1, Math.min(1, v.y / 0.18)); // Clamped -1 base to +1 tip
    const nz = Math.max(-1, Math.min(1, v.z / 0.18));

    const t = Math.max(0, Math.min(1, (ny + 1) * 0.5)); // Clamped [0, 1]
    // Heart-petal width profile: narrow root, wide mid-petal, soft rounded tip
    const widthProfile = 0.72 + 0.52 * Math.sin(t * Math.PI) * (1 - 0.18 * t);

    let x = v.x * widthProfile * 1.05;
    let y = v.y * 1.38;
    let z = v.z * 0.34;

    // Concave inner ear cup on front (+Z)
    if (nz > 0) {
      const cup = Math.sin(t * Math.PI) * Math.max(0, 1 - nx * nx);
      z -= 0.026 * cup;
    }

    // Authentic LuLu forward & outward floppy ear fold near the upper half
    const fold = Math.pow(t, 1.85);
    z += 0.135 * fold;
    x += dir * 0.055 * fold;
    y -= 0.045 * Math.pow(t, 2.4);

    pos.setXYZ(i, x, y, z);
  }

  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  return geo;
}

// Seamless Flocked Peach Skin + Airbrushed Milky Cream Belly & Navel Texture
function createPigBodyTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Base baby-blossom peach pink skin
    ctx.fillStyle = '#ffdbe4';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle warm rosy lower-body blush gradient
    const bottomGrad = ctx.createLinearGradient(0, 320, 0, 512);
    bottomGrad.addColorStop(0, 'rgba(251, 182, 206, 0)');
    bottomGrad.addColorStop(1, 'rgba(244, 114, 182, 0.25)');
    ctx.fillStyle = bottomGrad;
    ctx.fillRect(0, 320, 512, 192);

    // In Three.js SphereGeometry UV mapping, +Z (front belly) is around u = 0.75 (or 0.25 depending on orientation)
    // Wait: in Three.js SphereGeometry, phi=0 starts at -X, phi=PI/2 is +Z (u = 0.25), phi=3PI/2 is -Z (u = 0.75).
    // Let's paint soft airbrushed cream belly patches at u = 0.25 (x = 128) so the front (+Z) has a seamless cream tummy!
    const drawBellyAt = (cx: number, cy: number) => {
      const grad = ctx.createRadialGradient(cx, cy, 12, cx, cy, 92);
      grad.addColorStop(0, 'rgba(255, 250, 245, 0.95)');
      grad.addColorStop(0.65, 'rgba(255, 245, 247, 0.75)');
      grad.addColorStop(1, 'rgba(255, 219, 228, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 88, 105, 0, 0, Math.PI * 2);
      ctx.fill();

      // Soft cute navel dimple
      ctx.fillStyle = 'rgba(225, 29, 72, 0.38)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 38, 6.5, 4.8, 0, 0, Math.PI * 2);
      ctx.fill();
    };
    drawBellyAt(128, 290);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Soft Airbrushed Radial Blush Texture (Zero harsh edges)
function createAirbrushedBlushTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 58);
    grad.addColorStop(0, 'rgba(251, 113, 133, 0.78)');
    grad.addColorStop(0.45, 'rgba(251, 113, 133, 0.42)');
    grad.addColorStop(0.8, 'rgba(253, 164, 175, 0.12)');
    grad.addColorStop(1, 'rgba(253, 164, 175, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Authentic SPAM Can Wrap Texture
function createSpamCanTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Classic Royal Blue Tin
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(0, 0, 256, 128);

    // Top & bottom metallic rim bands
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 0, 256, 10);
    ctx.fillRect(0, 118, 256, 10);

    // Yellow/Gold Band
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, 28, 256, 48);

    // Bold SPAM Typography on front & back
    ctx.fillStyle = '#1e3a8a';
    ctx.font = '900 28px "Arial Black", Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('LULU', 64, 53);
    ctx.fillText('SPAM', 192, 53);

    // Cute pink piggy badge below
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(24, 84, 80, 20);
    ctx.fillRect(152, 84, 80, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('100% CUTE', 64, 95);
    ctx.fillText('CLASSIC', 192, 95);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Realistic Dark-Mode IDE & UI Monitor Screen Texture
function createMonitorScreenTexture(accentHex: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 148;
  const ctx = canvas.getContext('2d');
  const hexStr = '#' + accentHex.toString(16).padStart(6, '0');
  if (ctx) {
    // Dark IDE background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 256, 148);

    // Left File Explorer Sidebar
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, 44, 148);
    // Window control dots
    ['#ef4444', '#f59e0b', '#22c55e'].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(10 + i * 9, 10, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    for (let y = 26; y < 130; y += 11) {
      ctx.fillStyle = y === 48 ? hexStr : '#334155';
      ctx.fillRect(8, y, 26, 4);
    }

    // Top Tab Bar
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(44, 0, 212, 16);
    ctx.fillStyle = hexStr;
    ctx.fillRect(48, 14, 52, 2);

    // Code Syntax Lines
    const codeColors = [hexStr, '#38bdf8', '#a855f7', '#34d399', '#f472b6', '#cbd5e1'];
    for (let row = 0; row < 8; row++) {
      const y = 26 + row * 11;
      const indent = (row % 3) * 10;
      ctx.fillStyle = codeColors[row % codeColors.length];
      ctx.fillRect(54 + indent, y, 28 + ((row * 17) % 45), 4.5);

      ctx.fillStyle = '#64748b';
      ctx.fillRect(92 + indent + ((row * 17) % 35), y, 32, 4.5);
    }

    // Right Analytics Mini-Widget
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(182, 24, 66, 82);
    ctx.strokeStyle = hexStr;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(188, 86);
    ctx.lineTo(202, 68);
    ctx.lineTo(216, 74);
    ctx.lineTo(230, 50);
    ctx.lineTo(242, 42);
    ctx.stroke();

    // Bottom Terminal Status Bar
    ctx.fillStyle = '#090d16';
    ctx.fillRect(44, 120, 212, 28);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(52, 128, 8, 4);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(64, 128, 95, 4);
    ctx.fillStyle = hexStr;
    ctx.fillRect(52, 138, 140, 3);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

interface CatOffice3DProps {
  roles: RoleInfo[];
  activeAgentId?: string;
  activePhase?: string;
  isRunning: boolean;
  completedAgents?: string[];
  onTestFlow?: () => void;
  onInspectAgent?: (agent: RoleInfo) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

interface DeskConfig {
  id: string;
  name: string;
  title: string;
  color: string;
  x: number;
  z: number;
  rotationY: number;
  accessory: string;
  screenGlowColor: number;
  departmentId: string;
  departmentName: string;
}

interface DepartmentInfo {
  id: string;
  code: string;
  titleEn: string;
  titleTh: string;
  color: string;
  colorHex: number;
  floorColor: number;
  xCenter: number;
  zCenter: number;
  doorX: number;
  doorZ: number; // Doorway threshold: -2.3 for north rooms, +2.3 for south rooms
  doorInsideZ: number; // Inside room step: -3.2 for north rooms, +3.2 for south rooms
  cameraPos: [number, number, number];
  cameraTarget: [number, number, number];
}

const DEPARTMENTS: Record<string, DepartmentInfo> = {
  exec: {
    id: 'exec',
    code: 'HQ-01',
    titleEn: 'EXECUTIVE & PRODUCT',
    titleTh: 'ฝ่ายบริหารและวางแผนผลิตภัณฑ์',
    color: '#2563EB',
    colorHex: 0x2563eb,
    floorColor: 0xd4be9f, // Warm executive oak parquet
    xCenter: -14.0,
    zCenter: -6.7,
    doorX: -14.0,
    doorZ: -2.3,
    doorInsideZ: -3.4,
    cameraPos: [-14.0, 13, 3.5],
    cameraTarget: [-14.0, 1.2, -6.7],
  },
  arch: {
    id: 'arch',
    code: 'LAB-02',
    titleEn: 'ARCHITECTURE & DATA',
    titleTh: 'สถาปัตยกรรมระบบและฐานข้อมูล',
    color: '#0284C7',
    colorHex: 0x0284c7,
    floorColor: 0xdbeafe, // Clean tech blue ceramic
    xCenter: 0.0,
    zCenter: -6.7,
    doorX: 0.0,
    doorZ: -2.3,
    doorInsideZ: -3.4,
    cameraPos: [0.0, 13, 3.5],
    cameraTarget: [0.0, 1.2, -6.7],
  },
  sec: {
    id: 'sec',
    code: 'SEC-03',
    titleEn: 'SECURITY & QA FORTRESS',
    titleTh: 'ฝ่ายความปลอดภัยและประกันคุณภาพ',
    color: '#DC2626',
    colorHex: 0xdc2626,
    floorColor: 0xe2e8f0, // Polished dark slate
    xCenter: 14.0,
    zCenter: -6.7,
    doorX: 14.0,
    doorZ: -2.3,
    doorInsideZ: -3.4,
    cameraPos: [14.0, 13, 3.5],
    cameraTarget: [14.0, 1.2, -6.7],
  },
  design: {
    id: 'design',
    code: 'STU-04',
    titleEn: 'CREATIVE UI/UX STUDIO',
    titleTh: 'สตูดิโอออกแบบประสบการณ์ผู้ใช้',
    color: '#E11D48',
    colorHex: 0xe11d48,
    floorColor: 0xffe4e6, // Rose-peach terrazzo
    xCenter: -14.0,
    zCenter: 6.7,
    doorX: -14.0,
    doorZ: 2.3,
    doorInsideZ: 3.4,
    cameraPos: [-14.0, 13, 16.5],
    cameraTarget: [-14.0, 1.2, 6.7],
  },
  dev: {
    id: 'dev',
    code: 'DEV-05',
    titleEn: 'SOFTWARE ENGINEERING',
    titleTh: 'ห้องปฏิบัติการพัฒนาซอฟต์แวร์',
    color: '#4F46E5',
    colorHex: 0x4f46e5,
    floorColor: 0xede9fe, // Tech indigo-gray
    xCenter: 0.0,
    zCenter: 6.7,
    doorX: 0.0,
    doorZ: 2.3,
    doorInsideZ: 3.4,
    cameraPos: [0.0, 13, 16.5],
    cameraTarget: [0.0, 1.2, 6.7],
  },
  ops: {
    id: 'ops',
    code: 'OPS-06',
    titleEn: 'MAINTENANCE & OPERATIONS',
    titleTh: 'ศูนย์ซ่อมบำรุงและดูแลระบบ',
    color: '#F97316',
    colorHex: 0xf97316,
    floorColor: 0xf1f5f9, // Workshop concrete
    xCenter: 14.0,
    zCenter: 6.7,
    doorX: 14.0,
    doorZ: 2.3,
    doorInsideZ: 3.4,
    cameraPos: [14.0, 13, 16.5],
    cameraTarget: [14.0, 1.2, 6.7],
  },
};

const DESK_CONFIGS: Record<string, DeskConfig> = {
  // Room 1: Executive & Product Suite (North-West)
  ceo: {
    id: 'ceo',
    name: 'Alex Vance',
    title: 'Chief Executive Officer',
    color: '#2563EB',
    x: -16.5,
    z: -6.7,
    rotationY: 0.35,
    accessory: 'ceo',
    screenGlowColor: 0x3b82f6,
    departmentId: 'exec',
    departmentName: 'Executive & Product Suite',
  },
  pm: {
    id: 'pm',
    name: 'Sophia Chen',
    title: 'Lead Product Manager',
    color: '#7C3AED',
    x: -11.5,
    z: -6.7,
    rotationY: -0.35,
    accessory: 'pm',
    screenGlowColor: 0xa855f7,
    departmentId: 'exec',
    departmentName: 'Executive & Product Suite',
  },

  // Room 2: Architecture & Data Lab (North-Center)
  architect: {
    id: 'architect',
    name: 'Marcus Sterling',
    title: 'Chief System Architect',
    color: '#0284C7',
    x: -3.5,
    z: -6.7,
    rotationY: 0.3,
    accessory: 'architect',
    screenGlowColor: 0x38bdf8,
    departmentId: 'arch',
    departmentName: 'Architecture & Data Lab',
  },
  database: {
    id: 'database',
    name: 'Vikram Patel',
    title: 'Database Architect',
    color: '#D97706',
    x: 3.5,
    z: -6.7,
    rotationY: -0.3,
    accessory: 'database',
    screenGlowColor: 0xfbbf24,
    departmentId: 'arch',
    departmentName: 'Architecture & Data Lab',
  },

  // Room 3: Security & QA Fortress (North-East)
  security: {
    id: 'security',
    name: 'Samira Khan',
    title: 'DevSecOps Specialist',
    color: '#DC2626',
    x: 11.5,
    z: -6.7,
    rotationY: 0.3,
    accessory: 'security',
    screenGlowColor: 0xef4444,
    departmentId: 'sec',
    departmentName: 'Security & QA Fortress',
  },
  qa: {
    id: 'qa',
    name: 'Elena Rostova',
    title: 'QA & Release Lead',
    color: '#0D9488',
    x: 16.5,
    z: -6.7,
    rotationY: -0.3,
    accessory: 'qa',
    screenGlowColor: 0x14b8a6,
    departmentId: 'sec',
    departmentName: 'Security & QA Fortress',
  },

  // Room 4: Creative UI/UX Studio (South-West)
  designer: {
    id: 'designer',
    name: 'Maya Lin',
    title: 'Lead UI/UX Designer',
    color: '#E11D48',
    x: -16.0,
    z: 6.7,
    rotationY: 0.25,
    accessory: 'designer',
    screenGlowColor: 0xf43f5e,
    departmentId: 'design',
    departmentName: 'Creative UI/UX Studio',
  },

  // Room 5: Software Engineering Lab (South-Center)
  backend: {
    id: 'backend',
    name: "Sean O'Connor",
    title: 'Senior Backend Engineer',
    color: '#4F46E5',
    x: -3.5,
    z: 6.7,
    rotationY: 0.3,
    accessory: 'backend',
    screenGlowColor: 0x6366f1,
    departmentId: 'dev',
    departmentName: 'Software Engineering Lab',
  },
  frontend: {
    id: 'frontend',
    name: 'David Kim',
    title: 'Senior Frontend Engineer',
    color: '#059669',
    x: 3.5,
    z: 6.7,
    rotationY: -0.3,
    accessory: 'frontend',
    screenGlowColor: 0x10b981,
    departmentId: 'dev',
    departmentName: 'Software Engineering Lab',
  },

  // Room 6: Operations & Maintenance Bay (South-East)
  maintenance: {
    id: 'maintenance',
    name: 'Lucas Miller',
    title: 'Maintenance & Support Lead',
    color: '#F97316',
    x: 14.0,
    z: 6.7,
    rotationY: 0,
    accessory: 'maintenance',
    screenGlowColor: 0xf97316,
    departmentId: 'ops',
    departmentName: 'Maintenance & Operations',
  },
};

// Canvas texture helper for glowing modern department door signs
function createDepartmentSignboardTexture(
  code: string,
  titleEn: string,
  titleTh: string,
  accentColor: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 140;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(4, 4, 504, 132, 14);
    ctx.fill();

    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.roundRect(20, 20, 88, 30, 8);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(code, 64, 35);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 21px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(titleEn, 120, 35);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Sarabun", sans-serif';
    ctx.fillText(titleTh, 24, 92);

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(480, 35, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

// Detailed Canvas Texture Generators for Real Office Decor
function createExecutiveRoadmapTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 512, 256);

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let x = 20; x < 512; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 256);
      ctx.stroke();
    }
    for (let y = 20; y < 256; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('EXECUTIVE STRATEGY & Q3 OKRs', 25, 38);

    // Timeline bars
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(25, 65, 140, 26);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('PHASE 1: RESEARCH', 35, 82);

    ctx.fillStyle = '#7c3aed';
    ctx.fillRect(180, 105, 180, 26);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('PHASE 2: ARCHITECTURE', 190, 122);

    ctx.fillStyle = '#059669';
    ctx.fillRect(320, 145, 150, 26);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('PHASE 3: RELEASE', 330, 162);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('Target SLO: 99.99% • ARR Target: $10M • NPS: 85+', 25, 215);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

function createNocTelemetryTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, 512, 256);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < 512; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 256);
      ctx.stroke();
    }
    for (let y = 0; y < 256; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    // Header
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('● CLOUD NOC TELEMETRY MONITOR', 20, 32);

    // CPU Chart
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(20, 120);
    ctx.lineTo(80, 90);
    ctx.lineTo(140, 110);
    ctx.lineTo(200, 70);
    ctx.lineTo(260, 85);
    ctx.lineTo(320, 60);
    ctx.lineTo(380, 80);
    ctx.lineTo(480, 65);
    ctx.stroke();

    ctx.fillStyle = '#22c55e';
    ctx.font = '12px monospace';
    ctx.fillText('CLUSTER CPU: 38% | RAM: 14.2/64 GB | LATENCY: 18ms', 20, 160);

    // Database Status
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('POSTGRES REPLICAS: 3/3 SYNCED | REDIS CACHE HIT: 98.4%', 20, 190);

    ctx.fillStyle = '#0284c7';
    ctx.fillText('KUBERNETES PODS: 48 RUNNING (0 CRASHLOOP)', 20, 220);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

function createSecurityRadarTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, 512, 256);

    // Radar circular grid
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    const cx = 130;
    const cy = 130;
    [30, 65, 100].forEach((r) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(cx - 105, cy);
    ctx.lineTo(cx + 105, cy);
    ctx.moveTo(cx, cy - 105);
    ctx.lineTo(cx, cy + 105);
    ctx.stroke();

    // Threat sweep blips
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(cx + 40, cy - 35, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('SECURITY OPS RADAR', 255, 45);

    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('● ZERO TRUST SHIELD: ACTIVE', 255, 80);
    ctx.fillText('● SAST/DAST SCAN: 0 DEFECTS', 255, 110);
    ctx.fillText('● DDOS FIREWALL: PROTECTED', 255, 140);
    ctx.fillText('● QA SUITE: 420/420 PASSED', 255, 170);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px monospace';
    ctx.fillText('Gatekeepers: SAMIRA & ELENA', 255, 215);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

function createGitTreeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 512, 256);

    ctx.fillStyle = '#4338ca';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('GIT FLOW BRANCHING TOPOLOGY', 25, 35);

    // Main Trunk Line (Green)
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(30, 90);
    ctx.lineTo(480, 90);
    ctx.stroke();

    // Feature Branch (Indigo)
    ctx.strokeStyle = '#6366f1';
    ctx.beginPath();
    ctx.moveTo(110, 90);
    ctx.quadraticCurveTo(150, 160, 240, 160);
    ctx.lineTo(340, 160);
    ctx.quadraticCurveTo(400, 160, 430, 90);
    ctx.stroke();

    // Commit Nodes
    const drawCommit = (x: number, y: number, color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    drawCommit(60, 90, '#059669');
    drawCommit(180, 90, '#059669');
    drawCommit(300, 90, '#059669');
    drawCommit(430, 90, '#059669');

    drawCommit(180, 160, '#6366f1');
    drawCommit(260, 160, '#6366f1');
    drawCommit(340, 160, '#6366f1');

    ctx.fillStyle = '#059669';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('main [v2.4.0-prod]', 30, 75);

    ctx.fillStyle = '#4f46e5';
    ctx.fillText('feat/agent-orchestrator', 180, 190);

    ctx.fillStyle = '#0f172a';
    ctx.font = '12px sans-serif';
    ctx.fillText('Engineers: SEAN (Backend) & DAVID (Frontend)', 25, 230);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

function createOscilloscopeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#062817';
    ctx.fillRect(0, 0, 256, 160);

    // Green grid lines
    ctx.strokeStyle = '#0f5132';
    ctx.lineWidth = 1;
    for (let x = 0; x < 256; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 160);
      ctx.stroke();
    }
    for (let y = 0; y < 160; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }

    // Sine wave
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = 0; x < 256; x++) {
      const y = 80 + Math.sin(x * 0.08) * 45;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.fillStyle = '#86efac';
    ctx.font = '10px monospace';
    ctx.fillText('DIAG: 60Hz 3.3V [OK]', 10, 20);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

function createDesignMoodboardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Corkboard background
    ctx.fillStyle = '#d97706';
    ctx.fillRect(0, 0, 512, 256);

    ctx.fillStyle = '#b45309';
    for (let i = 0; i < 400; i++) {
      ctx.fillRect(Math.random() * 512, Math.random() * 256, 2, 2);
    }

    // Color Swatches
    [
      { color: '#f43f5e', name: 'Primary Rose' },
      { color: '#3b82f6', name: 'Accent Blue' },
      { color: '#10b981', name: 'Success Mint' },
      { color: '#0f172a', name: 'Slate Dark' },
    ].forEach((sw, idx) => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(30 + idx * 115, 30, 95, 80);
      ctx.fillStyle = sw.color;
      ctx.fillRect(35 + idx * 115, 35, 85, 50);
      ctx.fillStyle = '#334155';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText(sw.name, 40 + idx * 115, 100);
    });

    // Wireframe Sketches
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(40, 130, 130, 100);
    ctx.strokeStyle = '#e2e8f0';
    ctx.strokeRect(50, 140, 110, 80);
    ctx.fillStyle = '#e11d48';
    ctx.fillRect(55, 145, 40, 10);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(55, 160, 100, 4);
    ctx.fillRect(55, 170, 80, 4);

    // Sticky Notes
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(200, 135, 100, 90);
    ctx.fillStyle = '#854d0e';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('User Journey:', 210, 155);
    ctx.font = '10px sans-serif';
    ctx.fillText('• 1-Click Launch', 210, 175);
    ctx.fillText('• Realtime DAG', 210, 195);
    ctx.fillText('• Instant Approval', 210, 215);

    ctx.fillStyle = '#a7f3d0';
    ctx.fillRect(330, 135, 140, 90);
    ctx.fillStyle = '#065f46';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('Design System v2', 340, 155);
    ctx.font = '10px sans-serif';
    ctx.fillText('Lead: MAYA LIN', 340, 180);
    ctx.fillText('Status: APPROVED [OK]', 340, 205);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

export const CatOffice3D: React.FC<CatOffice3DProps> = ({
  roles,
  activeAgentId,
  activePhase,
  isRunning,
  completedAgents = [],
  onTestFlow,
  onInspectAgent,
  isFullscreen = false,
  onToggleFullscreen,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedPig, setSelectedPig] = useState<DeskConfig | null>(null);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [customModelName, setCustomModelName] = useState<string | null>(null);
  const [showModelGuide, setShowModelGuide] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live refs for Three.js requestAnimationFrame loop to prevent stale closures
  const activeAgentIdRef = useRef<string | undefined>(activeAgentId);
  const completedAgentsRef = useRef<string[]>(completedAgents);
  activeAgentIdRef.current = activeAgentId;
  completedAgentsRef.current = completedAgents;

  // Sync DESK_CONFIGS with database-loaded roles
  useEffect(() => {
    roles.forEach((r) => {
      if (DESK_CONFIGS[r.id]) {
        DESK_CONFIGS[r.id].name = r.name;
        DESK_CONFIGS[r.id].title = r.title;
        DESK_CONFIGS[r.id].color = r.color;
        if (r.color) {
          const hex = parseInt(r.color.replace('#', '0x'));
          if (!isNaN(hex)) {
            DESK_CONFIGS[r.id].screenGlowColor = hex;
          }
        }
      }
    });
  }, [roles]);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const customTemplateRef = useRef<THREE.Group | null>(null);
  const stationGroupsRef = useRef<Record<string, { station: THREE.Group; config: DeskConfig }>>({});

  // Dynamic Server LED references for pulsing animation
  const serverLedMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  // Smooth Camera transition targets
  const targetCamPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 24, 27));
  const targetControlsLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.2, 0));
  const isTransitioningCam = useRef<boolean>(false);

  // References to animate in render loop
  const pigMeshesRef = useRef<
    Record<
      string,
      {
        pigGroup: THREE.Group;
        head: THREE.Group | THREE.Mesh;
        earL: THREE.Object3D;
        earR: THREE.Object3D;
        armL: THREE.Object3D;
        armR: THREE.Object3D;
        tail: THREE.Group;
        screenMesh: THREE.Mesh;
        haloMesh: THREE.Mesh;
      }
    >
  >({});

  // Courier Pig state & smart corridor waypoints
  const courierPigRef = useRef<{
    group: THREE.Group;
    body: THREE.Mesh;
    head: THREE.Group | THREE.Mesh;
    earL: THREE.Object3D;
    earR: THREE.Object3D;
    tail: THREE.Group;
    armL: THREE.Object3D;
    armR: THREE.Object3D;
    folder: THREE.Mesh;
    currentPos: THREE.Vector3;
    waypoints: THREE.Vector3[];
    isWalking: boolean;
  } | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera Setup
    const width = container.clientWidth || 900;
    const height = container.clientHeight || (isFullscreen ? window.innerHeight - 140 : 500);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9); // Clean corporate slate-white
    scene.fog = new THREE.FogExp2(0xf1f5f9, 0.009);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.5, 140);
    camera.position.set(0, 24, 27);
    cameraRef.current = camera;

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
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // 3. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.15;
    controls.minDistance = 6;
    controls.maxDistance = 65;
    controls.target.set(0, 1.2, 0);
    controlsRef.current = controls;

    // 4. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.05);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff7ed, 1.4);
    dirLight.position.set(18, 30, 22);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 80;
    dirLight.shadow.camera.left = -26;
    dirLight.shadow.camera.right = 26;
    dirLight.shadow.camera.top = 26;
    dirLight.shadow.camera.bottom = -26;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    const blueFill = new THREE.DirectionalLight(0xe0f2fe, 0.45);
    blueFill.position.set(-20, 16, -14);
    scene.add(blueFill);

    // 5. FOUNDATIONAL ARCHITECTURE: Floor Plating & Rooms
    const podiumGeo = new THREE.BoxGeometry(44.4, 0.4, 24.4);
    const podiumMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.8,
    });
    const podium = new THREE.Mesh(podiumGeo, podiumMat);
    podium.position.set(0, -0.2, 0);
    podium.receiveShadow = true;
    scene.add(podium);

    // Central Corridor Floor Runner
    const corridorGeo = new THREE.PlaneGeometry(42.2, 4.6);
    const corridorMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.35,
      metalness: 0.1,
    });
    const corridor = new THREE.Mesh(corridorGeo, corridorMat);
    corridor.rotation.x = -Math.PI / 2;
    corridor.position.set(0, 0.01, 0);
    corridor.receiveShadow = true;
    scene.add(corridor);

    // Corridor Runner Rug
    const rug = new THREE.Mesh(
      new THREE.PlaneGeometry(41.0, 3.2),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 })
    );
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0, 0.012, 0);
    scene.add(rug);

    // Subtle guide line along corridor center
    const guideStrip = new THREE.Mesh(
      new THREE.PlaneGeometry(41.0, 0.12),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    guideStrip.rotation.x = -Math.PI / 2;
    guideStrip.position.set(0, 0.016, 0);
    scene.add(guideStrip);

    // Distinct flooring for all 6 Department Rooms
    Object.values(DEPARTMENTS).forEach((dept) => {
      const roomFloorGeo = new THREE.PlaneGeometry(13.7, 8.4);
      const roomFloorMat = new THREE.MeshStandardMaterial({
        color: dept.floorColor,
        roughness: 0.6,
      });
      const roomFloor = new THREE.Mesh(roomFloorGeo, roomFloorMat);
      roomFloor.rotation.x = -Math.PI / 2;
      roomFloor.position.set(dept.xCenter, 0.01, dept.zCenter);
      roomFloor.receiveShadow = true;
      scene.add(roomFloor);
    });

    // 6. EXTERIOR & PARTITION WALLS ARCHITECTURE
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.85,
    });
    const baseboardMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.5,
    });

    const buildWall = (
      x: number,
      y: number,
      z: number,
      w: number,
      h: number,
      d: number
    ) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
      wall.position.set(x, y, z);
      wall.castShadow = true;
      wall.receiveShadow = true;
      scene.add(wall);

      const bbHeight = 0.18;
      const baseboard = new THREE.Mesh(
        new THREE.BoxGeometry(w + 0.02, bbHeight, d + 0.02),
        baseboardMat
      );
      baseboard.position.set(x, bbHeight / 2, z);
      scene.add(baseboard);

      return wall;
    };

    // North Wall (Solid)
    buildWall(0, 1.6, -11.15, 42.6, 3.2, 0.3);

    // South Sill Half-Wall (Open view for camera)
    buildWall(0, 0.35, 11.15, 42.6, 0.7, 0.3);

    // West Wall
    buildWall(-21.15, 1.6, 0, 0.3, 3.2, 22.3);

    // East Wall
    buildWall(21.15, 1.6, 0, 0.3, 3.2, 22.3);

    // Interior Dividers
    buildWall(-7.0, 1.4, -6.7, 0.25, 2.8, 8.5);
    buildWall(7.0, 1.4, -6.7, 0.25, 2.8, 8.5);
    buildWall(-7.0, 1.4, 6.7, 0.25, 2.8, 8.5);
    buildWall(7.0, 1.4, 6.7, 0.25, 2.8, 8.5);

    // 7. CORRIDOR FROSTED GLASS PARTITIONS & CLEAR DOOR OPENINGS
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      transmission: 0.68,
      roughness: 0.2,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    const aluminumMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.7,
      roughness: 0.3,
    });

    const buildGlassPanel = (
      x: number,
      z: number,
      width: number,
      height: number
    ) => {
      const panelGroup = new THREE.Group();
      panelGroup.position.set(x, height / 2, z);

      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, 0.06),
        glassMat
      );
      glass.castShadow = false;
      glass.receiveShadow = true;
      panelGroup.add(glass);

      const frameThick = 0.08;
      const topFrame = new THREE.Mesh(
        new THREE.BoxGeometry(width, frameThick, 0.1),
        aluminumMat
      );
      topFrame.position.y = height / 2 - frameThick / 2;
      panelGroup.add(topFrame);

      const botFrame = new THREE.Mesh(
        new THREE.BoxGeometry(width, frameThick, 0.1),
        aluminumMat
      );
      botFrame.position.y = -height / 2 + frameThick / 2;
      panelGroup.add(botFrame);

      [-width / 2 + frameThick / 2, width / 2 - frameThick / 2].forEach(
        (fx) => {
          const sideFrame = new THREE.Mesh(
            new THREE.BoxGeometry(frameThick, height, 0.1),
            aluminumMat
          );
          sideFrame.position.x = fx;
          panelGroup.add(sideFrame);
        }
      );

      scene.add(panelGroup);
    };

    const buildDoorwayWithSign = (dept: DepartmentInfo, isNorth: boolean) => {
      const zDoor = dept.doorZ;
      const xDoor = dept.doorX;
      const doorWidth = 2.6; // Clear open doorway width
      const doorHeight = 2.4;

      // Flanking glass walls
      const flankWidth = (13.8 - doorWidth) / 2;
      const leftX = xDoor - doorWidth / 2 - flankWidth / 2;
      const rightX = xDoor + doorWidth / 2 + flankWidth / 2;

      buildGlassPanel(leftX, zDoor, flankWidth, doorHeight);
      buildGlassPanel(rightX, zDoor, flankWidth, doorHeight);

      // Portal Frame
      const portal = new THREE.Group();
      portal.position.set(xDoor, 0, zDoor);

      const postL = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, doorHeight + 0.4, 0.22),
        aluminumMat
      );
      postL.position.set(-doorWidth / 2 - 0.06, (doorHeight + 0.4) / 2, 0);
      portal.add(postL);

      const postR = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, doorHeight + 0.4, 0.22),
        aluminumMat
      );
      postR.position.set(doorWidth / 2 + 0.06, (doorHeight + 0.4) / 2, 0);
      portal.add(postR);

      const lintel = new THREE.Mesh(
        new THREE.BoxGeometry(doorWidth + 0.24, 0.14, 0.22),
        aluminumMat
      );
      lintel.position.set(0, doorHeight + 0.07, 0);
      portal.add(lintel);

      // Illuminated Signboard
      const signTex = createDepartmentSignboardTexture(
        dept.code,
        dept.titleEn,
        dept.titleTh,
        dept.color
      );
      const signMat = new THREE.MeshStandardMaterial({
        map: signTex,
        roughness: 0.2,
        metalness: 0.1,
        emissive: new THREE.Color(dept.colorHex),
        emissiveIntensity: 0.25,
      });

      const signBoard = new THREE.Mesh(
        new THREE.BoxGeometry(2.3, 0.65, 0.1),
        signMat
      );
      signBoard.position.set(0, doorHeight + 0.45, isNorth ? 0.06 : -0.06);
      if (!isNorth) {
        signBoard.rotation.y = Math.PI;
      }
      portal.add(signBoard);

      const doorSpot = new THREE.PointLight(dept.colorHex, 0.8, 4.5);
      doorSpot.position.set(0, doorHeight + 0.5, isNorth ? 0.8 : -0.8);
      portal.add(doorSpot);

      scene.add(portal);
    };

    buildDoorwayWithSign(DEPARTMENTS.exec, true);
    buildDoorwayWithSign(DEPARTMENTS.arch, true);
    buildDoorwayWithSign(DEPARTMENTS.sec, true);
    buildDoorwayWithSign(DEPARTMENTS.design, false);
    buildDoorwayWithSign(DEPARTMENTS.dev, false);
    buildDoorwayWithSign(DEPARTMENTS.ops, false);

    // 8. RICH REALISTIC ROOM-BY-ROOM PROPS & DECOR

    // (A) ROOM 1: EXECUTIVE & PRODUCT SUITE
    // Roadmap Whiteboard
    const execWb = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 1.8),
      new THREE.MeshBasicMaterial({ map: createExecutiveRoadmapTexture() })
    );
    execWb.position.set(-14.0, 1.8, -10.95);
    scene.add(execWb);

    // Executive Round Conference Table in corner
    const confTableGroup = new THREE.Group();
    confTableGroup.position.set(-18.5, 0, -9.8);
    const tableTop = new THREE.Mesh(
      new THREE.CylinderGeometry(1.15, 1.15, 0.08, 32),
      new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.35 })
    );
    tableTop.position.y = 0.95;
    tableTop.castShadow = true;
    confTableGroup.add(tableTop);

    const tableLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.38, 0.95, 20),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.25 })
    );
    tableLeg.position.y = 0.475;
    confTableGroup.add(tableLeg);

    // Polycom conference puck
    const puck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.18, 0.04, 16),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 })
    );
    puck.position.y = 1.01;
    confTableGroup.add(puck);

    // 4 Sculpted Leather Conference Chairs around table
    const confChairMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.55 });
    const confChromeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.2 });
    for (let c = 0; c < 4; c++) {
      const angle = (c / 4) * Math.PI * 2 + Math.PI / 4;
      const cGroup = new THREE.Group();
      cGroup.position.set(Math.cos(angle) * 1.55, 0, Math.sin(angle) * 1.55);
      cGroup.rotation.y = -angle - Math.PI / 2;

      const cBase = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.04, 16), confChromeMat);
      cBase.position.y = 0.02;
      cGroup.add(cBase);

      const cStem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.48, 12), confChromeMat);
      cStem.position.y = 0.26;
      cGroup.add(cStem);

      const cSeat = new THREE.Mesh(new RoundedBoxGeometry(0.52, 0.09, 0.50, 4, 0.03), confChairMat);
      cSeat.position.y = 0.52;
      cSeat.castShadow = true;
      cGroup.add(cSeat);

      const cBack = new THREE.Mesh(new RoundedBoxGeometry(0.50, 0.48, 0.08, 4, 0.03), confChairMat);
      cBack.position.set(0, 0.78, -0.22);
      cBack.rotation.x = -0.1;
      cBack.castShadow = true;
      cGroup.add(cBack);

      confTableGroup.add(cGroup);
    }
    scene.add(confTableGroup);

    // Executive Tufted Leather Lounge Sofa
    const sofaGroup = new THREE.Group();
    sofaGroup.position.set(-9.5, 0, -9.8);
    const leatherMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.45 });
    const sofaBase = new THREE.Mesh(new RoundedBoxGeometry(2.2, 0.28, 0.92, 4, 0.06), leatherMat);
    sofaBase.position.y = 0.24;
    sofaBase.castShadow = true;
    sofaGroup.add(sofaBase);

    [-0.52, 0.52].forEach((cx) => {
      const cushion = new THREE.Mesh(new RoundedBoxGeometry(0.96, 0.16, 0.78, 4, 0.05), leatherMat);
      cushion.position.set(cx, 0.42, 0.04);
      sofaGroup.add(cushion);
    });

    const sofaBack = new THREE.Mesh(new RoundedBoxGeometry(2.2, 0.58, 0.24, 4, 0.08), leatherMat);
    sofaBack.position.set(0, 0.64, -0.34);
    sofaBack.rotation.x = -0.08;
    sofaBack.castShadow = true;
    sofaGroup.add(sofaBack);

    [-1.02, 1.02].forEach((ax) => {
      const arm = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.46, 0.92, 4, 0.07), leatherMat);
      arm.position.set(ax, 0.48, 0);
      sofaGroup.add(arm);
    });
    scene.add(sofaGroup);

    // (B) ROOM 2: ARCHITECTURE & DATA LAB
    // NOC Video Wall Telemetry Display
    const nocScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 1.8),
      new THREE.MeshBasicMaterial({ map: createNocTelemetryTexture() })
    );
    nocScreen.position.set(0.0, 1.8, -10.95);
    scene.add(nocScreen);

    // Twin 42U Server Racks
    const serverMats: THREE.MeshStandardMaterial[] = [];
    [-2.2, 2.2].forEach((rx) => {
      const rackGroup = new THREE.Group();
      rackGroup.position.set(rx, 1.4, -9.8);

      const chassis = new THREE.Mesh(
        new RoundedBoxGeometry(1.4, 2.7, 0.9, 4, 0.04),
        new THREE.MeshStandardMaterial({
          color: 0x0f172a,
          roughness: 0.3,
          metalness: 0.8,
        })
      );
      chassis.castShadow = true;
      rackGroup.add(chassis);

      const door = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 2.55, 0.05),
        new THREE.MeshPhysicalMaterial({
          color: 0x38bdf8,
          transmission: 0.6,
          roughness: 0.1,
          transparent: true,
          opacity: 0.4,
        })
      );
      door.position.z = 0.46;
      rackGroup.add(door);

      for (let b = 0; b < 6; b++) {
        const bladeY = -1.0 + b * 0.4;
        const blade = new THREE.Mesh(
          new THREE.BoxGeometry(1.2, 0.3, 0.7),
          new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 })
        );
        blade.position.set(0, bladeY, 0.05);
        rackGroup.add(blade);

        const ledMat = new THREE.MeshStandardMaterial({
          color: b % 2 === 0 ? 0x22c55e : 0x0284c7,
          emissive: b % 2 === 0 ? 0x22c55e : 0x0284c7,
          emissiveIntensity: 0.9,
          roughness: 0.2,
        });
        serverMats.push(ledMat);

        [-0.45, -0.35, -0.25].forEach((lx) => {
          const led = new THREE.Mesh(
            new THREE.SphereGeometry(0.025, 8, 8),
            ledMat
          );
          led.position.set(lx, bladeY, 0.42);
          rackGroup.add(led);
        });
      }

      scene.add(rackGroup);
    });
    serverLedMaterialsRef.current = serverMats;

    // Server UPS Backup Unit
    const ups = new THREE.Mesh(
      new RoundedBoxGeometry(0.65, 0.85, 0.65, 4, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })
    );
    ups.position.set(-4.0, 0.425, -9.8);
    scene.add(ups);

    // (C) ROOM 3: SECURITY & QA FORTRESS
    // Threat Operations Radar Wall
    const radarScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 1.8),
      new THREE.MeshBasicMaterial({ map: createSecurityRadarTexture() })
    );
    radarScreen.position.set(14.0, 1.8, -10.95);
    scene.add(radarScreen);

    // Heavy Metal Filing Cabinets with Drawer Handles
    [-1.0, 0.0, 1.0].forEach((fx) => {
      const cabGroup = new THREE.Group();
      cabGroup.position.set(14.0 + fx * 1.1, 0, -9.8);
      const cab = new THREE.Mesh(
        new RoundedBoxGeometry(0.85, 1.4, 0.65, 4, 0.03),
        new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.35 })
      );
      cab.position.y = 0.7;
      cab.castShadow = true;
      cabGroup.add(cab);

      [0.35, 0.75, 1.15].forEach((dy) => {
        const handle = new THREE.Mesh(
          new RoundedBoxGeometry(0.24, 0.03, 0.04, 2, 0.01),
          new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 })
        );
        handle.position.set(0, dy, 0.34);
        cabGroup.add(handle);
      });
      scene.add(cabGroup);
    });

    // Mobile Device Testing Farm Bench
    const testFarm = new THREE.Mesh(
      new RoundedBoxGeometry(1.8, 0.9, 0.7, 4, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.4 })
    );
    testFarm.position.set(19.0, 0.45, -6.7);
    scene.add(testFarm);

    // (D) ROOM 4: CREATIVE UI/UX STUDIO
    // Moodboard & Wireframe Pin Wall
    const moodboard = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 1.8),
      new THREE.MeshBasicMaterial({ map: createDesignMoodboardTexture() })
    );
    moodboard.position.set(-20.95, 1.8, 6.7);
    moodboard.rotation.y = Math.PI / 2;
    scene.add(moodboard);

    // Designer A-Frame Wooden Drafting Easel with Canvas
    const easelGroup = new THREE.Group();
    easelGroup.position.set(-18.5, 0, 9.6);
    easelGroup.rotation.y = 2.6;
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.55 });
    [-0.36, 0.36].forEach((lx) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.85, 8), woodMat);
      leg.position.set(lx, 0.9, 0);
      leg.rotation.z = lx < 0 ? -0.1 : 0.1;
      leg.rotation.x = -0.12;
      easelGroup.add(leg);
    });
    const backStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.8, 8), woodMat);
    backStrut.position.set(0, 0.85, -0.35);
    backStrut.rotation.x = 0.25;
    easelGroup.add(backStrut);

    const canvasBoard = new THREE.Mesh(
      new RoundedBoxGeometry(0.95, 1.15, 0.06, 4, 0.02),
      new THREE.MeshStandardMaterial({ color: 0xfffbeb, roughness: 0.4 })
    );
    canvasBoard.position.set(0, 1.18, 0.08);
    canvasBoard.rotation.x = -0.12;
    canvasBoard.castShadow = true;
    easelGroup.add(canvasBoard);
    scene.add(easelGroup);

    // Cozy Sculpted Pastel Armchair
    const armchairGroup = new THREE.Group();
    armchairGroup.position.set(-9.5, 0, 9.8);
    armchairGroup.rotation.y = Math.PI;
    const plushRoseMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.65 });
    const armSeat = new THREE.Mesh(new RoundedBoxGeometry(1.05, 0.34, 0.95, 4, 0.08), plushRoseMat);
    armSeat.position.y = 0.28;
    armSeat.castShadow = true;
    armchairGroup.add(armSeat);

    const armBack = new THREE.Mesh(new RoundedBoxGeometry(1.02, 0.58, 0.26, 4, 0.09), plushRoseMat);
    armBack.position.set(0, 0.65, -0.34);
    armBack.rotation.x = -0.1;
    armchairGroup.add(armBack);

    [-0.46, 0.46].forEach((ax) => {
      const armRest = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.45, 0.92, 4, 0.08), plushRoseMat);
      armRest.position.set(ax, 0.46, 0);
      armchairGroup.add(armRest);
    });
    scene.add(armchairGroup);

    // Client Approval Gate Pedestal
    const gateGroup = new THREE.Group();
    gateGroup.position.set(-11.5, 0, 6.7);

    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.1,
    });
    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.75, 0.95, 0.7, 24),
      pedestalMat
    );
    pedestal.position.y = 0.35;
    pedestal.castShadow = true;
    gateGroup.add(pedestal);

    const gateCrystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.38, 0),
      new THREE.MeshStandardMaterial({
        color: 0xf43f5e,
        roughness: 0.1,
        metalness: 0.8,
        emissive: 0x9f1239,
        emissiveIntensity: 0.6,
      })
    );
    gateCrystal.position.y = 1.15;
    gateGroup.add(gateCrystal);

    const gateHalo = new THREE.Mesh(
      new THREE.RingGeometry(1.15, 1.3, 32),
      new THREE.MeshBasicMaterial({ color: 0xf43f5e, side: THREE.DoubleSide })
    );
    gateHalo.rotation.x = -Math.PI / 2;
    gateHalo.position.y = 0.02;
    gateGroup.add(gateHalo);

    scene.add(gateGroup);

    // (E) ROOM 5: SOFTWARE ENGINEERING LAB
    // Git Flow Branching Whiteboard
    const gitWb = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 1.8),
      new THREE.MeshBasicMaterial({ map: createGitTreeTexture() })
    );
    gitWb.position.set(-6.85, 1.8, 6.7);
    gitWb.rotation.y = Math.PI / 2;
    scene.add(gitWb);

    // Developer Espresso Bar & Snack Counter
    const coffeeCredenza = new THREE.Mesh(
      new RoundedBoxGeometry(1.8, 1.0, 0.8, 4, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 })
    );
    coffeeCredenza.position.set(-6.0, 0.5, 9.8);
    coffeeCredenza.castShadow = true;
    scene.add(coffeeCredenza);

    const espressoMachine = new THREE.Mesh(
      new RoundedBoxGeometry(0.65, 0.52, 0.45, 4, 0.04),
      new THREE.MeshStandardMaterial({
        color: 0x64748b,
        metalness: 0.85,
        roughness: 0.2,
      })
    );
    espressoMachine.position.set(-6.0, 1.26, 9.8);
    scene.add(espressoMachine);

    // Bean Bag Chillout Pod
    const beanbag = new THREE.Mesh(
      new THREE.SphereGeometry(0.65, 24, 24),
      new THREE.MeshStandardMaterial({ color: 0x4f46e5, roughness: 0.85 })
    );
    beanbag.scale.set(1.25, 0.58, 1.25);
    beanbag.position.set(6.0, 0.34, 9.8);
    beanbag.castShadow = true;
    scene.add(beanbag);

    // (F) ROOM 6: OPERATIONS & MAINTENANCE BAY
    // Heavy Industrial Workbench
    const benchGroup = new THREE.Group();
    benchGroup.position.set(14.0, 0, 9.8);

    const benchTop = new THREE.Mesh(
      new RoundedBoxGeometry(3.2, 0.14, 1.4, 4, 0.03),
      new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.5 })
    );
    benchTop.position.set(0, 1.05, 0);
    benchTop.castShadow = true;
    benchGroup.add(benchTop);

    // Steel Legs
    const steelLegMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
      roughness: 0.3,
    });
    [
      [-1.45, -0.55],
      [1.45, -0.55],
      [-1.45, 0.55],
      [1.45, 0.55],
    ].forEach(([bx, bz]) => {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 1.0, 0.1),
        steelLegMat
      );
      leg.position.set(bx, 0.5, bz);
      benchGroup.add(leg);
    });

    // Tool Pegboard
    const pegboard = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 1.1, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5 })
    );
    pegboard.position.set(0, 1.7, 0.65);
    benchGroup.add(pegboard);

    // Mounted Tools on Pegboard
    const toolMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.9,
      roughness: 0.1,
    });
    [-0.8, -0.4, 0.1, 0.6].forEach((tx, i) => {
      const tool = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.4 + i * 0.08, 0.04),
        toolMat
      );
      tool.position.set(tx, 1.7, 0.7);
      benchGroup.add(tool);
    });

    // Diagnostic Oscilloscope
    const oscScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 0.45),
      new THREE.MeshBasicMaterial({ map: createOscilloscopeTexture() })
    );
    oscScreen.position.set(0.85, 1.35, 0.1);
    benchGroup.add(oscScreen);

    // Mechanic Red Toolbox
    const toolbox = new THREE.Mesh(
      new RoundedBoxGeometry(0.65, 0.35, 0.4, 4, 0.03),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.6 })
    );
    toolbox.position.set(-0.85, 1.25, 0);
    benchGroup.add(toolbox);

    scene.add(benchGroup);

    // Rolling Mechanic Tool Cabinet
    const toolCabinet = new THREE.Mesh(
      new RoundedBoxGeometry(1.2, 1.1, 0.7, 4, 0.04),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.7 })
    );
    toolCabinet.position.set(19.2, 0.55, 9.8);
    scene.add(toolCabinet);

    // Safety Traffic Cones
    const buildSafetyCone = (cx: number, cz: number) => {
      const coneGroup = new THREE.Group();
      coneGroup.position.set(cx, 0, cz);

      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.24, 0.65, 16),
        new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4 })
      );
      cone.position.y = 0.325;
      coneGroup.add(cone);

      const stripe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.17, 0.12, 16),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
      );
      stripe.position.y = 0.3;
      coneGroup.add(stripe);

      const base = new THREE.Mesh(
        new RoundedBoxGeometry(0.5, 0.05, 0.5, 3, 0.015),
        new THREE.MeshStandardMaterial({ color: 0x1e293b })
      );
      base.position.y = 0.025;
      coneGroup.add(base);

      scene.add(coneGroup);
    };
    buildSafetyCone(8.5, 4.5);
    buildSafetyCone(19.2, 8.5);

    // (G) CENTRAL CORRIDOR PROPS
    // Water Cooler Station
    const waterCooler = new THREE.Group();
    waterCooler.position.set(-6.5, 0, 0);

    const coolerBase = new THREE.Mesh(
      new RoundedBoxGeometry(0.46, 1.0, 0.46, 4, 0.05),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 })
    );
    coolerBase.position.y = 0.5;
    waterCooler.add(coolerBase);

    const waterBottle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.21, 0.21, 0.55, 20),
      new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        transmission: 0.82,
        roughness: 0.08,
        transparent: true,
        opacity: 0.65,
      })
    );
    waterBottle.position.y = 1.26;
    waterCooler.add(waterBottle);
    scene.add(waterCooler);

    // Directional Totem Signpost
    const totem = new THREE.Group();
    totem.position.set(6.5, 0, 0);
    const totemPillar = new THREE.Mesh(
      new RoundedBoxGeometry(0.16, 1.4, 0.16, 3, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 })
    );
    totemPillar.position.y = 0.7;
    totem.add(totemPillar);
    const totemBoard = new THREE.Mesh(
      new RoundedBoxGeometry(0.72, 0.46, 0.08, 3, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5 })
    );
    totemBoard.position.y = 1.2;
    totem.add(totemBoard);
    scene.add(totem);

    // Lush Potted Monstera / Fiddle-Leaf Plants
    const buildPottedPlant = (px: number, pz: number, scale: number = 1.0) => {
      const plantGroup = new THREE.Group();
      plantGroup.position.set(px, 0, pz);
      plantGroup.scale.set(scale, scale, scale);

      const pot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.36, 0.26, 0.62, 20),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25 })
      );
      pot.position.y = 0.31;
      pot.castShadow = true;
      plantGroup.add(pot);

      const potRim = new THREE.Mesh(
        new THREE.TorusGeometry(0.35, 0.028, 10, 24),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 })
      );
      potRim.rotation.x = Math.PI / 2;
      potRim.position.y = 0.61;
      plantGroup.add(potRim);

      const soil = new THREE.Mesh(
        new THREE.CylinderGeometry(0.33, 0.33, 0.05, 16),
        new THREE.MeshStandardMaterial({ color: 0x3f2e1e, roughness: 0.9 })
      );
      soil.position.y = 0.60;
      plantGroup.add(soil);

      const leafMatDark = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.38 });
      const leafMatLight = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.42 });
      for (let l = 0; l < 10; l++) {
        const angle = (l / 10) * Math.PI * 2;
        const tier = l % 2;
        const stem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.015, 0.02, 0.45, 6),
          leafMatDark
        );
        stem.position.set(Math.cos(angle) * 0.1, 0.78 + tier * 0.12, Math.sin(angle) * 0.1);
        stem.rotation.x = Math.sin(angle) * 0.35;
        stem.rotation.z = -Math.cos(angle) * 0.35;
        plantGroup.add(stem);

        const leaf = new THREE.Mesh(
          new THREE.SphereGeometry(0.24, 12, 12),
          tier === 0 ? leafMatDark : leafMatLight
        );
        leaf.scale.set(0.65, 0.14, 1.15);
        leaf.position.set(
          Math.cos(angle) * (0.24 + tier * 0.06),
          0.95 + tier * 0.18,
          Math.sin(angle) * (0.24 + tier * 0.06)
        );
        leaf.rotation.y = -angle + Math.PI / 2;
        leaf.rotation.x = 0.35;
        leaf.castShadow = true;
        plantGroup.add(leaf);
      }

      scene.add(plantGroup);
    };

    buildPottedPlant(-20.0, 0, 1.2);
    buildPottedPlant(20.0, 0, 1.2);
    buildPottedPlant(-19.5, -9.8, 1.1);
    buildPottedPlant(-19.5, 9.8, 1.1);

    // 9. SEAMLESS SCULPTED LULU THE PIGGY BUILDER (Authentic TOYZEROPLUS Flocked Vinyl Aesthetic)
    const sharedTorsoGeo = createSculptedTorsoGeometry();
    const sharedHeadGeo = createSculptedHeadGeometry();
    const sharedEarLGeo = createSculptedEarGeometry(true);
    const sharedEarRGeo = createSculptedEarGeometry(false);
    const sharedBodyTex = createPigBodyTexture();
    const sharedBlushTex = createAirbrushedBlushTexture();
    const sharedSpamTex = createSpamCanTexture();

    const createLuluPig = (accessory: string, roleColor: number) => {
      const pigGroup = new THREE.Group();

      // Flocked Velvet Skin & Material Suite (Designer Vinyl Collectible Aesthetic)
      const skinMat = new THREE.MeshPhysicalMaterial({
        color: 0xffdbe4, // Soft baby blossom peach pink
        roughness: 0.72, // Flocked velvet matte finish
        metalness: 0.0,
        sheen: 1.35,
        sheenColor: 0xffb3c6, // Velvet peach-pink rim glow
        sheenRoughness: 0.42,
        clearcoat: 0.05,
        clearcoatRoughness: 0.28,
      });

      const bodySkinMat = new THREE.MeshPhysicalMaterial({
        map: sharedBodyTex,
        roughness: 0.72,
        metalness: 0.0,
        sheen: 1.35,
        sheenColor: 0xffb3c6,
        sheenRoughness: 0.42,
        clearcoat: 0.05,
        clearcoatRoughness: 0.28,
      });

      // Iconic LuLu Honey-Apricot Yellow Snout Button
      const snoutMat = new THREE.MeshPhysicalMaterial({
        color: 0xf5a536, // Warm honey apricot yellow
        roughness: 0.45,
        metalness: 0.0,
        sheen: 0.85,
        sheenColor: 0xfde047,
        sheenRoughness: 0.3,
        clearcoat: 0.18,
      });

      const innerEarMat = new THREE.MeshPhysicalMaterial({
        color: 0xf9a8d4, // Soft rosy petal pink inner ear
        roughness: 0.68,
        sheen: 0.75,
        sheenColor: 0xffccd5,
      });

      const bobaEyeMat = new THREE.MeshPhysicalMaterial({
        color: 0x090d16, // Pure glossy obsidian black
        roughness: 0.03,
        metalness: 0.05,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
      });

      const hoofPadMat = new THREE.MeshPhysicalMaterial({
        color: 0xf472b6,
        roughness: 0.55,
        sheen: 0.6,
      });

      // 1. Single-Mesh Seamless Pear/Mochi Torso (Zero intersecting sphere seams!)
      const bodyMesh = new THREE.Mesh(sharedTorsoGeo, bodySkinMat);
      bodyMesh.position.set(0, 0.54, 0.01);
      bodyMesh.castShadow = true;
      bodyMesh.receiveShadow = true;
      pigGroup.add(bodyMesh);

      // 2. Tailored Role Collar / Neckband (Bridges neck seamlessly with character style)
      const collarMat = new THREE.MeshStandardMaterial({
        color: roleColor,
        roughness: 0.45,
      });
      const collar = new THREE.Mesh(
        new THREE.TorusGeometry(0.34, 0.042, 12, 28),
        collarMat
      );
      collar.rotation.x = Math.PI / 2 + 0.08;
      collar.position.set(0, 0.88, 0.02);
      pigGroup.add(collar);

      // 3. Seated Chubby Legs & Cleft Trotter Hooves
      const legGeo = new THREE.CapsuleGeometry(0.135, 0.14, 12, 16);
      [-0.26, 0.26].forEach((fx) => {
        const foot = new THREE.Group();
        foot.position.set(fx, 0.14, 0.36);

        const footMesh = new THREE.Mesh(legGeo, skinMat);
        footMesh.rotation.x = Math.PI / 2 - 0.12;
        footMesh.scale.set(1.05, 1.0, 0.82);
        footMesh.castShadow = true;
        foot.add(footMesh);

        // Sculpted Cleft Hoof Tip & Rosy Sole Pad
        const cleft = new THREE.Mesh(
          new RoundedBoxGeometry(0.016, 0.055, 0.07, 2, 0.005),
          new THREE.MeshBasicMaterial({ color: 0xbe185d })
        );
        cleft.position.set(0, -0.005, 0.19);
        foot.add(cleft);

        const pad = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), hoofPadMat);
        pad.scale.set(1.0, 0.22, 1.25);
        pad.position.set(0, -0.065, 0.05);
        foot.add(pad);

        pigGroup.add(foot);
      });

      // 4. Seamless Capsule Arms & Cute Trotter Hands
      const armCapsuleGeo = new THREE.CapsuleGeometry(0.115, 0.18, 12, 16);

      const buildArm = (isLeft: boolean) => {
        const arm = new THREE.Group();
        const sign = isLeft ? -1 : 1;
        arm.position.set(sign * 0.41, 0.65, 0.22);
        arm.rotation.set(0.62, 0, sign * -0.36);

        const armMesh = new THREE.Mesh(armCapsuleGeo, skinMat);
        armMesh.castShadow = true;
        arm.add(armMesh);

        const pawPad = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), hoofPadMat);
        pawPad.scale.set(1.0, 0.4, 0.8);
        pawPad.position.set(0, 0.16, 0.04);
        arm.add(pawPad);

        const cleft = new THREE.Mesh(
          new RoundedBoxGeometry(0.014, 0.05, 0.045, 2, 0.004),
          new THREE.MeshBasicMaterial({ color: 0xbe185d })
        );
        cleft.position.set(0, 0.175, 0.045);
        arm.add(cleft);

        return arm;
      };

      const armL = buildArm(true);
      const armR = buildArm(false);
      pigGroup.add(armL);
      pigGroup.add(armR);

      // 5. 3D Corkscrew Curly Spiral Tail
      const tailGroup = new THREE.Group();
      tailGroup.position.set(0, 0.36, -0.55);
      const corkscrewPath = new CorkscrewCurve(1.0);
      const tailGeo = new THREE.TubeGeometry(corkscrewPath, 28, 0.032, 10, false);
      const tailMesh = new THREE.Mesh(tailGeo, skinMat);
      tailMesh.castShadow = true;
      tailGroup.add(tailMesh);
      pigGroup.add(tailGroup);

      // 6. Single-Mesh Sculpted Chubby Mochi Head (y = 1.10 - Zero cheek intersection seams!)
      const head = new THREE.Group();
      head.position.set(0, 1.10, 0);

      const headMesh = new THREE.Mesh(sharedHeadGeo, skinMat);
      headMesh.castShadow = true;
      headMesh.receiveShadow = true;
      head.add(headMesh);

      // 7. Iconic Honey-Apricot Button Snout with Recessed Nostril Cavities
      const snoutGroup = new THREE.Group();
      snoutGroup.position.set(0, -0.045, 0.475);

      const snoutGeo = new THREE.SphereGeometry(0.165, 28, 24);
      snoutGeo.scale(1.36, 0.88, 0.48);
      const snout = new THREE.Mesh(snoutGeo, snoutMat);
      snout.castShadow = true;
      snoutGroup.add(snout);

      const nostrilRimMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });
      const nostrilHoleMat = new THREE.MeshBasicMaterial({ color: 0x78350f });
      [-0.068, 0.068].forEach((nx) => {
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.006, 8, 16), nostrilRimMat);
        rim.scale.set(0.85, 1.22, 0.5);
        rim.position.set(nx, 0.004, 0.072);
        rim.rotation.z = nx < 0 ? 0.1 : -0.1;
        snoutGroup.add(rim);

        const nostril = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 12), nostrilHoleMat);
        nostril.scale.set(0.82, 1.2, 0.35);
        nostril.position.set(nx, 0.004, 0.074);
        nostril.rotation.z = nx < 0 ? 0.1 : -0.1;
        snoutGroup.add(nostril);
      });

      // Delicate Cute Smile Curve tucked beneath the snout
      const mouthArc = new THREE.Mesh(
        new THREE.TorusGeometry(0.042, 0.007, 8, 16, Math.PI),
        new THREE.MeshBasicMaterial({ color: 0xbe185d })
      );
      mouthArc.rotation.z = Math.PI;
      mouthArc.rotation.x = -0.15;
      mouthArc.position.set(0, -0.125, 0.035);
      snoutGroup.add(mouthArc);

      head.add(snoutGroup);

      // 8. Soulful Glossy Boba Eyes with Upper Eyelid Fold & Dual Catchlights
      const shineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const eyelidMat = new THREE.MeshBasicMaterial({ color: 0x9f1239 });
      [-0.22, 0.22].forEach((ex) => {
        const isLeft = ex < 0;
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.046, 20, 20), bobaEyeMat);
        eye.scale.set(1.0, 1.08, 0.75);
        eye.position.set(ex, 0.058, 0.455);
        head.add(eye);

        // Primary upper-inner studio catchlight
        const shineMain = new THREE.Mesh(new THREE.SphereGeometry(0.013, 10, 10), shineMat);
        shineMain.position.set(ex + (isLeft ? 0.012 : -0.012), 0.076, 0.488);
        head.add(shineMain);

        // Secondary lower-outer pinpoint sparkle
        const shineSub = new THREE.Mesh(new THREE.SphereGeometry(0.006, 8, 8), shineMat);
        shineSub.position.set(ex + (isLeft ? -0.014 : 0.014), 0.042, 0.486);
        head.add(shineSub);

        // Soft upper eyelid/eyelash crease for expressive kawaii look
        const lid = new THREE.Mesh(
          new THREE.TorusGeometry(0.048, 0.0055, 8, 16, Math.PI * 0.85),
          eyelidMat
        );
        lid.position.set(ex, 0.062, 0.458);
        lid.rotation.z = Math.PI * 0.075 + (isLeft ? 0.08 : -0.08);
        head.add(lid);
      });

      // 9. Airbrushed Radial Gradient Cheek Blush (Seamless soft fade, no sticker edges!)
      const blushMat = new THREE.MeshBasicMaterial({
        map: sharedBlushTex,
        transparent: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
      });
      [-0.33, 0.33].forEach((bx) => {
        const blush = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.17), blushMat);
        blush.position.set(bx, -0.075, 0.435);
        blush.rotation.y = bx < 0 ? -0.42 : 0.42;
        blush.rotation.x = 0.08;
        head.add(blush);
      });

      // 10. Organically Curved & Folded LuLu Petal Ears
      const earL = new THREE.Group();
      const earLOuter = new THREE.Mesh(sharedEarLGeo, skinMat);
      earLOuter.castShadow = true;
      earL.add(earLOuter);
      const earLInner = new THREE.Mesh(sharedEarLGeo, innerEarMat);
      earLInner.scale.set(0.74, 0.78, 0.55);
      earLInner.position.set(0.01, -0.01, 0.032);
      earL.add(earLInner);
      earL.position.set(-0.35, 0.34, 0.04);
      earL.rotation.set(0.22, 0.18, 0.58);
      head.add(earL);

      const earR = new THREE.Group();
      const earROuter = new THREE.Mesh(sharedEarRGeo, skinMat);
      earROuter.castShadow = true;
      earR.add(earROuter);
      const earRInner = new THREE.Mesh(sharedEarRGeo, innerEarMat);
      earRInner.scale.set(0.74, 0.78, 0.55);
      earRInner.position.set(-0.01, -0.01, 0.032);
      earR.add(earRInner);
      earR.position.set(0.35, 0.34, 0.04);
      earR.rotation.set(0.22, -0.18, -0.58);
      head.add(earR);

      pigGroup.add(head);

      // 11. Multi-Part Crafted Role Outfits & Accessories (No floating primitive boxes!)
      if (accessory === 'ceo') {
        // Gold-rimmed round spectacles with nose bridge & side temples
        const goldMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          metalness: 0.9,
          roughness: 0.15,
        });
        const lensMat = new THREE.MeshPhysicalMaterial({
          color: 0xe0f2fe,
          transmission: 0.75,
          transparent: true,
          opacity: 0.35,
          roughness: 0.05,
        });
        [-0.22, 0.22].forEach((gx) => {
          const rim = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.012, 10, 24), goldMat);
          rim.position.set(gx, 0.062, 0.49);
          head.add(rim);

          const lens = new THREE.Mesh(new THREE.CircleGeometry(0.088, 20), lensMat);
          lens.position.set(gx, 0.062, 0.492);
          head.add(lens);

          const temple = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.32, 8), goldMat);
          temple.rotation.x = Math.PI / 2;
          temple.position.set(gx + (gx < 0 ? -0.095 : 0.095), 0.062, 0.33);
          head.add(temple);
        });
        const bridge = new THREE.Mesh(
          new THREE.TorusGeometry(0.045, 0.009, 8, 12, Math.PI),
          goldMat
        );
        bridge.position.set(0, 0.075, 0.495);
        head.add(bridge);

        // Sculpted Silk Necktie & Executive Crown Pin
        const tieMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.35 });
        const tieKnot = new THREE.Mesh(new RoundedBoxGeometry(0.09, 0.08, 0.06, 3, 0.02), tieMat);
        tieKnot.position.set(0, 0.84, 0.39);
        pigGroup.add(tieKnot);

        const tieBlade = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.28, 4), tieMat);
        tieBlade.rotation.z = Math.PI;
        tieBlade.rotation.y = Math.PI / 4;
        tieBlade.scale.set(1.0, 1.0, 0.35);
        tieBlade.position.set(0, 0.68, 0.44);
        tieBlade.rotation.x = -0.15;
        pigGroup.add(tieBlade);
      } else if (accessory === 'designer') {
        // Sculpted Puff French Artist Beret with Stem (Cabillou) & Headband
        const beretMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.65 });
        const beretGroup = new THREE.Group();
        beretGroup.position.set(0.08, 0.42, -0.02);
        beretGroup.rotation.set(-0.1, 0, -0.24);

        const beretBand = new THREE.Mesh(
          new THREE.CylinderGeometry(0.32, 0.33, 0.06, 24),
          new THREE.MeshStandardMaterial({ color: 0x9f1239, roughness: 0.5 })
        );
        beretGroup.add(beretBand);

        const beretPuff = new THREE.Mesh(new THREE.SphereGeometry(0.39, 28, 20), beretMat);
        beretPuff.scale.set(1.08, 0.36, 1.05);
        beretPuff.position.set(0.03, 0.06, 0);
        beretPuff.castShadow = true;
        beretGroup.add(beretPuff);

        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.07, 8), beretMat);
        stem.position.set(0.03, 0.20, 0);
        beretGroup.add(stem);
        head.add(beretGroup);

        // Digital Stylus Pen held in Right Paw
        const stylus = new THREE.Mesh(
          new THREE.CylinderGeometry(0.016, 0.012, 0.32, 12),
          new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 })
        );
        stylus.position.set(0, 0.14, 0.08);
        stylus.rotation.set(0.3, 0, 0.5);
        armR.add(stylus);
      } else if (accessory === 'pm') {
        // Woven Lanyard Strap around neck + Detailed ID Badge Card
        const strapMat = new THREE.MeshStandardMaterial({ color: 0x7c3aed, roughness: 0.4 });
        const lanyardLoop = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.016, 8, 24), strapMat);
        lanyardLoop.rotation.x = Math.PI / 2 - 0.32;
        lanyardLoop.position.set(0, 0.82, 0.16);
        pigGroup.add(lanyardLoop);

        const badgeHolder = new THREE.Mesh(
          new RoundedBoxGeometry(0.15, 0.20, 0.025, 3, 0.01),
          strapMat
        );
        badgeHolder.position.set(0, 0.68, 0.46);
        badgeHolder.rotation.x = -0.14;
        pigGroup.add(badgeHolder);

        const badgeCard = new THREE.Mesh(
          new THREE.PlaneGeometry(0.12, 0.15),
          new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        badgeCard.position.set(0, 0.675, 0.475);
        badgeCard.rotation.x = -0.14;
        pigGroup.add(badgeCard);
      } else if (accessory === 'architect') {
        // Precision Cyan/Gold Monocle with Lens & Chain + Rolled Blueprint Tube
        const monoMat = new THREE.MeshStandardMaterial({
          color: 0x0284c7,
          metalness: 0.9,
          roughness: 0.1,
        });
        const monocle = new THREE.Mesh(new THREE.TorusGeometry(0.10, 0.014, 10, 24), monoMat);
        monocle.position.set(0.22, 0.062, 0.49);
        head.add(monocle);

        const monoLens = new THREE.Mesh(
          new THREE.CircleGeometry(0.092, 20),
          new THREE.MeshPhysicalMaterial({
            color: 0x38bdf8,
            transmission: 0.7,
            transparent: true,
            opacity: 0.35,
          })
        );
        monoLens.position.set(0.22, 0.062, 0.492);
        head.add(monoLens);

        // Rolled Blueprint Tube with End Caps slung on back/side
        const tubeGroup = new THREE.Group();
        tubeGroup.position.set(-0.42, 0.62, -0.16);
        tubeGroup.rotation.set(0.25, 0, 0.38);
        const tubeBody = new THREE.Mesh(
          new THREE.CylinderGeometry(0.068, 0.068, 0.52, 16),
          new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 })
        );
        tubeGroup.add(tubeBody);
        const scrollPaper = new THREE.Mesh(
          new THREE.CylinderGeometry(0.052, 0.052, 0.58, 16),
          new THREE.MeshBasicMaterial({ color: 0xe0f2fe })
        );
        tubeGroup.add(scrollPaper);
        pigGroup.add(tubeGroup);
      } else if (accessory === 'database') {
        // Multi-Tier Stacked Golden Database Cylinders with Glowing Rings
        const dbGroup = new THREE.Group();
        dbGroup.position.set(0.42, 0.58, 0.32);
        dbGroup.rotation.set(0.2, 0.2, -0.15);
        const platterMat = new THREE.MeshStandardMaterial({
          color: 0xd97706,
          metalness: 0.8,
          roughness: 0.2,
        });
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
        [0, 0.075, 0.15].forEach((py) => {
          const platter = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.055, 20), platterMat);
          platter.position.y = py;
          dbGroup.add(platter);

          const glowRing = new THREE.Mesh(new THREE.TorusGeometry(0.132, 0.008, 8, 20), ringMat);
          glowRing.rotation.x = Math.PI / 2;
          glowRing.position.y = py;
          dbGroup.add(glowRing);
        });
        pigGroup.add(dbGroup);
      } else if (accessory === 'backend') {
        // Fitted Developer Cap/Visor with Curved Bill
        const capMat = new THREE.MeshStandardMaterial({ color: 0x4f46e5, roughness: 0.5 });
        const headBand = new THREE.Mesh(
          new THREE.CylinderGeometry(0.46, 0.48, 0.09, 28, 1, true),
          capMat
        );
        headBand.position.set(0, 0.26, 0.01);
        head.add(headBand);

        const bill = new THREE.Mesh(
          new THREE.CylinderGeometry(0.49, 0.49, 0.03, 24, 1, false, -Math.PI * 0.38, Math.PI * 0.76),
          capMat
        );
        bill.scale.set(0.95, 1, 1.28);
        bill.position.set(0, 0.23, 0.12);
        bill.rotation.x = 0.18;
        head.add(bill);
      } else if (accessory === 'frontend') {
        // Studio Over-Ear Headphones with Padded Headband, Sliders & Ear Cushions
        const hpMat = new THREE.MeshStandardMaterial({
          color: 0x059669,
          metalness: 0.5,
          roughness: 0.3,
        });
        const padMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });

        const hpBand = new THREE.Mesh(
          new THREE.TorusGeometry(0.51, 0.032, 12, 32, Math.PI),
          hpMat
        );
        hpBand.position.set(0, 0.05, 0.02);
        head.add(hpBand);

        [-0.51, 0.51].forEach((hx) => {
          const earCupGroup = new THREE.Group();
          earCupGroup.position.set(hx, 0.03, 0.04);

          const cushion = new THREE.Mesh(
            new THREE.TorusGeometry(0.11, 0.038, 12, 20),
            padMat
          );
          cushion.rotation.y = Math.PI / 2;
          earCupGroup.add(cushion);

          const shell = new THREE.Mesh(
            new THREE.CylinderGeometry(0.125, 0.105, 0.08, 20),
            hpMat
          );
          shell.rotation.z = Math.PI / 2;
          shell.position.x = hx < 0 ? -0.03 : 0.03;
          earCupGroup.add(shell);

          head.add(earCupGroup);
        });
      } else if (accessory === 'security') {
        // Sleek Cyber Aviator Sunglasses with Dual Lenses, Gold Brow Bar & Temples
        const frameMat = new THREE.MeshStandardMaterial({
          color: 0x0f172a,
          metalness: 0.85,
          roughness: 0.15,
        });
        const lensMat = new THREE.MeshPhysicalMaterial({
          color: 0x090d16,
          metalness: 0.4,
          roughness: 0.05,
          clearcoat: 1.0,
        });

        [-0.21, 0.21].forEach((sx) => {
          const lens = new THREE.Mesh(
            new RoundedBoxGeometry(0.21, 0.13, 0.03, 4, 0.035),
            lensMat
          );
          lens.position.set(sx, 0.062, 0.485);
          lens.rotation.y = sx < 0 ? -0.15 : 0.15;
          head.add(lens);

          const temple = new THREE.Mesh(
            new THREE.BoxGeometry(0.018, 0.022, 0.34),
            frameMat
          );
          temple.position.set(sx + (sx < 0 ? -0.11 : 0.11), 0.075, 0.32);
          head.add(temple);
        });

        const browBar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.01, 0.01, 0.56, 8),
          new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.9 })
        );
        browBar.rotation.z = Math.PI / 2;
        browBar.position.set(0, 0.125, 0.49);
        head.add(browBar);
      } else if (accessory === 'qa') {
        // Real Magnifying Glass with Rim, Translucent Glass Lens & Handle held in Right Paw
        const magGroup = new THREE.Group();
        magGroup.position.set(0.04, 0.16, 0.12);
        magGroup.rotation.set(-0.3, 0.2, -0.35);

        const rim = new THREE.Mesh(
          new THREE.TorusGeometry(0.115, 0.018, 12, 24),
          new THREE.MeshStandardMaterial({ color: 0x0d9488, metalness: 0.85, roughness: 0.2 })
        );
        magGroup.add(rim);

        const lens = new THREE.Mesh(
          new THREE.CylinderGeometry(0.11, 0.11, 0.012, 20),
          new THREE.MeshPhysicalMaterial({
            color: 0x99f6e4,
            transmission: 0.8,
            transparent: true,
            opacity: 0.45,
            roughness: 0.05,
          })
        );
        lens.rotation.x = Math.PI / 2;
        magGroup.add(lens);

        const handle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.018, 0.022, 0.18, 12),
          new THREE.MeshStandardMaterial({ color: 0x134e4a, roughness: 0.4 })
        );
        handle.position.set(0, -0.19, 0);
        magGroup.add(handle);

        armR.add(magGroup);
      } else if (accessory === 'maintenance') {
        // Ribbed Industrial Safety Hardhat with Front Badge & Sculpted Open-Jaw Wrench
        const hatMat = new THREE.MeshStandardMaterial({
          color: 0xf97316,
          roughness: 0.3,
          metalness: 0.15,
        });
        const hardhatGroup = new THREE.Group();
        hardhatGroup.position.set(0, 0.32, 0.02);

        const dome = new THREE.Mesh(
          new THREE.SphereGeometry(0.45, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.52),
          hatMat
        );
        dome.scale.set(1.12, 0.78, 1.12);
        dome.castShadow = true;
        hardhatGroup.add(dome);

        // Top reinforcement ridge
        const ridge = new THREE.Mesh(
          new RoundedBoxGeometry(0.10, 0.08, 0.78, 3, 0.025),
          hatMat
        );
        ridge.position.set(0, 0.31, 0);
        hardhatGroup.add(ridge);

        const brim = new THREE.Mesh(
          new THREE.CylinderGeometry(0.54, 0.56, 0.032, 28),
          hatMat
        );
        brim.position.set(0, 0.02, 0.03);
        hardhatGroup.add(brim);

        head.add(hardhatGroup);

        // Sculpted Steel Open-End Wrench in Right Paw
        const wrenchGroup = new THREE.Group();
        wrenchGroup.position.set(0, 0.16, 0.08);
        wrenchGroup.rotation.set(-0.4, 0, -0.2);
        const steelMat = new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          metalness: 0.88,
          roughness: 0.2,
        });
        const shaft = new THREE.Mesh(
          new RoundedBoxGeometry(0.048, 0.24, 0.024, 2, 0.008),
          steelMat
        );
        wrenchGroup.add(shaft);

        const jaw = new THREE.Mesh(
          new THREE.TorusGeometry(0.055, 0.022, 8, 16, Math.PI * 1.35),
          steelMat
        );
        jaw.position.set(0, 0.14, 0);
        jaw.rotation.z = -Math.PI * 0.18;
        wrenchGroup.add(jaw);
        armR.add(wrenchGroup);
      } else if (accessory === 'courier') {
        // Cute Postal Messenger Cap with Visor & Gold Badge
        const capMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.45 });
        const capGroup = new THREE.Group();
        capGroup.position.set(0, 0.38, 0.02);

        const capCrown = new THREE.Mesh(
          new THREE.CylinderGeometry(0.36, 0.33, 0.14, 24),
          capMat
        );
        capGroup.add(capCrown);

        const capVisor = new THREE.Mesh(
          new THREE.CylinderGeometry(0.36, 0.36, 0.025, 20, 1, false, -Math.PI * 0.35, Math.PI * 0.7),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 })
        );
        capVisor.position.set(0, -0.05, 0.12);
        capVisor.rotation.x = 0.2;
        capGroup.add(capVisor);

        const goldBadge = new THREE.Mesh(
          new THREE.SphereGeometry(0.032, 10, 10),
          new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9 })
        );
        goldBadge.position.set(0, 0.01, 0.35);
        capGroup.add(goldBadge);

        head.add(capGroup);
      }

      return { pigGroup, head, earL, earR, armL, armR, tailGroup };
    };

    // 10. WORKSTATION BUILDER FUNCTION (Cohesive Designer Miniature Furniture)
    const createWorkstation = (config: DeskConfig) => {
      const station = new THREE.Group();
      station.position.set(config.x, 0, config.z);
      station.rotation.y = config.rotationY;

      // 1. Beveled Tabletop with Warm Wood Trim & Stitched Desk Mat
      const deskTopGeo = new RoundedBoxGeometry(2.35, 0.09, 1.42, 4, 0.03);
      const deskTopMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.35,
      });
      const deskTop = new THREE.Mesh(deskTopGeo, deskTopMat);
      deskTop.position.set(0, 1.15, 0);
      deskTop.castShadow = true;
      deskTop.receiveShadow = true;
      station.add(deskTop);

      // Extended Stitched Dark-Slate Desk Mat
      const deskMatMesh = new THREE.Mesh(
        new RoundedBoxGeometry(1.45, 0.015, 0.58, 3, 0.008),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 })
      );
      deskMatMesh.position.set(0.06, 1.198, 0.12);
      deskMatMesh.receiveShadow = true;
      station.add(deskMatMesh);

      // 2. Sturdy Steel C-Frame Legs, Floor Skids & Modesty Panel
      const legMat = new THREE.MeshStandardMaterial({
        color: 0x475569,
        metalness: 0.65,
        roughness: 0.3,
      });
      [-1.04, 1.04].forEach((lx) => {
        // Vertical pillars
        [-0.52, 0.52].forEach((lz) => {
          const leg = new THREE.Mesh(
            new RoundedBoxGeometry(0.065, 1.12, 0.065, 2, 0.015),
            legMat
          );
          leg.position.set(lx, 0.56, lz);
          leg.castShadow = true;
          station.add(leg);
        });
        // Floor stabilizer runner bar
        const floorBar = new THREE.Mesh(
          new RoundedBoxGeometry(0.08, 0.045, 1.24, 2, 0.015),
          legMat
        );
        floorBar.position.set(lx, 0.022, 0);
        station.add(floorBar);
      });

      // Under-desk cable tray / modesty panel
      const cableTray = new THREE.Mesh(
        new RoundedBoxGeometry(1.95, 0.16, 0.08, 2, 0.015),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 })
      );
      cableTray.position.set(0, 1.02, -0.45);
      station.add(cableTray);

      // 3. Articulated Monitor Arm, Thin-Bezel Display & Live IDE Screen
      const standMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.7,
        roughness: 0.3,
      });
      const standBase = new THREE.Mesh(
        new RoundedBoxGeometry(0.42, 0.025, 0.28, 3, 0.01),
        standMat
      );
      standBase.position.set(0, 1.205, -0.38);
      station.add(standBase);

      const standNeck = new THREE.Mesh(
        new RoundedBoxGeometry(0.09, 0.42, 0.06, 2, 0.015),
        standMat
      );
      standNeck.position.set(0, 1.40, -0.42);
      standNeck.rotation.x = -0.12;
      station.add(standNeck);

      const screenBezel = new THREE.Mesh(
        new RoundedBoxGeometry(1.46, 0.88, 0.055, 4, 0.025),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.25, metalness: 0.4 })
      );
      screenBezel.position.set(0, 1.78, -0.35);
      screenBezel.castShadow = true;
      station.add(screenBezel);

      // Glowing Monitor Screen with Realistic Code/Dashboard Texture
      const screenTex = createMonitorScreenTexture(config.screenGlowColor);
      const screenMat = new THREE.MeshBasicMaterial({
        map: screenTex,
        color: 0x94a3b8,
      });
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.36, 0.78), screenMat);
      screen.position.set(0, 1.78, -0.32);
      station.add(screen);

      // 4. Custom Mechanical Keyboard with Sculpted Keycap Rows
      const kbGroup = new THREE.Group();
      kbGroup.position.set(-0.08, 1.22, 0.12);
      kbGroup.rotation.x = 0.06;

      const kbCase = new THREE.Mesh(
        new RoundedBoxGeometry(0.76, 0.035, 0.28, 3, 0.01),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.35 })
      );
      kbGroup.add(kbCase);

      const keyMatMain = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4 });
      const keyMatAccent = new THREE.MeshStandardMaterial({ color: config.screenGlowColor, roughness: 0.35 });
      [-0.08, -0.025, 0.03, 0.085].forEach((kz, rIdx) => {
        const keyRow = new THREE.Mesh(
          new RoundedBoxGeometry(0.64, 0.022, 0.042, 2, 0.005),
          keyMatMain
        );
        keyRow.position.set(0.02, 0.02, kz);
        kbGroup.add(keyRow);

        if (rIdx === 0 || rIdx === 2) {
          const accentKey = new THREE.Mesh(
            new RoundedBoxGeometry(0.055, 0.024, 0.042, 2, 0.005),
            keyMatAccent
          );
          accentKey.position.set(rIdx === 0 ? -0.33 : 0.32, 0.021, kz);
          kbGroup.add(accentKey);
        }
      });
      station.add(kbGroup);

      // 5. Contoured Ergonomic Wireless Mouse
      const mouseGroup = new THREE.Group();
      mouseGroup.position.set(0.54, 1.22, 0.14);
      const mouseBody = new THREE.Mesh(
        new RoundedBoxGeometry(0.11, 0.042, 0.17, 4, 0.02),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 })
      );
      mouseGroup.add(mouseBody);
      const scrollWheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.012, 10),
        new THREE.MeshStandardMaterial({ color: 0x0f172a })
      );
      scrollWheel.rotation.z = Math.PI / 2;
      scrollWheel.position.set(0, 0.02, -0.04);
      mouseGroup.add(scrollWheel);
      station.add(mouseGroup);

      // 6. Authentic Rounded-Rectangular SPAM Tin with Pull-Tab
      const canGroup = new THREE.Group();
      canGroup.position.set(-0.82, 1.30, 0.06);
      canGroup.rotation.y = 0.32;

      const canBody = new THREE.Mesh(
        new RoundedBoxGeometry(0.28, 0.21, 0.19, 4, 0.045),
        new THREE.MeshStandardMaterial({
          map: sharedSpamTex,
          roughness: 0.28,
          metalness: 0.35,
        })
      );
      canBody.castShadow = true;
      canGroup.add(canBody);

      const canLid = new THREE.Mesh(
        new RoundedBoxGeometry(0.265, 0.018, 0.175, 4, 0.04),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.2 })
      );
      canLid.position.y = 0.106;
      canGroup.add(canLid);

      const pullTab = new THREE.Mesh(
        new THREE.TorusGeometry(0.024, 0.005, 6, 14),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.9 })
      );
      pullTab.rotation.x = Math.PI / 2;
      pullTab.position.set(-0.05, 0.118, 0);
      canGroup.add(pullTab);

      station.add(canGroup);

      // 7. Complete Ergonomic Executive Chair (5-Star Base, Gas Lift, Spine, Armrests & Seat)
      const chairGroup = new THREE.Group();
      chairGroup.position.set(0, 0, 0.68);

      const chairCushionMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.65,
      });
      const chairFrameMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.6,
        roughness: 0.35,
      });
      const casterMetalMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.85,
        roughness: 0.2,
      });

      // Pneumatic Gas Cylinder
      const gasLift = new THREE.Mesh(
        new THREE.CylinderGeometry(0.048, 0.058, 0.56, 16),
        casterMetalMat
      );
      gasLift.position.y = 0.32;
      gasLift.castShadow = true;
      chairGroup.add(gasLift);

      // 5-Star Caster Base & Wheels
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const spokeGroup = new THREE.Group();
        spokeGroup.rotation.y = angle;

        const spoke = new THREE.Mesh(
          new RoundedBoxGeometry(0.055, 0.04, 0.42, 2, 0.012),
          chairFrameMat
        );
        spoke.position.set(0, 0.07, 0.20);
        spoke.rotation.x = 0.08;
        spokeGroup.add(spoke);

        const wheel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.038, 0.038, 0.035, 12),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 })
        );
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(0, 0.038, 0.39);
        spokeGroup.add(wheel);

        chairGroup.add(spokeGroup);
      }

      // Contoured Seat Cushion
      const chairSeat = new THREE.Mesh(
        new RoundedBoxGeometry(0.92, 0.11, 0.86, 4, 0.045),
        chairCushionMat
      );
      chairSeat.position.set(0, 0.62, 0);
      chairSeat.castShadow = true;
      chairSeat.receiveShadow = true;
      chairGroup.add(chairSeat);

      // Curved L-Spine Connecting Seat to Backrest
      const spineBottom = new THREE.Mesh(
        new RoundedBoxGeometry(0.14, 0.06, 0.46, 2, 0.02),
        chairFrameMat
      );
      spineBottom.position.set(0, 0.56, 0.22);
      chairGroup.add(spineBottom);

      const spineVertical = new THREE.Mesh(
        new RoundedBoxGeometry(0.14, 0.68, 0.07, 2, 0.02),
        chairFrameMat
      );
      spineVertical.position.set(0, 0.88, 0.42);
      spineVertical.rotation.x = 0.08;
      chairGroup.add(spineVertical);

      // Ergonomic Contoured Backrest + Accent Trim
      const chairBack = new THREE.Mesh(
        new RoundedBoxGeometry(0.84, 0.72, 0.11, 4, 0.045),
        chairCushionMat
      );
      chairBack.position.set(0, 1.12, 0.37);
      chairBack.rotation.x = 0.08;
      chairBack.castShadow = true;
      chairGroup.add(chairBack);

      const backAccent = new THREE.Mesh(
        new RoundedBoxGeometry(0.52, 0.05, 0.12, 2, 0.015),
        new THREE.MeshStandardMaterial({ color: config.screenGlowColor, roughness: 0.4 })
      );
      backAccent.position.set(0, 1.38, 0.39);
      backAccent.rotation.x = 0.08;
      chairGroup.add(backAccent);

      // Left & Right T-Shaped Armrests
      [-0.48, 0.48].forEach((ax) => {
        const armPost = new THREE.Mesh(
          new RoundedBoxGeometry(0.045, 0.26, 0.055, 2, 0.012),
          chairFrameMat
        );
        armPost.position.set(ax, 0.74, 0.04);
        chairGroup.add(armPost);

        const armPad = new THREE.Mesh(
          new RoundedBoxGeometry(0.10, 0.038, 0.34, 3, 0.012),
          chairCushionMat
        );
        armPad.position.set(ax, 0.87, 0.04);
        chairGroup.add(armPad);
      });

      station.add(chairGroup);

      // 8. Seated LuLu Piggy facing the monitor (-Z relative to station)
      const {
        pigGroup,
        head,
        earL,
        earR,
        armL,
        armR,
        tailGroup,
      } = createLuluPig(config.accessory, config.screenGlowColor);

      pigGroup.position.set(0, 0.65, 0.65);
      pigGroup.rotation.y = Math.PI; // Face monitor!
      station.add(pigGroup);

      // Active status halo
      const haloGeo = new THREE.RingGeometry(1.4, 1.55, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: config.screenGlowColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.rotation.x = -Math.PI / 2;
      halo.position.y = 0.03;
      station.add(halo);

      scene.add(station);

      stationGroupsRef.current[config.id] = { station, config };

      pigMeshesRef.current[config.id] = {
        pigGroup,
        head,
        earL,
        earR,
        armL,
        armR,
        tail: tailGroup,
        screenMesh: screen,
        haloMesh: halo,
      };
    };

    // Build All 10 Specialist Workstations
    Object.values(DESK_CONFIGS).forEach(createWorkstation);

    // 11. ROAMING LULU PIG COURIER WITH FRONT-FACING PORTFOLIO FOLDER
    const courierGroup = new THREE.Group();
    const {
      pigGroup: cPig,
      head: cHead,
      earL: cEarL,
      earR: cEarR,
      armL: cArmL,
      armR: cArmR,
      tailGroup: cTail,
    } = createLuluPig('courier', 0x2563eb);
    courierGroup.add(cPig);

    // Position rounded portfolio folder on the FRONT of the pig (+Z)
    const folderGeo = new RoundedBoxGeometry(0.50, 0.36, 0.065, 3, 0.02);
    const folderMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.4 });
    const folder = new THREE.Mesh(folderGeo, folderMat);
    folder.position.set(0, 0.62, 0.42); // FRONT (+Z)
    folder.rotation.x = 0.22;
    courierGroup.add(folder);

    // Document blueprint sticking out of top of folder
    const paper = new THREE.Mesh(
      new RoundedBoxGeometry(0.42, 0.28, 0.02, 2, 0.005),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    paper.position.set(0, 0.70, 0.44);
    paper.rotation.x = 0.22;
    courierGroup.add(paper);

    // Adjust arms to clasp the folder in front
    cArmL.position.set(-0.32, 0.65, 0.35);
    cArmL.rotation.set(0.8, -0.2, 0.45);
    cArmR.position.set(0.32, 0.65, 0.35);
    cArmR.rotation.set(0.8, 0.2, -0.45);

    courierGroup.position.set(-14.0, 0, 0);
    scene.add(courierGroup);

    courierPigRef.current = {
      group: courierGroup,
      body: cPig.children[0] as THREE.Mesh,
      head: cHead,
      earL: cEarL,
      earR: cEarR,
      tail: cTail,
      armL: cArmL,
      armR: cArmR,
      folder,
      currentPos: new THREE.Vector3(-14.0, 0, 0),
      waypoints: [],
      isWalking: false,
    };

    // 12. ANIMATION LOOP
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Smooth Camera Transitions
      if (isTransitioningCam.current && cameraRef.current && controlsRef.current) {
        cameraRef.current.position.lerp(targetCamPos.current, 0.065);
        controlsRef.current.target.lerp(targetControlsLookAt.current, 0.065);
        if (
          cameraRef.current.position.distanceTo(targetCamPos.current) < 0.15 &&
          controlsRef.current.target.distanceTo(targetControlsLookAt.current) < 0.15
        ) {
          cameraRef.current.position.copy(targetCamPos.current);
          controlsRef.current.target.copy(targetControlsLookAt.current);
          isTransitioningCam.current = false;
        }
      }

      // Animate Server Rack LEDs
      serverLedMaterialsRef.current.forEach((mat, idx) => {
        mat.emissiveIntensity =
          Math.sin(time * 6 + idx * 1.5) > 0.1 ? 1.0 : 0.25;
      });

      // Animate Specialists at their desks
      const currentActiveAgentId = activeAgentIdRef.current;
      const currentCompletedAgents = completedAgentsRef.current;

      Object.entries(pigMeshesRef.current).forEach(([pigId, meshes]) => {
        const isActive = currentActiveAgentId === pigId;
        const isDone = currentCompletedAgents.includes(pigId);
        const config = DESK_CONFIGS[pigId];

        meshes.pigGroup.position.y = 0.65 + Math.sin(time * 2.5 + config.x) * 0.015;
        meshes.earL.rotation.z = 0.58 + Math.sin(time * 3 + config.x) * 0.08;
        meshes.earR.rotation.z = -0.58 - Math.cos(time * 3 + config.x) * 0.08;
        meshes.tail.rotation.z = Math.sin(time * 4) * 0.25;

        if (isActive) {
          (meshes.screenMesh.material as THREE.MeshBasicMaterial).color.setHex(0xffffff);
          (meshes.haloMesh.material as THREE.MeshBasicMaterial).opacity =
            0.6 + Math.sin(time * 5) * 0.3;

          meshes.armL.position.y = 0.65 + Math.sin(time * 24) * 0.05;
          meshes.armR.position.y = 0.65 + Math.cos(time * 24) * 0.05;
          meshes.head.position.y = 1.10 + Math.sin(time * 12) * 0.025;
          meshes.head.rotation.x = Math.sin(time * 8) * 0.04;
          meshes.tail.rotation.y = Math.sin(time * 16) * 0.45;
        } else if (isDone) {
          (meshes.screenMesh.material as THREE.MeshBasicMaterial).color.setHex(0xa7f3d0);
          (meshes.haloMesh.material as THREE.MeshBasicMaterial).opacity = 0.2;
          meshes.armL.position.y = 0.65;
          meshes.armR.position.y = 0.65;
          meshes.head.position.y = 1.10;
          meshes.head.rotation.x = 0;
        } else {
          (meshes.screenMesh.material as THREE.MeshBasicMaterial).color.setHex(0x94a3b8);
          (meshes.haloMesh.material as THREE.MeshBasicMaterial).opacity = 0;
          meshes.armL.position.y = 0.65;
          meshes.armR.position.y = 0.65;
          meshes.head.position.y = 1.10;
          meshes.head.rotation.x = 0;
        }
      });

      // Animate Central Gate Crystal
      gateCrystal.rotation.y = time * 0.8;
      gateCrystal.position.y = 1.15 + Math.sin(time * 2.5) * 0.08;

      // Smart Waypoint Navigation & Forward Facing for Courier Pig
      const courier = courierPigRef.current;
      if (courier) {
        if (courier.waypoints.length > 0) {
          const nextTarget = courier.waypoints[0];
          const dist = courier.currentPos.distanceTo(nextTarget);

          if (dist < 0.28) {
            courier.waypoints.shift();
          } else {
            courier.isWalking = true;
            const dir = new THREE.Vector3().subVectors(nextTarget, courier.currentPos).normalize();
            courier.currentPos.addScaledVector(dir, 0.14);
            courier.group.position.copy(courier.currentPos);

            // CRITICAL FIX: The piglet front is +Z, so Math.atan2(dir.x, dir.z) points the front directly forward!
            const targetRotY = Math.atan2(dir.x, dir.z);
            let diff = targetRotY - courier.group.rotation.y;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            courier.group.rotation.y += diff * 0.22;

            // Signature Forward Waddling Walk
            courier.group.rotation.z = Math.sin(time * 12) * 0.12;
            courier.group.position.y = Math.abs(Math.sin(time * 12)) * 0.1;

            courier.earL.rotation.z = 0.58 + Math.sin(time * 12) * 0.18;
            courier.earR.rotation.z = -0.58 - Math.sin(time * 12) * 0.18;
            courier.tail.rotation.y = Math.sin(time * 18) * 0.45;
          }
        } else {
          courier.isWalking = false;
          courier.group.rotation.z = 0;
          courier.group.position.y = Math.sin(time * 3) * 0.02;
          courier.earL.rotation.z = 0.58;
          courier.earR.rotation.z = -0.58;
          courier.tail.rotation.y = Math.sin(time * 3) * 0.15;

          // Turn directly to face the specialist seated at the desk when arrived!
          if (currentActiveAgentId && DESK_CONFIGS[currentActiveAgentId]) {
            const desk = DESK_CONFIGS[currentActiveAgentId];
            // Specialist pig sits at (desk.x, 0, desk.z + 0.65) in world coords
            const dx = desk.x - courier.currentPos.x;
            const dz = (desk.z + 0.65) - courier.currentPos.z;
            const directFacingAngle = Math.atan2(dx, dz);
            let diff = directFacingAngle - courier.group.rotation.y;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            courier.group.rotation.y += diff * 0.15;
          }
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // 13. Window Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || (isFullscreen ? window.innerHeight - 140 : 500);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    // 14. Auto-detect custom model in /models/lulu.glb
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      '/models/lulu.glb',
      (gltf) => {
        applyCustomModel(gltf.scene, 'lulu.glb (Preloaded)');
      },
      undefined,
      () => {
        // Built-in flocked procedural model active
      }
    );

    // 16. Raycaster for Interactive 3D Employee Inspection & Dossier
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (event: MouseEvent) => {
      if (!mountRef.current) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const hitMeshes: THREE.Object3D[] = [];
      const meshToDeskId = new Map<THREE.Object3D, string>();

      Object.entries(stationGroupsRef.current).forEach(([deskId, { station }]) => {
        station.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            hitMeshes.push(child);
            meshToDeskId.set(child, deskId);
          }
        });
      });

      const intersects = raycaster.intersectObjects(hitMeshes, false);
      if (intersects.length > 0) {
        const hitDeskId = meshToDeskId.get(intersects[0].object);
        if (hitDeskId && DESK_CONFIGS[hitDeskId]) {
          const desk = DESK_CONFIGS[hitDeskId];
          // Smooth focus camera on desk
          targetControlsLookAt.current.set(desk.x, 1.2, desk.z);
          targetCamPos.current.set(desk.x, 7.5, desk.z + (desk.z > 0 ? 7 : -7));
          isTransitioningCam.current = true;
          setSelectedDeptId(desk.departmentId);
          setSelectedPig(desk);

          const matchingRole = roles.find((r) => r.id === hitDeskId);
          if (matchingRole) {
            const hitPig = pigMeshesRef.current[hitDeskId];
            if (hitPig) {
              // Interactive character salute & ear twitch
              hitPig.head.rotation.x = -0.15;
              hitPig.earL.rotation.z = 0.9;
              hitPig.earR.rotation.z = -0.9;
            }
            onInspectAgent?.(matchingRole);
          }
        }
      }
    };

    const handleCanvasMouseMove = (event: MouseEvent) => {
      if (!mountRef.current) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const hitMeshes: THREE.Object3D[] = [];
      Object.values(stationGroupsRef.current).forEach(({ station }) => {
        station.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) hitMeshes.push(child);
        });
      });

      const intersects = raycaster.intersectObjects(hitMeshes, false);
      renderer.domElement.style.cursor = intersects.length > 0 ? 'pointer' : 'grab';
    };

    renderer.domElement.addEventListener('click', handleCanvasClick);
    renderer.domElement.addEventListener('mousemove', handleCanvasMouseMove);

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleCanvasClick);
      renderer.domElement.removeEventListener('mousemove', handleCanvasMouseMove);
      controls.dispose();
      renderer.dispose();
      scene.clear();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [roles, onInspectAgent]);

  // Handle dynamic resize & camera framing when entering or exiting Fullscreen
  useEffect(() => {
    if (sceneRef.current) {
      if (isFullscreen) {
        sceneRef.current.background = new THREE.Color(0x0b1120);
        sceneRef.current.fog = new THREE.FogExp2(0x0b1120, 0.007);
        targetCamPos.current.set(0, 20, 24);
        targetControlsLookAt.current.set(0, 0.8, 0);
      } else {
        sceneRef.current.background = new THREE.Color(0xf1f5f9);
        sceneRef.current.fog = new THREE.FogExp2(0xf1f5f9, 0.009);
        targetCamPos.current.set(0, 24, 27);
        targetControlsLookAt.current.set(0, 1.2, 0);
      }
      isTransitioningCam.current = true;
    }

    const timer = setTimeout(() => {
      if (mountRef.current && rendererRef.current && cameraRef.current) {
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        if (w > 0 && h > 0) {
          cameraRef.current.aspect = w / h;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(w, h);
        }
      }
    }, 40);
    return () => clearTimeout(timer);
  }, [isFullscreen]);

  // Apply a loaded GLTF scene
  const applyCustomModel = (gltfScene: THREE.Group, modelName: string) => {
    const box = new THREE.Box3().setFromObject(gltfScene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const targetHeight = 1.35;
    const scale = targetHeight / maxDim;
    gltfScene.scale.set(scale, scale, scale);

    const center = new THREE.Vector3();
    box.getCenter(center);
    gltfScene.position.sub(center.clone().multiplyScalar(scale));
    gltfScene.position.y += targetHeight * 0.45;

    gltfScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    customTemplateRef.current = gltfScene;
    setCustomModelName(modelName);

    Object.entries(stationGroupsRef.current).forEach(([deskId, { station }]) => {
      const oldPig = pigMeshesRef.current[deskId]?.pigGroup;
      if (oldPig && oldPig.parent) {
        station.remove(oldPig);
      }
      const newPigGroup = new THREE.Group();
      newPigGroup.position.set(0, 0.65, 0.65);
      newPigGroup.rotation.y = Math.PI;
      const clone = gltfScene.clone(true);
      newPigGroup.add(clone);
      station.add(newPigGroup);

      if (pigMeshesRef.current[deskId]) {
        pigMeshesRef.current[deskId].pigGroup = newPigGroup;
      }
    });

    if (courierPigRef.current) {
      const oldCPig = courierPigRef.current.group.children[0];
      if (oldCPig) {
        courierPigRef.current.group.remove(oldCPig);
      }
      const newCPig = gltfScene.clone(true);
      courierPigRef.current.group.add(newCPig);
    }
  };

  const handleModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const buffer = event.target?.result as ArrayBuffer;
      if (buffer) {
        const loader = new GLTFLoader();
        loader.parse(
          buffer,
          '',
          (gltf) => {
            applyCustomModel(gltf.scene, file.name);
          },
          (err) => {
            console.error('Failed to parse uploaded GLTF file:', err);
          }
        );
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || (!file.name.endsWith('.glb') && !file.name.endsWith('.gltf'))) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const buffer = event.target?.result as ArrayBuffer;
      if (buffer) {
        const loader = new GLTFLoader();
        loader.parse(
          buffer,
          '',
          (gltf) => {
            applyCustomModel(gltf.scene, file.name);
          },
          (err) => {
            console.error('Failed to parse dropped GLTF file:', err);
          }
        );
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Helper to determine which department room a coordinate belongs to
  const getDepartmentForCoord = (x: number, z: number): string => {
    const isNorth = z < 0;
    if (x < -7.0) return isNorth ? 'exec' : 'design';
    if (x < 7.0) return isNorth ? 'arch' : 'dev';
    return isNorth ? 'sec' : 'ops';
  };

  // 100% COLLISION-FREE 5-STAGE WAYPOINT NAVIGATION (NO WALL CLIPPING!)
  useEffect(() => {
    if (!activeAgentId || !courierPigRef.current) return;
    const targetDesk = DESK_CONFIGS[activeAgentId];
    if (targetDesk) {
      const cur = courierPigRef.current.currentPos;
      const targetDept = DEPARTMENTS[targetDesk.departmentId];
      // Stand in the spacious room walkway directly beside the specialist's desk
      const sideOffset = targetDesk.x >= targetDept.xCenter ? -1.6 : 1.6;
      const deliveryPos = new THREE.Vector3(targetDesk.x + sideOffset, 0, targetDesk.z + 0.35);

      const waypoints: THREE.Vector3[] = [];

      if (Math.abs(cur.z) < 1.0) {
        // Courier is in hallway runner
        // 1. Walk along hallway to target room doorway
        waypoints.push(new THREE.Vector3(targetDept.doorX, 0, 0));
        // 2. Step through open doorway into target room
        waypoints.push(new THREE.Vector3(targetDept.doorX, 0, targetDept.doorInsideZ));
        // 3. Walk from doorway directly to employee desk side
        waypoints.push(deliveryPos);
      } else {
        // Courier is inside a room
        const currentDeptId = getDepartmentForCoord(cur.x, cur.z);
        const curDept = DEPARTMENTS[currentDeptId];

        if (currentDeptId === targetDesk.departmentId) {
          // Same room: walk to room doorway threshold then to desk side
          waypoints.push(new THREE.Vector3(curDept.doorX, 0, curDept.doorInsideZ));
          waypoints.push(deliveryPos);
        } else {
          // Different rooms:
          // 1. Walk to current room doorway inside threshold
          waypoints.push(new THREE.Vector3(curDept.doorX, 0, curDept.doorInsideZ));
          // 2. Step out through current doorway into the corridor
          waypoints.push(new THREE.Vector3(curDept.doorX, 0, 0));
          // 3. Trot along central hallway to target doorway
          waypoints.push(new THREE.Vector3(targetDept.doorX, 0, 0));
          // 4. Step through target doorway into target room
          waypoints.push(new THREE.Vector3(targetDept.doorX, 0, targetDept.doorInsideZ));
          // 5. Walk inside target room directly to employee desk side
          waypoints.push(deliveryPos);
        }
      }

      courierPigRef.current.waypoints = waypoints;

      // Automatically focus camera on target department room
      setSelectedDeptId(targetDesk.departmentId);
      if (targetDept) {
        targetCamPos.current.set(...targetDept.cameraPos);
        targetControlsLookAt.current.set(...targetDept.cameraTarget);
        isTransitioningCam.current = true;
      }
    }
  }, [activeAgentId]);

  // Department Camera Navigation Handler
  const handleSelectDepartment = (deptId: string) => {
    setSelectedDeptId(deptId);
    if (deptId === 'all') {
      if (isFullscreen) {
        targetCamPos.current.set(0, 20, 24);
        targetControlsLookAt.current.set(0, 0.8, 0);
      } else {
        targetCamPos.current.set(0, 24, 27);
        targetControlsLookAt.current.set(0, 1.2, 0);
      }
      isTransitioningCam.current = true;
    } else {
      const dept = DEPARTMENTS[deptId];
      if (dept) {
        targetCamPos.current.set(...dept.cameraPos);
        targetControlsLookAt.current.set(...dept.cameraTarget);
        isTransitioningCam.current = true;
      }
    }
  };

  // Reset Camera View to Full Overview
  const handleResetCamera = () => {
    setSelectedDeptId('all');
    if (isFullscreen) {
      targetCamPos.current.set(0, 20, 24);
      targetControlsLookAt.current.set(0, 0.8, 0);
    } else {
      targetCamPos.current.set(0, 24, 27);
      targetControlsLookAt.current.set(0, 1.2, 0);
    }
    isTransitioningCam.current = true;
  };

  // Focus directly on active agent's desk
  const handleFocusActive = () => {
    if (!activeAgentId) return;
    const desk = DESK_CONFIGS[activeAgentId];
    if (desk) {
      setSelectedDeptId(desk.departmentId);
      targetControlsLookAt.current.set(desk.x, 1.2, desk.z);
      targetCamPos.current.set(desk.x, 7.5, desk.z + (desk.z > 0 ? 7 : -7));
      isTransitioningCam.current = true;
      setSelectedPig(desk);
    }
  };

  const DEPT_BUTTONS = [
    { id: 'all', label: 'All Office (ภาพรวม)', icon: Building2 },
    { id: 'exec', label: 'Executive (ผู้บริหาร)', icon: Briefcase },
    { id: 'design', label: 'Design (ออกแบบ)', icon: Palette },
    { id: 'arch', label: 'Arch & Data (ระบบ)', icon: Server },
    { id: 'dev', label: 'Dev Lab (โค้ดดิ้ง)', icon: Code },
    { id: 'sec', label: 'Security & QA', icon: Shield },
    { id: 'ops', label: 'Maintenance (ซ่อมบำรุง)', icon: Wrench },
  ];

  return (
    <div
      className={
        isFullscreen
          ? 'relative w-full h-full flex-1 min-h-0 bg-slate-950 overflow-hidden select-none flex flex-col'
          : 'relative w-full bg-slate-100 rounded-2xl overflow-hidden border border-slate-300 shadow-sm select-none'
      }
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden file input for custom .glb upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".glb,.gltf"
        onChange={handleModelUpload}
        className="hidden"
      />

      {/* Drag & Drop Visual Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-rose-500/15 backdrop-blur-xs border-2 border-dashed border-rose-500 flex flex-col items-center justify-center pointer-events-none rounded-2xl">
          <Upload className="w-10 h-10 text-rose-600 animate-bounce mb-2" />
          <span className="text-sm font-bold text-rose-800 bg-white/90 px-3 py-1 rounded-full shadow-sm">
            Drop your LuLu The Piggy .glb model here!
          </span>
        </div>
      )}

      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        className={`w-full cursor-grab active:cursor-grabbing ${
          isFullscreen ? 'w-full h-full min-h-0 flex-1' : 'h-[520px]'
        }`}
      />

      {/* Top Header Controls Bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none gap-2">
        {/* Office Status Badge */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-xs pointer-events-auto ${
            isFullscreen
              ? 'bg-slate-900/90 backdrop-blur-md border-slate-700 text-white'
              : 'bg-white/95 backdrop-blur-md border-slate-200/90 text-slate-800'
          }`}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold font-mono tracking-tight">
            LULU PIGGY HQ (6 DEPARTMENTS DIORAMA)
          </span>
          {customModelName ? (
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono font-bold flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>CUSTOM .GLB: {customModelName}</span>
            </span>
          ) : (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 border border-rose-200 font-mono font-bold">
              10 SPECIALISTS • GLASS PARTITIONED
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {activeAgentId && (
            <button
              type="button"
              onClick={handleFocusActive}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer animate-pulse"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Follow Piggy</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleResetCamera}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium shadow-2xs transition-colors cursor-pointer ${
              isFullscreen
                ? 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-200'
                : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
            title="Reset isometric angle"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>
        </div>
      </div>

      {/* Department Quick-Jump Navigation Tabs */}
      <div className="absolute top-14 left-3 right-3 flex items-center gap-1.5 overflow-x-auto pb-1 pointer-events-auto scrollbar-none">
        <div
          className={`flex items-center gap-1 p-1 rounded-xl border shadow-xs ${
            isFullscreen
              ? 'bg-slate-900/90 backdrop-blur-md border-slate-700'
              : 'bg-white/90 backdrop-blur-md border-slate-200'
          }`}
        >
          {DEPT_BUTTONS.map((dept) => {
            const Icon = dept.icon;
            const isSelected = selectedDeptId === dept.id;
            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => handleSelectDepartment(dept.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? isFullscreen
                      ? 'bg-blue-600 text-white shadow-xs font-semibold'
                      : 'bg-slate-900 text-white shadow-xs font-semibold'
                    : isFullscreen
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-rose-400' : 'text-slate-400'}`} />
                <span>{dept.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Bottom Info & Courier Notification */}
      <div className="absolute bottom-3 left-3 right-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pointer-events-none">
        {/* Live Pig Activity Readout */}
        <div
          className={`p-2.5 rounded-xl border shadow-sm pointer-events-auto flex items-center gap-3 text-xs ${
            isFullscreen
              ? 'bg-slate-900/90 backdrop-blur-md border-slate-700 text-slate-200'
              : 'bg-white/95 backdrop-blur-md border-slate-200 text-slate-800'
          }`}
        >
          {activeAgentId && DESK_CONFIGS[activeAgentId] ? (
            <>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-2xs"
                style={{ backgroundColor: DESK_CONFIGS[activeAgentId].color }}
              >
                OINK
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${isFullscreen ? 'text-white' : 'text-slate-900'}`}>
                    {DESK_CONFIGS[activeAgentId].name} (LuLu Piggy)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    [{DESK_CONFIGS[activeAgentId].departmentName}]
                  </span>
                </div>
                <div className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-0.5">
                  <Activity className="w-3 h-3 animate-spin" />
                  <span>
                    Typing furiously at 140 WPM inside {DESK_CONFIGS[activeAgentId].departmentName}...
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className={`flex items-center gap-2 text-[11px] ${isFullscreen ? 'text-slate-300' : 'text-slate-500'}`}>
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>
                10 LuLu Piglets seated in 6 partitioned departments with Spam cans. Click any department tab above to explore!
              </span>
            </div>
          )}
        </div>

        {/* Quick Instructions Badge */}
        <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-[10px] font-mono pointer-events-auto flex items-center gap-2 border border-slate-800">
          <span>MOUSE: CLICK ANY PIGLET TO INSPECT & EDIT PROMPT • DRAG TO ROTATE 360° • SCROLL ZOOM</span>
        </div>
      </div>
    </div>
  );
};

export const LuluOffice3D = CatOffice3D;

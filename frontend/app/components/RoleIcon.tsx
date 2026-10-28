'use client';

import React from 'react';
import {
  Briefcase,
  ClipboardList,
  Palette,
  Network,
  Database,
  Server,
  Monitor,
  Code2,
  ShieldAlert,
  ShieldCheck,
  Wrench,
  Cpu,
} from 'lucide-react';

interface RoleIconProps {
  name?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const RoleIcon: React.FC<RoleIconProps> = ({ name, className = 'w-4 h-4', style }) => {
  const normalized = (name || '').toLowerCase();

  // Leadership & Product
  if (normalized.includes('ceo') || normalized.includes('briefcase') || normalized.includes('alex')) {
    return <Briefcase className={className} style={style} />;
  }
  if (normalized.includes('pm') || normalized.includes('clipboard') || normalized.includes('sophia')) {
    return <ClipboardList className={className} style={style} />;
  }
  // Design & Experience
  if (normalized.includes('designer') || normalized.includes('palette') || normalized.includes('maya') || normalized.includes('ux') || normalized.includes('ui')) {
    return <Palette className={className} style={style} />;
  }
  // Engineering Architecture
  if (normalized.includes('arch') || normalized.includes('network') || normalized.includes('marcus')) {
    return <Network className={className} style={style} />;
  }
  // Database
  if (normalized.includes('database') || normalized.includes('db') || normalized.includes('vikram') || normalized.includes('data')) {
    return <Database className={className} style={style} />;
  }
  // Backend
  if (normalized.includes('backend') || normalized.includes('server') || normalized.includes('sean') || normalized.includes('api')) {
    return <Server className={className} style={style} />;
  }
  // Frontend
  if (normalized.includes('frontend') || normalized.includes('monitor') || normalized.includes('client')) {
    return <Monitor className={className} style={style} />;
  }
  // Developer (legacy)
  if (normalized.includes('dev') || normalized.includes('code') || normalized.includes('david')) {
    return <Code2 className={className} style={style} />;
  }
  // Security
  if (normalized.includes('security') || normalized.includes('sec') || normalized.includes('samira') || normalized.includes('lock')) {
    return <ShieldAlert className={className} style={style} />;
  }
  // Quality Assurance
  if (normalized.includes('qa') || normalized.includes('shield') || normalized.includes('elena') || normalized.includes('test')) {
    return <ShieldCheck className={className} style={style} />;
  }
  // Maintenance & Operations
  if (
    normalized.includes('maint') ||
    normalized.includes('wrench') ||
    normalized.includes('lucas') ||
    normalized.includes('support') ||
    normalized.includes('fix') ||
    normalized.includes('ops')
  ) {
    return <Wrench className={className} style={style} />;
  }

  return <Cpu className={className} style={style} />;
};

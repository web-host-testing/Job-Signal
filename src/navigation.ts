import { Bookmark, Radar, Settings, type LucideIcon } from 'lucide-react';

export interface PrimaryNavLink {
  name: string;
  href: string;
  icon: LucideIcon;
}

export const primaryNavLinks: PrimaryNavLink[] = [
  { name: 'New Jobs', href: '/', icon: Radar },
  { name: 'My Jobs', href: '/saved', icon: Bookmark },
  { name: 'Settings', href: '/prefs', icon: Settings },
];

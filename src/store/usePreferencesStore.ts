import { useState, useEffect } from 'react';
import type { WorkAuthorizationStatus } from '../types';

export type ResumeLane = 'kitchen' | 'warehouse' | 'general';

export interface ResumeProfile {
  id: string;
  title: string;
  targetLane: ResumeLane;
  resumeText: string;
  notes: string;
  lastUpdated: string;
  isDefaultForLane: boolean;
}

export interface PreferencesState {
  commuteOrigin: string;
  marketProvinceCode: string;
  marketProvinceName: string;
  marketCity: string;
  marketLabel: string;
  maxTransitMinutes: number;
  minWeeklyHours: number;
  workAuthorization: WorkAuthorizationStatus;
  availability: {
    weekdays: boolean;
    weekends: boolean;
    evenings: boolean;
    overnights: boolean;
    rotatingShifts: boolean;
  };
  certifications: {
    foodSafety: boolean;
    warehouseCerts: string;
  };
  resumeProfiles: ResumeProfile[];
  enabledLanes: {
    warehouse: boolean;
    kitchen: boolean;
  };
}

const DEFAULT_PREFERENCES: PreferencesState = {
  commuteOrigin: 'Downtown Toronto',
  marketProvinceCode: 'ON',
  marketProvinceName: 'Ontario',
  marketCity: 'Toronto',
  marketLabel: 'Toronto, ON',
  maxTransitMinutes: 60,
  minWeeklyHours: 30,
  workAuthorization: 'citizen_or_pr',
  availability: {
    weekdays: true,
    weekends: true,
    evenings: true,
    overnights: true,
    rotatingShifts: true,
  },
  certifications: {
    foodSafety: true,
    warehouseCerts: '',
  },
  resumeProfiles: [
    {
      id: 'rp-kitchen',
      title: 'Kitchen CV',
      targetLane: 'kitchen',
      resumeText: '',
      notes: '',
      lastUpdated: new Date().toISOString(),
      isDefaultForLane: true
    },
    {
      id: 'rp-warehouse',
      title: 'Warehouse CV',
      targetLane: 'warehouse',
      resumeText: '',
      notes: '',
      lastUpdated: new Date().toISOString(),
      isDefaultForLane: true
    },
    {
      id: 'rp-general',
      title: 'General / Quick Win CV',
      targetLane: 'general',
      resumeText: '',
      notes: '',
      lastUpdated: new Date().toISOString(),
      isDefaultForLane: true
    }
  ],
  enabledLanes: {
    warehouse: true,
    kitchen: true,
  }
};

const STORAGE_KEY = 'job-radar-preferences';

let globalPreferences = { ...DEFAULT_PREFERENCES };

try {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    globalPreferences = { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
  }
} catch (e) {
  console.error("Failed to load preferences", e);
}

const listeners = new Set<() => void>();

function notify() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(globalPreferences));
  listeners.forEach(l => l());
}

export function updatePreferencesGlobal(newPrefs: Partial<PreferencesState>) {
  globalPreferences = { ...globalPreferences, ...newPrefs };
  notify();
}

export function usePreferencesStore() {
  const [stamp, setStamp] = useState(0);

  useEffect(() => {
    const l = () => setStamp(s => s + 1);
    listeners.add(l);
    return () => listeners.delete(l);
  }, []);

  return {
    preferences: globalPreferences,
    updatePreferences: updatePreferencesGlobal
  };
}

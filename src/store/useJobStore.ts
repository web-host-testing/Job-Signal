import { useState, useEffect } from 'react';
import { JOB_STATUSES, JobStatus } from '../types';

export interface JobState {
  [jobId: string]: JobStatus;
}

const STORAGE_KEY = 'job-radar-state';
const PREVIOUS_STORAGE_KEY = 'job-radar-prev-state';

let globalState: JobState = {};
let previousState: JobState = {};

const validStatuses = new Set<JobStatus>(JOB_STATUSES);

function sanitizeStatus(value: unknown): JobStatus {
  return typeof value === 'string' && validStatuses.has(value as JobStatus)
    ? (value as JobStatus)
    : 'new';
}

function sanitizeJobState(value: unknown): JobState {
  if (!value || typeof value !== 'object') {
    return {};
  }

  return Object.entries(value as Record<string, unknown>).reduce<JobState>((acc, [jobId, status]) => {
    const sanitizedStatus = sanitizeStatus(status);
    if (sanitizedStatus !== 'new') {
      acc[jobId] = sanitizedStatus;
    }
    return acc;
  }, {});
}

try {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) globalState = sanitizeJobState(JSON.parse(stored));
  const prevStored = localStorage.getItem(PREVIOUS_STORAGE_KEY);
  if (prevStored) previousState = sanitizeJobState(JSON.parse(prevStored));
} catch (e) {
  console.error("Failed to load state", e);
}

const listeners = new Set<() => void>();

function notify() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(globalState));
  localStorage.setItem(PREVIOUS_STORAGE_KEY, JSON.stringify(previousState));
  listeners.forEach(l => l());
}

export function updateJobStatusGlobal(jobId: string, status: JobStatus) {
  const currentStatus = getStatusGlobal(jobId);

  if (currentStatus === status) {
    return;
  }

  if (currentStatus === 'new') {
    delete previousState[jobId];
  } else {
    previousState[jobId] = currentStatus;
  }

  if (status === 'new') {
    delete globalState[jobId];
  } else {
    globalState[jobId] = status;
  }

  notify();
}

export function getStatusGlobal(jobId: string): JobStatus {
  return globalState[jobId] || 'new';
}

export function getPreviousStatusGlobal(jobId: string): JobStatus {
  return previousState[jobId] || 'new';
}

export function useJobStore() {
  const [stamp, setStamp] = useState(0);

  useEffect(() => {
    const l = () => setStamp(s => s + 1);
    listeners.add(l);
    return () => listeners.delete(l);
  }, []);

  return {
    jobStates: globalState,
    updateJobStatus: updateJobStatusGlobal,
    getStatus: getStatusGlobal,
    getPreviousStatus: getPreviousStatusGlobal
  };
}

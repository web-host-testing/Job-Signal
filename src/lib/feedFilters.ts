import type { Job, WorkAuthorizationStatus } from '../types';
import { getFitRank as getStructuredFitRank } from './fitLogic';

export function parseNumericValue(input: string | null | undefined): number | null {
  if (!input) return null;

  const match = input.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;

  const parsed = Number.parseFloat(match[1]);
  return Number.isNaN(parsed) ? null : parsed;
}

export function getRealisticHours(job: Job): number | null {
  return parseNumericValue(job.analysis.estimatedRealisticHours);
}

export function getFitRank(job: Job, workAuthorization?: WorkAuthorizationStatus): number {
  return getStructuredFitRank(job, workAuthorization);
}

export function getHireChanceRank(job: Job): number {
  if (job.analysis.hireChance === 'High') return 3;
  if (job.analysis.hireChance === 'Medium') return 2;
  return 1;
}

export function getRiskRank(job: Job): number {
  if (job.analysis.companyRisk === 'Low') return 1;
  if (job.analysis.companyRisk === 'Medium') return 2;
  return 3;
}

export function compareByPostedDateDescending(a: Job, b: Job): number {
  return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
}

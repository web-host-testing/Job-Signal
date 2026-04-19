import { Job } from '../types';
import { parseNumericValue } from './feedFilters';
import type { SignalTone } from '../components/ui/SignalBadge';
import { getFitAssessment, getRequirementGapCount } from './fitLogic';
import type { WorkAuthorizationStatus } from '../types';

export type RecommendationTier = 'Top Pick' | 'Strong Pick' | 'Worth a Look' | 'Low Priority';

interface RecommendationPreferences {
  minWeeklyHours: number;
  maxTransitMinutes: number;
  workAuthorization: WorkAuthorizationStatus;
}

export function getFitTone(fitTag: string): SignalTone {
  const normalized = fitTag.toLowerCase();

  if (normalized.includes('strong') || normalized.includes('solid')) return 'success';
  if (normalized.includes('stretch')) return 'warning';
  if (normalized.includes('low')) return 'danger';
  return 'neutral';
}

export function getJobRecommendation(job: Job, preferences: RecommendationPreferences) {
  const { analysis } = job;
  const fitAssessment = getFitAssessment(analysis, preferences.workAuthorization);
  const fitTone =
    fitAssessment.tone === 'danger'
      ? 'danger'
      : fitAssessment.tone === 'warning'
        ? 'warning'
        : fitAssessment.tone === 'success'
          ? 'success'
          : getFitTone(analysis.fitTag);
  const realisticHoursNumber = parseNumericValue(analysis.estimatedRealisticHours);
  const gapCount = getRequirementGapCount(analysis, preferences.workAuthorization);

  const fitScore = (() => {
    return Math.max(fitAssessment.rank - 1, 0);
  })();

  const hireScore = analysis.hireChance === 'High' ? 3 : analysis.hireChance === 'Medium' ? 2 : 0;

  const hoursScore = (() => {
    if (realisticHoursNumber === null) return 1;
    if (realisticHoursNumber >= preferences.minWeeklyHours) return 3;
    if (realisticHoursNumber >= preferences.minWeeklyHours * 0.8) return 2;
    if (realisticHoursNumber > 0) return 1;
    return 0;
  })();

  const commuteScore = (() => {
    if (job.transitTimeMins <= preferences.maxTransitMinutes * 0.75) return 3;
    if (job.transitTimeMins <= preferences.maxTransitMinutes) return 2;
    if (job.transitTimeMins <= preferences.maxTransitMinutes + 15) return 1;
    return 0;
  })();

  const riskScore = analysis.companyRisk === 'Low' ? 3 : analysis.companyRisk === 'Medium' ? 2 : 0;

  const weightedScore =
    fitScore * 0.3 +
    hireScore * 0.25 +
    hoursScore * 0.2 +
    commuteScore * 0.15 +
    riskScore * 0.1 +
    (analysis.isQuickWin ? 0.15 : 0);

  let tier: RecommendationTier = 'Strong Pick';

  if (
    fitAssessment.hardBlockerCount > 0 ||
    (analysis.hireChance === 'Low' && analysis.companyRisk === 'High') ||
    commuteScore === 0
  ) {
    tier = 'Low Priority';
  } else if (
    gapCount > 0 ||
    analysis.hireChance === 'Low' ||
    hoursScore <= 1
  ) {
    tier = 'Worth a Look';
  } else if (weightedScore >= 2.75) {
    tier = 'Top Pick';
  } else if (weightedScore >= 1.95) {
    tier = 'Strong Pick';
  } else if (weightedScore >= 1.1) {
    tier = 'Worth a Look';
  } else {
    tier = 'Low Priority';
  }

  const positiveReasons: string[] = [];
  const cautionReasons: string[] = [];

  if (gapCount === 0 && fitTone === 'success') {
    positiveReasons.push('good fit');
  } else if (gapCount === 0) {
    positiveReasons.push('requirements covered');
  } else if (gapCount === 1) {
    cautionReasons.push('one requirement gap');
  } else {
    cautionReasons.push('multiple requirement gaps');
  }

  if (hoursScore >= 3) {
    positiveReasons.push('solid hours');
  } else if (hoursScore <= 1) {
    cautionReasons.push('weaker hours');
  }

  if (commuteScore >= 2) {
    positiveReasons.push('manageable commute');
  } else if (commuteScore === 1) {
    cautionReasons.push('long commute');
  } else {
    cautionReasons.push('tough commute');
  }

  if (riskScore >= 3) {
    positiveReasons.push('low risk');
  } else if (riskScore === 0) {
    cautionReasons.push('higher risk');
  }

  if (hireScore >= 3) {
    positiveReasons.push('good hiring odds');
  } else if (hireScore === 0) {
    cautionReasons.push('low hiring odds');
  }

  const reasonBits =
    tier === 'Top Pick' || tier === 'Strong Pick'
      ? positiveReasons.slice(0, 2)
      : [...cautionReasons.slice(0, 2), ...positiveReasons.slice(0, 1)].slice(0, 2);

  const tone: SignalTone =
    tier === 'Top Pick'
      ? 'quick-win'
      : tier === 'Strong Pick'
        ? 'success'
        : tier === 'Worth a Look'
          ? 'warning'
          : 'neutral';

  return {
    tier,
    tone,
    reason: reasonBits.join(', '),
  };
}

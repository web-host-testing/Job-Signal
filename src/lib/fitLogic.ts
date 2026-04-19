import type {
  Job,
  JobAnalysis,
  JobRequirement,
  JobRequirementCategory,
  JobRequirementStatus,
  JobWorkAuthorizationRule,
  WorkAuthorizationStatus,
} from '../types';

export type FitSignalTone = 'neutral' | 'success' | 'warning' | 'danger';

const categoryOrder: Record<JobRequirementCategory, number> = {
  license: 0,
  experience: 1,
  skill: 2,
  workAuth: 3,
};

function resolveWorkAuthorizationStatus(
  rule: JobWorkAuthorizationRule | undefined,
  workAuthorization: WorkAuthorizationStatus | undefined,
): JobRequirementStatus {
  if (!rule || !workAuthorization) return 'likely';

  switch (rule) {
    case 'citizen_or_pr_only':
      return workAuthorization === 'citizen_or_pr' ? 'met' : 'missing';
    case 'open_or_permanent':
      return workAuthorization === 'citizen_or_pr' || workAuthorization === 'open_work_permit'
        ? 'met'
        : 'missing';
    case 'any_existing_work_authorization':
      return workAuthorization === 'needs_sponsorship' ? 'missing' : 'met';
    case 'sponsorship_available':
      return 'met';
    default:
      return 'likely';
  }
}

function legacyRequirementsFromAnalysis(analysis: JobAnalysis): JobRequirement[] {
  return analysis.hardRequirements.map((label) => ({
    label,
    category: 'skill' as const,
    required: true,
    status: analysis.unmetHardRequirements.includes(label) ? ('missing' as JobRequirementStatus) : ('met' as JobRequirementStatus),
  }));
}

export function getRequirements(
  analysis: JobAnalysis,
  workAuthorization?: WorkAuthorizationStatus,
): JobRequirement[] {
  const requirements = analysis.requirements && analysis.requirements.length > 0
    ? analysis.requirements
    : legacyRequirementsFromAnalysis(analysis);

  return requirements
    .map((requirement) =>
      requirement.category === 'workAuth'
        ? {
            ...requirement,
            status: resolveWorkAuthorizationStatus(
              requirement.workAuthorizationRule,
              workAuthorization,
            ),
          }
        : requirement,
    )
    .sort((a, b) => {
    const categoryDelta = categoryOrder[a.category] - categoryOrder[b.category];
    if (categoryDelta !== 0) return categoryDelta;
    return a.label.localeCompare(b.label);
  });
}

export function getRequirementGapCount(
  analysis: JobAnalysis,
  workAuthorization?: WorkAuthorizationStatus,
): number {
  return getRequirements(analysis, workAuthorization).filter(
    (requirement) =>
      requirement.required &&
      (requirement.status === 'partial' || requirement.status === 'missing')
  ).length;
}

export function getHardBlockerCount(
  analysis: JobAnalysis,
  workAuthorization?: WorkAuthorizationStatus,
): number {
  return getRequirements(analysis, workAuthorization).filter((requirement) => {
    if (!requirement.required) return false;
    if (requirement.category === 'license' || requirement.category === 'workAuth') {
      return requirement.status === 'partial' || requirement.status === 'missing';
    }

    if (requirement.category === 'experience') {
      return requirement.status === 'missing';
    }

    return false;
  }).length;
}

export function getLegacyFitRank(fitTag: string): number {
  const fit = fitTag.toLowerCase();

  if (fit.includes('strong') || fit.includes('solid')) return 4;
  if (fit.includes('stretch')) return 2;
  if (fit.includes('low')) return 1;
  return 3;
}

export function getFitAssessment(
  analysis: JobAnalysis,
  workAuthorization?: WorkAuthorizationStatus,
) {
  const requirements = getRequirements(analysis, workAuthorization);
  const gapCount = getRequirementGapCount(analysis, workAuthorization);
  const hardBlockerCount = getHardBlockerCount(analysis, workAuthorization);
  const legacyRank = getLegacyFitRank(analysis.fitTag);

  let rank = 3;

  if (hardBlockerCount > 0 || gapCount >= 2 || legacyRank <= 1) {
    rank = 1;
  } else if (gapCount === 1 || legacyRank === 2) {
    rank = 2;
  } else if (legacyRank >= 4) {
    rank = 4;
  } else {
    rank = 3;
  }

  const label =
    rank >= 4 ? 'Strong fit' : rank === 3 ? 'Good fit' : rank === 2 ? 'Partial fit' : 'Low fit';

  const tone: FitSignalTone =
    rank >= 3 ? 'success' : rank === 2 ? 'warning' : 'danger';

  return {
    label,
    tone,
    rank,
    requirements,
    gapCount,
    hardBlockerCount,
  };
}

export function getFitRank(job: Job, workAuthorization?: WorkAuthorizationStatus): number {
  return getFitAssessment(job.analysis, workAuthorization).rank;
}

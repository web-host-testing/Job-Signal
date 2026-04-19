export const JOB_STATUSES = ['new', 'saved', 'applied'] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];
export type JobLane = 'warehouse' | 'kitchen';
export type JobRequirementCategory = 'license' | 'experience' | 'skill' | 'workAuth';
export type JobRequirementStatus = 'met' | 'likely' | 'partial' | 'missing';
export type WorkAuthorizationStatus =
  | 'citizen_or_pr'
  | 'open_work_permit'
  | 'employer_specific_permit'
  | 'needs_sponsorship';
export type JobWorkAuthorizationRule =
  | 'citizen_or_pr_only'
  | 'open_or_permanent'
  | 'any_existing_work_authorization'
  | 'sponsorship_available';

export interface JobRequirement {
  label: string;
  category: JobRequirementCategory;
  required: boolean;
  status: JobRequirementStatus;
  note?: string;
  workAuthorizationRule?: JobWorkAuthorizationRule;
}

export interface JobAnalysis {
  listedHours: string | null;
  estimatedRealisticHours: string;
  hoursRealityCheck: string;
  requirements?: JobRequirement[];
  hardRequirements: string[];
  unmetHardRequirements: string[];
  hireChance: 'High' | 'Medium' | 'Low';
  hireChanceReasoning: string;
  companyRisk: 'Low' | 'Medium' | 'High';
  companyRiskReasoning: string;
  repostTag: string; 
  repostSignals: string;
  isQuickWin: boolean;
  fitTag: string; 
}

export interface JobSource {
  name: string;
  kind?: 'company' | 'government' | 'aggregator' | 'board';
  listingUrl?: string | null;
  applyUrl?: string | null;
  isPrimaryApply?: boolean;
}

export interface Job {
  id: string;
  title: string;
  employer: string;
  lane: JobLane;
  postedDate: string; 
  location: string;
  transitTimeMins: number; 
  paySummary?: string | null;
  sourceName?: string | null;
  sourceUrl?: string | null;
  applyUrl?: string | null;
  applyLabel?: string | null;
  sources?: JobSource[];
  routeSummary: string;
  rawListing: string;
  analysis: JobAnalysis;
}

export interface CandidateProfile {
  maxTransitTimeMins: number;
  minTargetHours: number;
  availability: string[];
  certifications: string[];
  workAuthorization: WorkAuthorizationStatus;
  kitchenFit: string[];
  warehouseFit: string[];
}

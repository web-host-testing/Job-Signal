import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertTriangle,
  ArrowLeft,
  Bus,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CircleX,
  Clock,
  Eye,
  ExternalLink,
  Heart,
  Info,
  Share2,
  ShieldCheck,
  Star,
  Target,
  ThumbsUp,
} from 'lucide-react';
import {
  ActionIcon,
  Box,
  Button,
  Flex,
  Group,
  Menu,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import { MOCK_JOBS } from '../data/mockData';
import { useJobStore } from '../store/useJobStore';
import { usePreferencesStore } from '../store/usePreferencesStore';
import { showToast } from '../store/useToastStore';
import { JobSource, JobStatus } from '../types';
import { SignalBadge } from '../components/ui/SignalBadge';
import { parseNumericValue } from '../lib/feedFilters';
import { getJobRecommendation } from '../lib/jobRecommendation';
import { getFitAssessment, getRequirementGapCount } from '../lib/fitLogic';

export function JobDetail({ embeddedId }: { embeddedId?: string }) {
  const { id: paramId } = useParams<{ id: string }>();
  const id = embeddedId || paramId;
  const isEmbedded = !!embeddedId;
  const navigate = useNavigate();
  const { getStatus, updateJobStatus, getPreviousStatus } = useJobStore();
  const { preferences } = usePreferencesStore();
  const [copied, setCopied] = useState(false);
  const [hiddenSourceLogos, setHiddenSourceLogos] = useState<Record<string, true>>({});

  const job = MOCK_JOBS.find((entry) => entry.id === id);

  if (!job) {
    return (
      <Flex p="md" mt={40} c="ink.8" flex={1} h="100%" align="center" justify="center">
        Job not found.
      </Flex>
    );
  }

  const currentStatus = getStatus(job.id);
  const { analysis } = job;

  const defaultResumeId =
    preferences.resumeProfiles?.find((profile) => profile.targetLane === job.lane)?.id ||
    preferences.resumeProfiles?.find((profile) => profile.isDefaultForLane)?.id ||
    preferences.resumeProfiles?.[0]?.id ||
    '';

  const [selectedResumeId, setSelectedResumeId] = useState(defaultResumeId);

  const handleUndoApplied = () => {
    const previousStatus = getPreviousStatus(job.id);
    const destination = previousStatus === 'saved' ? 'saved' : 'new';
    updateJobStatus(job.id, destination);

    if (destination === 'saved') {
      showToast('Returned to Saved');
    }
  };

  const handleStatusChange = (status: JobStatus) => {
    updateJobStatus(job.id, status);

    if (status === 'saved') {
      showToast('Job saved', 'Undo', () => updateJobStatus(job.id, 'new'));
    } else if (status === 'applied') {
      showToast('Job marked as applied', 'Undo', handleUndoApplied);
    }
  };

  const handleToggleSave = () => {
    if (currentStatus === 'saved') {
      updateJobStatus(job.id, 'new');
      showToast('Removed from saved', 'Undo', () => updateJobStatus(job.id, 'saved'));
      return;
    }

    handleStatusChange('saved');
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${job.title} at ${job.employer}`,
          text: `${job.title} at ${job.employer}`,
          url: shareUrl,
        });
        showToast('Job link shared');
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      showToast('Job link copied');
    } catch {
      showToast('Unable to share right now');
    }
  };

  const generatePromptPack = () => {
    const selectedProfile = preferences.resumeProfiles.find((profile) => profile.id === selectedResumeId);
    const resumeText = selectedProfile?.resumeText || 'No resume text provided.';
    const resumeNotes = selectedProfile?.notes || 'No resume notes provided.';

    const text = `
[JOB RADAR CV TAILORING PROMPT]
Act as an expert resume writer. I am applying for the following job. Please tailor my resume summary, experience bullets, and skills section to match the job requirements exactly, without hallucinating any experience I do not have.

--- JOB DETAILS ---
Title: ${job.title}
Employer: ${job.employer}
Lane: ${job.lane}
Listed Hours: ${analysis.listedHours || 'Not specified'}
Expected Realistic Hours: ${analysis.estimatedRealisticHours}
Hard Requirements: ${fitAssessment.requirements.filter((requirement) => requirement.required).map((requirement) => requirement.label).join(', ')}

--- APP ANALYSIS (Context for tailoring) ---
Hire Chance: ${analysis.hireChance} (${analysis.hireChanceReasoning})
Company Risk: ${analysis.companyRisk} (${analysis.companyRiskReasoning})
Hours Reality: ${analysis.hoursRealityCheck}

--- CANDIDATE PROFILE ---
Target Hours: ${preferences.minWeeklyHours}+
Availability: ${Object.entries(preferences.availability)
  .filter(([, enabled]) => enabled)
  .map(([key]) => key)
  .join(', ')}
Certifications: FOOD SAFETY: ${preferences.certifications.foodSafety ? 'Yes' : 'No'} | WAREHOUSE: ${preferences.certifications.warehouseCerts || 'None'}
Work Authorization: ${preferences.workAuthorization}
Resume Profile: ${selectedProfile?.title || 'Unknown'}
Background Notes:
${resumeNotes}

--- RESUME TEXT ---
${resumeText}

--- ANTI-HALLUCINATION INSTRUCTION ---
Do not add any certifications, degrees, or specific software knowledge unless it is listed in my candidate profile. If the job requires a skill I do not have, focus on transferable skills from my general fit areas. Highlight reliability and availability.
    `.trim();

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  let postedTime = 'Recently';
  try {
    postedTime = formatDistanceToNow(new Date(job.postedDate), { addSuffix: true });
  } catch {
    // Ignore invalid demo dates.
  }

  const selectData =
    preferences.resumeProfiles.length === 0
      ? [{ value: '', label: 'No Resume Profiles setup' }]
      : preferences.resumeProfiles.map((profile) => ({
          value: profile.id,
          label: `${profile.title} ${profile.targetLane ? `(${profile.targetLane})` : ''}`,
        }));

  const fitAssessment = getFitAssessment(analysis, preferences.workAuthorization);
  const fitTone = fitAssessment.tone;
  const fitGapCount = getRequirementGapCount(analysis, preferences.workAuthorization);

  const fallbackSources: JobSource[] = job.sourceName || job.sourceUrl || job.applyUrl
    ? [
        {
          name: job.sourceName || 'Source',
          kind: 'board' as const,
          listingUrl: job.sourceUrl || job.applyUrl || null,
          applyUrl: job.applyUrl || job.sourceUrl || null,
        },
      ]
    : [];

  const normalizedSources = (job.sources && job.sources.length > 0 ? job.sources : fallbackSources).filter(
    (source) => source.listingUrl || source.applyUrl
  );

  const primarySource =
    normalizedSources.find((source) => source.isPrimaryApply && (source.applyUrl || source.listingUrl)) ||
    normalizedSources.find((source) => source.kind === 'company' && source.applyUrl) ||
    normalizedSources.find((source) => source.applyUrl) ||
    normalizedSources[0] ||
    null;

  const primaryActionUrl = primarySource ? primarySource.applyUrl || primarySource.listingUrl || null : null;
  const primaryHasDistinctApplyUrl = Boolean(
    primarySource?.applyUrl &&
      primarySource?.listingUrl &&
      primarySource.applyUrl !== primarySource.listingUrl
  );
  const jobPostUrl = primarySource?.listingUrl || primaryActionUrl || null;
  const employerSource =
    normalizedSources.find((source) => source.kind === 'company' && (source.listingUrl || source.applyUrl)) || null;
  const employerSourceUrl = employerSource?.listingUrl || employerSource?.applyUrl || null;
  const primaryActionLabel = primarySource
    ? currentStatus === 'applied' || !primaryHasDistinctApplyUrl
      ? `Job post on ${primarySource.name}`
      : `Apply on ${primarySource.name}`
    : job.applyLabel || (job.sourceName ? `Job post on ${job.sourceName}` : 'Where to apply');

  const getSourceHost = (url?: string | null) => {
    if (!url) return null;

    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return null;
    }
  };

  const getSourceFavicon = (source: JobSource | null) => {
    const host = getSourceHost(source?.applyUrl || source?.listingUrl || null);
    return host ? `https://www.google.com/s2/favicons?domain=${host}&sz=64` : null;
  };

  const renderExternalLogo = (logoUrl: string | null, size: number) => {
    if (!logoUrl || hiddenSourceLogos[logoUrl]) {
      return null;
    }

    return (
      <Box
        component="img"
        src={logoUrl}
        alt=""
        aria-hidden="true"
        w={size}
        h={size}
        onError={() =>
          setHiddenSourceLogos((current) =>
            current[logoUrl] ? current : { ...current, [logoUrl]: true }
          )
        }
        style={{
          display: 'block',
          borderRadius: 999,
          flexShrink: 0,
        }}
      />
    );
  };

  const renderSourceLogo = (source: JobSource | null, size: number) => {
    const logoUrl = getSourceFavicon(source);
    return renderExternalLogo(logoUrl, size);
  };

  const googleMapsLogoUrl = 'https://www.google.com/s2/favicons?domain=maps.google.com&sz=64';

  const otherSourceActions = normalizedSources.flatMap((source) => {
    const listingUrl = source.listingUrl || null;
    const applyUrl = source.applyUrl || null;
    const isPrimary = source === primarySource;

    if (isPrimary) {
      return [];
    }

    if (listingUrl && applyUrl && listingUrl !== applyUrl) {
      return [
        { key: `${source.name}-view`, label: `View post on ${source.name}`, url: listingUrl, source },
        { key: `${source.name}-apply`, label: `Apply on ${source.name}`, url: applyUrl, source },
      ];
    }

    const singleUrl = applyUrl || listingUrl;
    return singleUrl ? [{ key: `${source.name}-open`, label: `Open on ${source.name}`, url: singleUrl, source }] : [];
  });
  const otherSourceCount = new Set(otherSourceActions.map((action) => action.source.name)).size;

  const fitSummary =
    fitGapCount > 0
      ? `${fitGapCount} requirement${fitGapCount === 1 ? '' : 's'} still need attention.`
      : 'The listed requirements look covered for this role.';

  const realisticHoursNumber = parseNumericValue(analysis.estimatedRealisticHours);
  const listedHoursNumber = parseNumericValue(analysis.listedHours);
  const simplifiedHoursValue =
    realisticHoursNumber !== null
      ? `${realisticHoursNumber} hrs/week`
      : `${analysis.estimatedRealisticHours} / week`;
  const payHeroValue = job.paySummary || 'Pay not listed';
  const hasProminentPay = Boolean(job.paySummary && !/not listed/i.test(job.paySummary));
  const compactListedHours = listedHoursNumber !== null ? `${listedHoursNumber}` : analysis.listedHours || 'N/A';
  const compactRealityHours =
    realisticHoursNumber !== null
      ? `~${realisticHoursNumber}`
      : `~${analysis.estimatedRealisticHours}`;

  const recommendation = getJobRecommendation(job, {
    minWeeklyHours: preferences.minWeeklyHours,
    maxTransitMinutes: preferences.maxTransitMinutes,
    workAuthorization: preferences.workAuthorization,
  });
  const recommendationIcon =
    recommendation.tier === 'Top Pick' ? (
      <Star size={14} />
    ) : recommendation.tier === 'Strong Pick' ? (
      <ThumbsUp size={14} />
    ) : recommendation.tier === 'Worth a Look' ? (
      <Eye size={14} />
    ) : (
      <Clock3 size={14} />
    );
  const metRequirementCount = fitAssessment.requirements.filter(
    (requirement) => requirement.status === 'met' || requirement.status === 'likely'
  ).length;
  const postedAgeMs = Date.now() - new Date(job.postedDate).getTime();
  const postedTimingSummary =
    postedAgeMs <= 1000 * 60 * 60 * 24
      ? 'posted within 24hr'
      : postedAgeMs <= 1000 * 60 * 60 * 24 * 7
        ? 'posted this week'
        : 'older posting';
  const hiringPatternSummary =
    analysis.repostTag === 'Constant hiring'
      ? 'hiring every month'
      : analysis.repostTag === 'Fresh'
        ? 'new opening'
        : analysis.repostTag === 'Standard refresh'
          ? 'steady hiring pattern'
          : analysis.repostTag.toLowerCase();
  const hiringSummary = [
    fitGapCount === 0
      ? fitAssessment.label.toLowerCase()
      : `${fitGapCount} requirement gap${fitGapCount === 1 ? '' : 's'}`,
    hiringPatternSummary,
    postedTimingSummary,
  ].join(', ');
  const employerRiskSummary =
    analysis.companyRisk === 'Low'
      ? realisticHoursNumber !== null
        ? `Established employer, ${realisticHoursNumber} hr schedule shown, standard apply flow`
        : 'Established employer, standard public listing'
      : analysis.companyRisk === 'Medium'
        ? 'Mixed employer signals, verify company details and schedule'
        : 'Limited employer signals, verify pay and stability before applying';
  const googleSearchUrl = (query: string) =>
    `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  const learnMoreLinks = Array.from(
    new Map(
      [
        jobPostUrl
          ? [
              'job-post',
              {
                key: 'job-post',
                label: 'Job post',
                url: jobPostUrl,
              },
            ]
          : null,
        employerSourceUrl
          ? [
              'company-page',
              {
                key: 'company-page',
                label: 'Company page',
                url: employerSourceUrl,
              },
            ]
          : [
              'company-search',
              {
                key: 'company-search',
                label: 'Company page',
                url: googleSearchUrl(`${job.employer} official site`),
              },
            ],
        [
          'glassdoor',
          {
            key: 'glassdoor',
            label: 'Glassdoor',
            url: googleSearchUrl(`${job.employer} Glassdoor reviews`),
          },
        ],
        [
          'reddit',
          {
            key: 'reddit',
            label: 'Reddit',
            url: googleSearchUrl(`${job.employer} reddit jobs`),
          },
        ],
      ] as Array<[string, { key: string; label: string; url: string }] | null>
    ).values()
  );

  const fitCardValue = fitAssessment.label;

  const analysisCards = [
    {
      id: 'hours',
      label: 'Hours',
      value: simplifiedHoursValue,
      icon: Clock,
      background: 'linear-gradient(135deg, #EEF6FF 0%, #F7FBFF 100%)',
      iconBg: '#BEDBFF',
      iconColor: '#0B4A7A',
      description: analysis.hoursRealityCheck,
    },
    {
      id: 'transit',
      label: 'Transit',
      value: `${job.transitTimeMins} min`,
      icon: Bus,
      background: 'linear-gradient(135deg, #ECF8F4 0%, #F6FCF9 100%)',
      iconBg: '#A8DBC8',
      iconColor: '#0F5F4B',
      description: job.routeSummary,
    },
    {
      id: 'fit',
      label: 'Fit',
      value: fitCardValue,
      icon: Target,
      background:
        fitTone === 'success'
          ? 'linear-gradient(135deg, #F2F9E6 0%, #F9FDEE 100%)'
          : fitTone === 'warning'
            ? 'linear-gradient(135deg, #FFF6E1 0%, #FFFBEF 100%)'
            : fitTone === 'danger'
              ? 'linear-gradient(135deg, #FFECEC 0%, #FFF5F5 100%)'
              : 'linear-gradient(135deg, #EEF1EC 0%, #F8F9F7 100%)',
      iconBg:
        fitTone === 'success'
          ? '#CFE59A'
          : fitTone === 'warning'
            ? '#F2D494'
            : fitTone === 'danger'
              ? '#F3B7B7'
              : '#C8CEC2',
      iconColor:
        fitTone === 'success'
          ? '#405A12'
          : fitTone === 'warning'
            ? '#6A4700'
            : fitTone === 'danger'
              ? '#7A1D1D'
              : '#495045',
      description: fitSummary,
    },
  ] as const;

  const sectionSurfaceStyle = {
    border: 'none',
    boxShadow: 'none',
    backgroundColor: 'var(--mantine-color-surface-1)',
    borderRadius: 'var(--app-radius-lg)',
  } as const;

  return (
    <Box
      bg={isEmbedded ? 'surface.0' : 'sage.0'}
      className="pb-safe"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: isEmbedded ? 0 : '100vh',
        height: isEmbedded ? '100%' : 'auto',
        overflowY: isEmbedded ? 'auto' : 'visible',
      }}
    >
      <Box
        w="100%"
        bg={isEmbedded ? 'surface.0' : 'sage.0'}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}
      >
        <Box
          w="100%"
          style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
          }}
        >
          <Box
            component="header"
            bg="surface.0"
            px={{ base: 'md', xl: 'lg' }}
            py={{ base: 'sm', xl: 'md' }}
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 40,
            }}
          >
            <Flex justify="space-between" align="center" w="100%" gap="sm" wrap="nowrap">
              <Group gap="sm" wrap="nowrap">
                {!isEmbedded ? (
                  <Tooltip label="Back" withArrow openDelay={200}>
                    <ActionIcon variant="subtle" color="ink" onClick={() => navigate(-1)} radius="md" aria-label="Back">
                      <ArrowLeft size={20} />
                    </ActionIcon>
                  </Tooltip>
                ) : null}
                <Text size="sm" fw={600} c="ink.6">
                  Job Detail
                </Text>
              </Group>

              <Group gap="xs" wrap="nowrap">
                <Tooltip label="Share job" withArrow openDelay={200}>
                  <ActionIcon
                    variant="subtle"
                    color="ink"
                    onClick={handleShare}
                    aria-label="Share job"
                  >
                    <Share2 size={16} />
                  </ActionIcon>
                </Tooltip>
                {currentStatus !== 'applied' ? (
                  <Tooltip label={currentStatus === 'saved' ? 'Remove from saved' : 'Save job'} withArrow openDelay={200}>
                    <ActionIcon
                      variant={currentStatus === 'saved' ? 'light' : 'subtle'}
                      color={currentStatus === 'saved' ? 'red' : 'ink'}
                      onClick={handleToggleSave}
                      aria-label={currentStatus === 'saved' ? 'Remove from saved' : 'Save job'}
                    >
                      <Heart
                        size={16}
                        fill={currentStatus === 'saved' ? 'currentColor' : 'none'}
                        color={
                          currentStatus === 'saved'
                            ? 'var(--mantine-color-red-6)'
                            : 'currentColor'
                        }
                      />
                    </ActionIcon>
                  </Tooltip>
                ) : null}
                {currentStatus === 'applied' ? (
                  <Button
                    variant="light"
                    color="teal"
                    leftSection={<CheckCircle2 size={16} />}
                    onClick={handleUndoApplied}
                    size="sm"
                  >
                    Applied
                  </Button>
                ) : (
                  <Button variant="outline" color="ink" onClick={() => handleStatusChange('applied')} size="sm">
                    Mark applied
                  </Button>
                )}

              </Group>
            </Flex>
          </Box>

          <Box
            component="main"
            px={{ base: 'md', xl: 'lg' }}
            pt={{ base: 'md', xl: 'lg' }}
            pb={{ base: 'xl', xl: 40 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          >
            <Stack gap="lg">
              <Box style={{ minWidth: 0 }}>
                  <Box mt={{ base: -16, xl: -24 }} mb="sm">
                    <SignalBadge
                      label={recommendation.tier}
                      tone={recommendation.tone}
                      leftSection={recommendationIcon}
                      size="md"
                      prominent
                      bookmark
                    />
                  </Box>
                  {hasProminentPay ? (
                  <Text
                    size="sm"
                    fw={700}
                    c="ink.8"
                    mb={8}
                    style={{ letterSpacing: '-0.01em', lineHeight: 1.2 }}
                  >
                    {payHeroValue}
                  </Text>
                  ) : null}
                  <Title
                    order={1}
                    size="h1"
                    c="ink.9"
                    mb={6}
                    style={{ lineHeight: 1.06, letterSpacing: '-0.05em', fontSize: 'clamp(1.95rem, 3.9vw, 2.6rem)' }}
                  >
                    {job.title}
                  </Title>
                  <Text size="lg" fw={700} c="ink.8" mb={6} style={{ letterSpacing: '-0.02em' }}>
                    {job.employer}
                  </Text>
                  <Group gap={8} mb={14} wrap="wrap">
                    <Text size="sm" c="ink.5">
                      {job.location}
                    </Text>
                    <Text size="sm" c="sage.4">
                      •
                    </Text>
                    <Text size="sm" c="ink.5">
                      Posted {postedTime}
                    </Text>
                    {!hasProminentPay ? (
                      <>
                        <Text size="sm" c="sage.4">
                          •
                        </Text>
                        <Text size="sm" fw={600} c="ink.6">
                          {payHeroValue}
                        </Text>
                      </>
                    ) : null}
                  </Group>

                  {(primaryActionUrl || otherSourceActions.length > 0) ? (
                    <Flex
                      direction={{ base: 'column', xs: 'row' }}
                      gap={{ base: 'xs', xs: 'sm' }}
                      mt="md"
                      align={{ base: 'stretch', xs: 'center' }}
                      wrap="wrap"
                    >
                      {primaryActionUrl ? (
                        <Button
                          component="a"
                          href={primaryActionUrl}
                          target="_blank"
                          rel="noreferrer"
                          variant="filled"
                          color="ink"
                          size="xs"
                          leftSection={renderSourceLogo(primarySource, 16) || undefined}
                          w={{ base: '100%', xs: 'auto' }}
                          styles={{
                            root: {
                              justifyContent: 'flex-start',
                              paddingInline: '14px',
                            },
                          }}
                        >
                          {primaryActionLabel}
                        </Button>
                      ) : null}
                      {otherSourceActions.length > 0 ? (
                        <Menu shadow="md" width={250} withinPortal={false}>
                          <Menu.Target>
                            <Button
                              variant="default"
                              color="gray"
                              size="xs"
                              rightSection={<ChevronDown size={14} />}
                              w={{ base: '100%', xs: 'auto' }}
                              styles={{
                                root: {
                                  justifyContent: 'space-between',
                                  paddingInline: '14px',
                                },
                              }}
                            >
                              {`Other apply sources (${otherSourceCount})`}
                            </Button>
                          </Menu.Target>
                          <Menu.Dropdown>
                            {otherSourceActions.map((action) => (
                              <Menu.Item
                                key={action.key}
                                component="a"
                                href={action.url}
                                target="_blank"
                                rel="noreferrer"
                                leftSection={renderSourceLogo(action.source, 18) || undefined}
                              >
                                {action.label}
                              </Menu.Item>
                            ))}
                          </Menu.Dropdown>
                        </Menu>
                      ) : null}
                    </Flex>
                  ) : null}
                </Box>

              <SimpleGrid
                cols={{ base: 1, sm: 3 }}
                spacing={{ base: 'sm', sm: 'sm', lg: 'md' }}
                verticalSpacing={{ base: 'sm', sm: 'sm', lg: 'md' }}
              >
                {analysisCards.map((fact) => {
                  const Icon = fact.icon;

                  return (
                    <Box
                      key={fact.label}
                      p={{ base: 'sm', sm: 14, lg: 'md' }}
                      style={{
                        background: fact.background,
                        borderRadius: 'var(--app-radius-lg)',
                        boxShadow: '0 4px 12px rgba(26, 28, 26, 0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <Group
                        justify="space-between"
                        align="center"
                        wrap="nowrap"
                        gap={{ base: 6, sm: 8 }}
                        mb={{ base: 8, sm: 10, lg: 'sm' }}
                      >
                        <Group gap={{ base: 6, sm: 8 }} align="center" wrap="nowrap">
                          <ThemeIcon
                            size={24}
                            radius="lg"
                            styles={{
                              root: {
                                backgroundColor: fact.iconBg,
                                color: fact.iconColor,
                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)',
                                flexShrink: 0,
                              },
                            }}
                          >
                            <Icon size={14} />
                          </ThemeIcon>
                          <Text
                            size="xs"
                            fw={700}
                            c="sage.8"
                            tt="uppercase"
                            style={{ letterSpacing: '0.05em', lineHeight: 1.1 }}
                          >
                            {fact.label}
                          </Text>
                        </Group>
                      </Group>
                      <Text
                        fw={750}
                        c="ink.9"
                        mb={{ base: 8, sm: 10, lg: 'sm' }}
                        fz="clamp(1.1rem, 1.7vw, 1.5rem)"
                        style={{ lineHeight: 1.12, letterSpacing: '-0.03em' }}
                      >
                        {fact.value}
                      </Text>
                      {fact.id === 'hours' ? (
                        <Text size="sm" c="ink.7" mb={{ base: 8, sm: 10, lg: 'sm' }} style={{ lineHeight: 1.45 }}>
                          <Text component="span" fw={600} c="ink.8">
                            Listed
                          </Text>{' '}
                          {compactListedHours}
                          {' · '}
                          <Text component="span" fw={600} c="ink.8">
                            Reality
                          </Text>{' '}
                          {compactRealityHours}
                        </Text>
                      ) : null}
                      {fact.id !== 'fit' ? (
                        <Text
                          size="sm"
                          c="ink.6"
                          style={{ lineHeight: 1.55 }}
                        >
                          {fact.description}
                        </Text>
                      ) : null}
                      {fact.id === 'transit' ? (
                        <Button
                          component="a"
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(job.location)}`}
                          target="_blank"
                          rel="noreferrer"
                          variant="default"
                          color="gray"
                          size="xs"
                          mt={{ base: 'sm', sm: 10 }}
                          leftSection={renderExternalLogo(googleMapsLogoUrl, 14) || undefined}
                          styles={{
                            root: {
                              alignSelf: 'flex-start',
                              paddingInline: '12px',
                            },
                          }}
                        >
                          Route in Maps
                        </Button>
                      ) : null}
                      {fact.id === 'fit' && fitAssessment.requirements.length > 0 ? (
                        <Box
                          component="ul"
                          mt={{ base: 'sm', sm: 10, lg: 'md' }}
                          style={{
                            listStyleType: 'none',
                            padding: 0,
                            margin: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                          }}
                        >
                          {fitAssessment.requirements.map((requirement, index) => {
                            const isMet =
                              requirement.status === 'met' || requirement.status === 'likely';
                            const isPartial = requirement.status === 'partial';

                            return (
                              <Box
                                component="li"
                                key={index}
                                style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}
                              >
                                <Box mt={1}>
                                  {isMet ? (
                                    <Check size={14} color="var(--mantine-color-lime-7)" strokeWidth={2.4} />
                                  ) : isPartial ? (
                                    <AlertTriangle size={14} color="var(--mantine-color-yellow-7)" strokeWidth={2.1} />
                                  ) : (
                                    <CircleX size={14} color="var(--mantine-color-red-6)" strokeWidth={1.9} />
                                  )}
                                </Box>
                                <Text
                                  size="sm"
                                  c={isMet ? 'ink.7' : isPartial ? 'ink.8' : 'ink.9'}
                                  fw={isMet ? 400 : 500}
                                  style={{ lineHeight: 1.45 }}
                                >
                                  {requirement.label}
                                </Text>
                              </Box>
                            );
                          })}
                        </Box>
                      ) : null}
                    </Box>
                  );
                })}
              </SimpleGrid>

              <Paper
                p={{ base: 'sm', lg: 'md' }}
                style={{
                  background: 'linear-gradient(135deg, #FBFCFD 0%, #FFFFFF 100%)',
                  border: '1px solid #E8EDF2',
                  boxShadow: '0 4px 12px rgba(26, 28, 26, 0.02)',
                  borderRadius: 'var(--app-radius-lg)',
                }}
              >
                <Stack gap={{ base: 'md', sm: 'lg' }}>
                  <Text
                    size="xs"
                    fw={700}
                    tt="uppercase"
                    c="sage.8"
                    style={{ letterSpacing: '0.05em', lineHeight: 1.1 }}
                  >
                    Job Analysis
                  </Text>

                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={{ base: 'md', sm: 'lg' }}>
                    <Group gap={{ base: 'sm', sm: 'md' }} align="flex-start" wrap="nowrap">
                      <ThemeIcon
                        size={{ base: 36, sm: 40, lg: 44 }}
                        radius="lg"
                        styles={{
                          root: {
                            backgroundColor: '#CFE59A',
                            color: '#405A12',
                            flexShrink: 0,
                          },
                        }}
                      >
                        <Target size={18} strokeWidth={2} />
                      </ThemeIcon>
                      <Box style={{ minWidth: 0 }}>
                        <Text
                          fw={750}
                          c={
                            analysis.hireChance === 'High'
                              ? 'lime.8'
                              : analysis.hireChance === 'Low'
                                ? 'red.7'
                                : 'yellow.8'
                          }
                          mb={{ base: 6, sm: 8 }}
                          style={{ fontSize: 'clamp(1.1rem, 1.7vw, 1.5rem)', lineHeight: 1.12, letterSpacing: '-0.03em' }}
                        >
                          {analysis.hireChance} Hiring Chance
                        </Text>
                        <Text
                          size="sm"
                          c="ink.6"
                          style={{ lineHeight: 1.55 }}
                        >
                          {hiringSummary}
                        </Text>
                      </Box>
                    </Group>

                    <Group gap={{ base: 'sm', sm: 'md' }} align="flex-start" wrap="nowrap">
                      <ThemeIcon
                        size={{ base: 36, sm: 40, lg: 44 }}
                        radius="lg"
                        styles={{
                          root: {
                            backgroundColor: '#D9DDD3',
                            color: 'var(--mantine-color-ink-6)',
                            flexShrink: 0,
                          },
                        }}
                      >
                        <ShieldCheck size={18} strokeWidth={2} />
                      </ThemeIcon>
                      <Box style={{ minWidth: 0 }}>
                        <Text
                          fw={750}
                          c={
                            analysis.companyRisk === 'Low'
                              ? 'ink.6'
                              : analysis.companyRisk === 'High'
                                ? 'red.7'
                                : 'yellow.8'
                          }
                          mb={{ base: 6, sm: 8 }}
                          style={{ fontSize: 'clamp(1.1rem, 1.7vw, 1.5rem)', lineHeight: 1.12, letterSpacing: '-0.03em' }}
                        >
                          {analysis.companyRisk} Employer Risk
                        </Text>
                        <Text
                          size="sm"
                          c="ink.6"
                          style={{ lineHeight: 1.55 }}
                        >
                          {employerRiskSummary}
                        </Text>
                      </Box>
                    </Group>
                  </SimpleGrid>

                  <Box
                    px={{ base: 'sm', sm: 'md' }}
                    py={{ base: 10, sm: 12 }}
                    style={{
                      backgroundColor: 'var(--mantine-color-sage-0)',
                      borderRadius: 'calc(var(--app-radius-lg) - 4px)',
                    }}
                  >
                    <Flex
                      direction="row"
                      gap={{ base: 'xs', xs: 'sm', sm: 'md' }}
                      align="center"
                      wrap="wrap"
                    >
                      {learnMoreLinks.map((source) => (
                        <Button
                          key={source.key}
                          component="a"
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          variant="subtle"
                          color="ink"
                          size="compact-sm"
                          rightSection={<ExternalLink size={13} />}
                          styles={{
                            root: {
                              paddingInline: 0,
                              minHeight: 'auto',
                            },
                            section: {
                              marginInlineStart: 6,
                            },
                            label: {
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              letterSpacing: '-0.01em',
                              lineHeight: 1.2,
                            },
                          }}
                        >
                          {source.label}
                        </Button>
                      ))}
                    </Flex>
                  </Box>
                </Stack>
              </Paper>

              <Paper p="md" style={sectionSurfaceStyle}>
                <Text fw={700} size="sm" c="ink.8" mb={4}>
                  Tailor Resume with AI
                </Text>
                <Text size="sm" c="ink.6" mb="md">
                  Export targeted prompt with strict anti-hallucination guardrails.
                </Text>

                <Flex
                  direction={{ base: 'column', sm: 'row' }}
                  gap="sm"
                  align={{ base: 'stretch', sm: 'center' }}
                >
                  <Box style={{ flex: 1, minWidth: 0, maxWidth: '400px' }}>
                    <Select
                      value={selectedResumeId}
                      onChange={(value) => setSelectedResumeId(value || '')}
                      data={selectData}
                      placeholder="Select a CV Profile"
                      size="sm"
                    />
                  </Box>
                  <Button
                    variant="default"
                    color="gray"
                    size="sm"
                    onClick={generatePromptPack}
                    disabled={!selectedResumeId}
                    style={{ flexShrink: 0 }}
                  >
                    {copied ? 'Copied Prompt' : 'Copy Prompt'}
                  </Button>
                </Flex>
              </Paper>

              <Box pt={8} pb={isEmbedded ? 40 : 120}>
                <Text
                  size="xs"
                  fw={700}
                  c="sage.6"
                  tt="uppercase"
                  style={{ letterSpacing: '0.05em' }}
                  mb={8}
                >
                  Raw Listing Preview
                </Text>
                <Text fs="italic" size="sm" c="ink.6" style={{ lineHeight: 1.6 }}>
                  "{job.rawListing}"
                </Text>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

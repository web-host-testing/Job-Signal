import React from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { AlertTriangle, Clock3, Eye, Heart, Star, ThumbsUp } from 'lucide-react';
import { Job, JobStatus } from '../types';
import { useJobStore } from '../store/useJobStore';
import { showToast } from '../store/useToastStore';
import { useDesktop } from '../lib/useDesktop';
import { Box, Flex, Text, ActionIcon, Group, Tooltip } from '@mantine/core';
import { AppCard } from './ui/AppCard';
import { JobMetaRow } from './ui/JobMetaRow';
import { SignalBadge } from './ui/SignalBadge';
import { mobileSurfacePadding } from '../layout';
import { usePreferencesStore } from '../store/usePreferencesStore';
import { getJobRecommendation } from '../lib/jobRecommendation';
import { getRequirementGapCount } from '../lib/fitLogic';

interface JobCardProps {
  key?: React.Key;
  job: Job;
  status: JobStatus;
  variant?: 'feed' | 'my-jobs';
}

export function JobCard({ job, status, variant = 'feed' }: JobCardProps) {
  const { analysis } = job;
  const { updateJobStatus } = useJobStore();
  const { preferences } = usePreferencesStore();
  const [localStatus, setLocalStatus] = React.useState(status);
  const isDesktop = useDesktop();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isSelected = isDesktop && searchParams.get('job') === job.id;

  // Sync local status if props change (e.g., from undo)
  React.useEffect(() => {
    setLocalStatus(status);
  }, [status]);
  
  const handleSaveToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (localStatus === 'saved') {
      setLocalStatus('new');
      updateJobStatus(job.id, 'new');
      showToast("Removed from saved", "Undo", () => {
        updateJobStatus(job.id, 'saved');
      });
    } else {
      setLocalStatus('saved');
      updateJobStatus(job.id, 'saved');
      showToast("Job saved", "Undo", () => {
        updateJobStatus(job.id, 'new');
      });
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isDesktop && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.button) {
      e.preventDefault();
      const params = new URLSearchParams(location.search);
      params.set('job', job.id);
      navigate({ search: params.toString() }, { replace: true });
    }
  };

  const recommendation = getJobRecommendation(job, {
    minWeeklyHours: preferences.minWeeklyHours,
    maxTransitMinutes: preferences.maxTransitMinutes,
    workAuthorization: preferences.workAuthorization,
  });
  const requirementGapCount = getRequirementGapCount(job.analysis, preferences.workAuthorization);
  const recommendationIcon =
    recommendation.tier === 'Top Pick' ? (
      <Star size={13} />
    ) : recommendation.tier === 'Strong Pick' ? (
      <ThumbsUp size={13} />
    ) : recommendation.tier === 'Worth a Look' ? (
      <Eye size={13} />
    ) : (
      <Clock3 size={13} />
    );

  return (
    <Box
      component={Link}
      to={`/jobs/${job.id}`}
      onClick={handleClick}
      style={{
        display: 'block',
        cursor: 'pointer',
        textDecoration: 'none',
        position: 'relative',
      }}
    >
      <AppCard
        p={{ base: mobileSurfacePadding, xl: 'md' }}
        mb="sm"
        selected={isSelected}
        interactive
        style={{
          transition: 'border-color 160ms ease, box-shadow 160ms ease',
        }}
      >
      <Box mt={{ base: -mobileSurfacePadding, xl: -16 }} mb="sm">
        <SignalBadge
          label={recommendation.tier}
          tone={recommendation.tone}
          leftSection={recommendationIcon}
          size="md"
          prominent
          bookmark
        />
      </Box>

      <Flex justify="space-between" align="flex-start" gap="sm">
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text
            fw={700}
            c="ink.9"
            size="md"
            mb={4}
            style={{ lineHeight: 1.22, letterSpacing: '-0.02em', fontSize: '1.08rem' }}
          >
            {job.title}
          </Text>
          <Text size="sm" c="ink.8" fw={650} mb={4} style={{ letterSpacing: '-0.01em' }}>
            {job.employer}
          </Text>
          <Text size="sm" c="ink.5" mb={10}>
            {job.location}
          </Text>
          <JobMetaRow
            pay={job.paySummary}
            hours={analysis.estimatedRealisticHours}
            transitMinutes={job.transitTimeMins}
            compact
          />
        </Box>
        
        {variant !== 'my-jobs' && (
          <Group gap="xs" style={{ zIndex: 10, flexShrink: 0 }}>
            <Tooltip label={localStatus === 'saved' ? 'Unsave job' : 'Save job'} withArrow openDelay={200}>
              <ActionIcon
                onClick={handleSaveToggle}
                variant={localStatus === 'saved' ? 'light' : 'subtle'}
                color={localStatus === 'saved' ? 'red' : 'ink'}
                aria-label={localStatus === 'saved' ? 'Unsave job' : 'Save job'}
                size="md"
                radius="md"
                style={{ backgroundColor: localStatus === 'saved' ? 'var(--mantine-color-red-0)' : undefined }}
              >
                <Heart size={18} fill={localStatus === 'saved' ? 'currentColor' : 'none'} />
              </ActionIcon>
            </Tooltip>
          </Group>
        )}
      </Flex>

      {requirementGapCount > 0 ? (
        <Flex gap="xs" mt="md" wrap="wrap" align="center">
          <Group gap={6}>
            <SignalBadge
              label="Gap"
              tone="danger"
              leftSection={<AlertTriangle size={10} />}
            />
          </Group>
        </Flex>
      ) : null}
      </AppCard>
    </Box>
  );
}

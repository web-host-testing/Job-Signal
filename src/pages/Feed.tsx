import { useState, useMemo, useEffect } from 'react';
import { useJobStore } from '../store/useJobStore';
import { usePreferencesStore } from '../store/usePreferencesStore';
import { showToast } from '../store/useToastStore';
import { MOCK_JOBS } from '../data/mockData';
import { JobCard } from '../components/JobCard';
import {
  ArrowDownWideNarrow,
  ChevronDown,
  Check,
  Clock,
  Filter,
  RefreshCw,
  SlidersHorizontal,
  Target,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Center,
  Drawer,
  Flex,
  Group,
  Menu,
  Modal,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { AppPage, PageHeader } from '../components/layout/AppPage';
import { EmptyState } from '../components/ui/EmptyState';
import { mobileContentInset, mobileShellGutter } from '../layout';
import {
  compareByPostedDateDescending,
  getFitRank,
  getHireChanceRank,
  getRealisticHours,
  getRiskRank,
} from '../lib/feedFilters';
import { getRequirementGapCount } from '../lib/fitLogic';
import { getJobRecommendation, type RecommendationTier } from '../lib/jobRecommendation';
import {
  CANADA_MARKET_OPTIONS,
  formatMarketLabel,
  getProvinceByCode,
} from '../lib/canadaMarkets';

type FeedLane = 'all' | 'warehouse' | 'kitchen';
type FeedSort = 'recent' | 'fit' | 'commute' | 'hours' | 'chance' | 'risk';
type FeedFreshness = '1' | '3' | '7' | '14' | 'any';
type FeedMinHours = '20' | '30' | '35' | '40' | 'any';
type FeedMaxCommute = '30' | '45' | '60' | '75' | 'any';
type FeedChance = 'any' | 'medium' | 'high';
type FeedRisk = 'any' | 'medium' | 'low';

type FeedFilters = {
  lane: FeedLane;
  recommendationTiers: RecommendationTier[];
  freshnessDays: FeedFreshness;
  hideHardRequirementGaps: boolean;
  hideLowFit: boolean;
  minRealityHours: FeedMinHours;
  maxCommuteMinutes: FeedMaxCommute;
  minHireChance: FeedChance;
  maxRisk: FeedRisk;
  sort: FeedSort;
};

const sortOptions: Array<{ id: FeedSort; label: string }> = [
  { id: 'recent', label: 'Most recent' },
  { id: 'fit', label: 'Best fit' },
  { id: 'commute', label: 'Shortest commute' },
  { id: 'hours', label: 'Highest realistic hours' },
  { id: 'chance', label: 'Highest hire chance' },
  { id: 'risk', label: 'Lowest risk' },
];

const freshnessOptions = [
  { value: '1', label: 'Last 24 hours' },
  { value: '3', label: 'Last 3 days' },
  { value: '7', label: 'Last 7 days' },
  { value: '14', label: 'Last 14 days' },
  { value: 'any', label: 'Any time' },
];

const hoursOptions = [
  { value: '20', label: '20+ hrs / week' },
  { value: '30', label: '30+ hrs / week' },
  { value: '35', label: '35+ hrs / week' },
  { value: '40', label: '40+ hrs / week' },
  { value: 'any', label: 'Any hours' },
];

const commuteOptions = [
  { value: '30', label: '30 min max' },
  { value: '45', label: '45 min max' },
  { value: '60', label: '60 min max' },
  { value: '75', label: '75 min max' },
  { value: 'any', label: 'Any commute' },
];

const chanceOptions = [
  { value: 'any', label: 'Any chance' },
  { value: 'medium', label: 'Medium+ chance' },
  { value: 'high', label: 'High chance only' },
];

const riskOptions = [
  { value: 'any', label: 'Any risk' },
  { value: 'medium', label: 'Medium risk max' },
  { value: 'low', label: 'Low risk only' },
];

const recommendationThresholdPresets = [
  {
    id: 'top-only',
    label: 'Only Top Picks',
    shortLabel: 'Top Picks only',
    tiers: ['Top Pick'] as RecommendationTier[],
  },
  {
    id: 'strong-plus',
    label: 'At least Strong Picks',
    shortLabel: 'Strong Pick+',
    tiers: ['Top Pick', 'Strong Pick'] as RecommendationTier[],
  },
  {
    id: 'hide-low',
    label: 'Ignore Low Priority',
    shortLabel: 'Hide Low Priority',
    tiers: ['Top Pick', 'Strong Pick', 'Worth a Look'] as RecommendationTier[],
  },
] as const;

function sameTierSelection(a: RecommendationTier[], b: RecommendationTier[]) {
  if (a.length !== b.length) return false;
  const aSorted = [...a].sort();
  const bSorted = [...b].sort();
  return aSorted.every((value, index) => value === bSorted[index]);
}

function getRecommendationShortcutPreset(selectedTiers: RecommendationTier[]) {
  return recommendationThresholdPresets.find((preset) =>
    sameTierSelection(selectedTiers, preset.tiers),
  );
}

function toHoursOption(hours: number): FeedMinHours {
  if (hours <= 20) return '20';
  if (hours <= 30) return '30';
  if (hours <= 35) return '35';
  return '40';
}

function toCommuteOption(minutes: number): FeedMaxCommute {
  if (minutes <= 30) return '30';
  if (minutes <= 45) return '45';
  if (minutes <= 60) return '60';
  return '75';
}

function createDefaultFilters(minWeeklyHours: number, maxTransitMinutes: number): FeedFilters {
  return {
    lane: 'all',
    recommendationTiers: [],
    freshnessDays: '7',
    hideHardRequirementGaps: true,
    hideLowFit: true,
    minRealityHours: toHoursOption(minWeeklyHours),
    maxCommuteMinutes: toCommuteOption(maxTransitMinutes),
    minHireChance: 'medium',
    maxRisk: 'medium',
    sort: 'recent',
  };
}

function countChangedDrawerFilters(current: FeedFilters, defaults: FeedFilters) {
  let count = 0;

  if (current.freshnessDays !== defaults.freshnessDays) count += 1;
  if (current.hideHardRequirementGaps !== defaults.hideHardRequirementGaps) count += 1;
  if (current.hideLowFit !== defaults.hideLowFit) count += 1;
  if (current.minRealityHours !== defaults.minRealityHours) count += 1;
  if (current.maxCommuteMinutes !== defaults.maxCommuteMinutes) count += 1;
  if (current.minHireChance !== defaults.minHireChance) count += 1;
  if (current.maxRisk !== defaults.maxRisk) count += 1;

  return count;
}

export function Feed() {
  const { getStatus } = useJobStore();
  const { preferences, updatePreferences } = usePreferencesStore();
  const defaultFilters = useMemo(
    () => createDefaultFilters(preferences.minWeeklyHours, preferences.maxTransitMinutes),
    [preferences.maxTransitMinutes, preferences.minWeeklyHours],
  );

  const [filters, setFilters] = useState<FeedFilters>(() =>
    createDefaultFilters(preferences.minWeeklyHours, preferences.maxTransitMinutes),
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [draftProvinceCode, setDraftProvinceCode] = useState(preferences.marketProvinceCode);
  const [draftCity, setDraftCity] = useState(preferences.marketCity);

  const handleRefresh = (isManual = true) => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastRefreshed(new Date());
      setIsRefreshing(false);
      if (isManual) {
        showToast('Feed refreshed');
      }
    }, 600);
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      handleRefresh(false);
    }, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  const changedFilterCount = useMemo(
    () => countChangedDrawerFilters(filters, defaultFilters),
    [defaultFilters, filters],
  );
  const provinceOptions = useMemo(
    () =>
      CANADA_MARKET_OPTIONS.map((province) => ({
        value: province.code,
        label: province.name,
      })),
    [],
  );
  const selectedDraftProvince =
    getProvinceByCode(draftProvinceCode) ?? CANADA_MARKET_OPTIONS[0];
  const cityOptions = selectedDraftProvince.cities.map((city) => ({
    value: city,
    label: city,
  }));

  const sortLabel = sortOptions.find((option) => option.id === filters.sort)?.label ?? 'Most recent';
  const activeRecommendationPreset = getRecommendationShortcutPreset(filters.recommendationTiers);
  const recommendationShortcutLabel = activeRecommendationPreset?.shortLabel ?? 'Any rating';

  useEffect(() => {
    if (!marketOpen) {
      setDraftProvinceCode(preferences.marketProvinceCode);
      setDraftCity(preferences.marketCity);
    }
  }, [marketOpen, preferences.marketCity, preferences.marketProvinceCode]);

  useEffect(() => {
    const province = getProvinceByCode(draftProvinceCode);
    if (!province) return;
    if (!province.cities.includes(draftCity)) {
      setDraftCity(province.cities[0] ?? '');
    }
  }, [draftCity, draftProvinceCode]);

  const handleSaveMarket = () => {
    const province = getProvinceByCode(draftProvinceCode) ?? CANADA_MARKET_OPTIONS[0];
    const nextCity = province.cities.includes(draftCity) ? draftCity : province.cities[0];
    if (!nextCity) return;

    updatePreferences({
      marketProvinceCode: province.code,
      marketProvinceName: province.name,
      marketCity: nextCity,
      marketLabel: formatMarketLabel(nextCity, province.code),
    });
    setMarketOpen(false);
  };

  const displayJobs = useMemo(() => {
    const now = Date.now();

    return [...MOCK_JOBS]
      .filter((job) => {
        const status = getStatus(job.id);
        if (status === 'applied' || status === 'saved') {
          return false;
        }

        if (job.lane === 'warehouse' && !preferences.enabledLanes.warehouse) return false;
        if (job.lane === 'kitchen' && !preferences.enabledLanes.kitchen) return false;

        if (filters.lane !== 'all' && job.lane !== filters.lane) {
          return false;
        }

        const recommendation = getJobRecommendation(job, {
          minWeeklyHours: preferences.minWeeklyHours,
          maxTransitMinutes: preferences.maxTransitMinutes,
          workAuthorization: preferences.workAuthorization,
        });

        if (
          filters.recommendationTiers.length > 0 &&
          !filters.recommendationTiers.includes(recommendation.tier)
        ) {
          return false;
        }

        if (filters.freshnessDays !== 'any') {
          const freshnessWindow = Number(filters.freshnessDays) * 24 * 60 * 60 * 1000;
          const postedAt = new Date(job.postedDate).getTime();
          if (Number.isNaN(postedAt) || now - postedAt > freshnessWindow) {
            return false;
          }
        }

        if (
          filters.hideHardRequirementGaps &&
          getRequirementGapCount(job.analysis, preferences.workAuthorization) > 0
        ) {
          return false;
        }

        if (filters.hideLowFit && getFitRank(job, preferences.workAuthorization) <= 1) {
          return false;
        }

        if (filters.minRealityHours !== 'any') {
          const realisticHours = getRealisticHours(job);
          if (realisticHours === null || realisticHours < Number(filters.minRealityHours)) {
            return false;
          }
        }

        if (filters.maxCommuteMinutes !== 'any' && job.transitTimeMins > Number(filters.maxCommuteMinutes)) {
          return false;
        }

        if (filters.minHireChance === 'medium' && getHireChanceRank(job) < 2) {
          return false;
        }

        if (filters.minHireChance === 'high' && getHireChanceRank(job) < 3) {
          return false;
        }

        if (filters.maxRisk === 'medium' && getRiskRank(job) > 2) {
          return false;
        }

        if (filters.maxRisk === 'low' && getRiskRank(job) > 1) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sort === 'fit') {
          return (
            getFitRank(b, preferences.workAuthorization) - getFitRank(a, preferences.workAuthorization) ||
            getHireChanceRank(b) - getHireChanceRank(a) ||
            compareByPostedDateDescending(a, b)
          );
        }

        if (filters.sort === 'commute') {
          return a.transitTimeMins - b.transitTimeMins || compareByPostedDateDescending(a, b);
        }

        if (filters.sort === 'hours') {
          return (
            (getRealisticHours(b) ?? -1) - (getRealisticHours(a) ?? -1) ||
            compareByPostedDateDescending(a, b)
          );
        }

        if (filters.sort === 'chance') {
          return (
            getHireChanceRank(b) - getHireChanceRank(a) ||
            getFitRank(b, preferences.workAuthorization) - getFitRank(a, preferences.workAuthorization) ||
            compareByPostedDateDescending(a, b)
          );
        }

        if (filters.sort === 'risk') {
          return (
            getRiskRank(a) - getRiskRank(b) ||
            getHireChanceRank(b) - getHireChanceRank(a) ||
            compareByPostedDateDescending(a, b)
          );
        }

        return compareByPostedDateDescending(a, b);
      });
  }, [filters, getStatus, preferences.enabledLanes, preferences.maxTransitMinutes, preferences.minWeeklyHours, preferences.workAuthorization]);

  return (
    <AppPage width="full">
      <PageHeader
        title="New Jobs"
        icon={
          <ThemeIcon size="md" radius="xl" color="ink.9" hiddenFrom="xl">
            <Target size={16} />
          </ThemeIcon>
        }
        hideTitleOnDesktop
        rightSection={
          <Group gap="sm" ml="auto">
            <Button
              variant="default"
              color="gray"
              size="xs"
              radius="md"
              rightSection={<ChevronDown size={14} />}
              onClick={() => setMarketOpen(true)}
            >
              {preferences.marketLabel}
            </Button>
            <Tooltip label="Refresh feed" withArrow openDelay={200}>
              <ActionIcon
                variant="light"
                color="ink"
                radius="xl"
                size="md"
                onClick={() => handleRefresh(true)}
                disabled={isRefreshing}
                aria-label="Refresh feed"
                loading={isRefreshing}
              >
                <RefreshCw size={14} />
              </ActionIcon>
            </Tooltip>
          </Group>
        }
        bottomSection={
          <Stack gap="sm">
            <Flex gap="xs" wrap="nowrap">
              {[
                { id: 'all' as const, label: 'All' },
                { id: 'warehouse' as const, label: 'Warehouse' },
                { id: 'kitchen' as const, label: 'Kitchen' },
              ].map((lane) => (
                <Button
                  key={lane.id}
                  variant={filters.lane === lane.id ? 'filled' : 'default'}
                  color="ink"
                  radius="xl"
                  size="sm"
                  onClick={() => setFilters((prev) => ({ ...prev, lane: lane.id }))}
                  styles={{
                    root: {
                      flexShrink: 0,
                      minWidth: 'max-content',
                      whiteSpace: 'nowrap',
                      backgroundColor:
                        filters.lane === lane.id
                          ? 'var(--mantine-color-ink-9)'
                          : 'var(--mantine-color-surface-0)',
                      color:
                        filters.lane === lane.id ? 'white' : 'var(--mantine-color-ink-7)',
                      border:
                        filters.lane === lane.id
                          ? '1px solid var(--mantine-color-ink-9)'
                          : '1px solid var(--mantine-color-sage-2)',
                    },
                    label: {
                      whiteSpace: 'nowrap',
                    },
                  }}
                >
                  {lane.label}
                </Button>
              ))}
            </Flex>

            <Flex gap="xs" wrap="wrap">
              <Menu shadow="md" width={240} position="bottom-start">
                <Menu.Target>
                  <Button
                    variant={activeRecommendationPreset ? 'light' : 'default'}
                    color={activeRecommendationPreset ? 'lime' : 'gray'}
                    radius="xl"
                    size="sm"
                    rightSection={<ChevronDown size={14} />}
                  >
                    {recommendationShortcutLabel}
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  {recommendationThresholdPresets.map((preset) => {
                    const active = sameTierSelection(filters.recommendationTiers, preset.tiers);
                    return (
                      <Menu.Item
                        key={preset.id}
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            recommendationTiers: preset.tiers,
                          }))
                        }
                        rightSection={active ? <Check size={14} /> : null}
                      >
                        {preset.label}
                      </Menu.Item>
                    );
                  })}
                  <Menu.Divider />
                  <Menu.Item
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        recommendationTiers: [],
                      }))
                    }
                    rightSection={filters.recommendationTiers.length === 0 ? <Check size={14} /> : null}
                  >
                    Any rating
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>

              <Menu shadow="md" width={220} position="bottom-start">
                <Menu.Target>
                  <Button
                    variant="default"
                    color="gray"
                    radius="xl"
                    size="sm"
                    leftSection={<ArrowDownWideNarrow size={14} />}
                  >
                    {sortLabel}
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  {sortOptions.map((option) => (
                    <Menu.Item
                      key={option.id}
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          sort: option.id,
                        }))
                      }
                      rightSection={filters.sort === option.id ? <Check size={14} /> : null}
                    >
                      {option.label}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>

              <Box pos="relative">
                <Tooltip label="Filters" withArrow openDelay={200}>
                  <ActionIcon
                    variant={changedFilterCount > 0 ? 'light' : 'default'}
                    color={changedFilterCount > 0 ? 'ink' : 'gray'}
                    radius="xl"
                    size={36}
                    onClick={() => setFiltersOpen(true)}
                    aria-label="Filters"
                  >
                    <SlidersHorizontal size={16} />
                  </ActionIcon>
                </Tooltip>
                {changedFilterCount > 0 ? (
                  <Badge
                    size="xs"
                    radius="xl"
                    color="ink"
                    variant="filled"
                    style={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      pointerEvents: 'none',
                    }}
                  >
                    {changedFilterCount}
                  </Badge>
                ) : null}
              </Box>
            </Flex>
          </Stack>
        }
      />

      <Drawer
        opened={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        position="bottom"
        size="auto"
        radius="lg"
        padding="lg"
        title={
          <Text fw={700} c="ink.9">
            Feed filters
          </Text>
        }
      >
        <Stack gap="lg">
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Select
              label="Freshness"
              value={filters.freshnessDays}
              onChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  freshnessDays: (value as FeedFreshness | null) ?? prev.freshnessDays,
                }))
              }
              data={freshnessOptions}
              allowDeselect={false}
            />
            <Select
              label="Reality hours minimum"
              value={filters.minRealityHours}
              onChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  minRealityHours: (value as FeedMinHours | null) ?? prev.minRealityHours,
                }))
              }
              data={hoursOptions}
              allowDeselect={false}
            />
            <Select
              label="Commute maximum"
              value={filters.maxCommuteMinutes}
              onChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  maxCommuteMinutes: (value as FeedMaxCommute | null) ?? prev.maxCommuteMinutes,
                }))
              }
              data={commuteOptions}
              allowDeselect={false}
            />
            <Select
              label="Hire chance"
              value={filters.minHireChance}
              onChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  minHireChance: (value as FeedChance | null) ?? prev.minHireChance,
                }))
              }
              data={chanceOptions}
              allowDeselect={false}
            />
            <Select
              label="Risk ceiling"
              value={filters.maxRisk}
              onChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  maxRisk: (value as FeedRisk | null) ?? prev.maxRisk,
                }))
              }
              data={riskOptions}
              allowDeselect={false}
            />
          </SimpleGrid>

          <Stack gap="sm">
            <Switch
              label="Hide jobs with unmet hard requirements"
              checked={filters.hideHardRequirementGaps}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  hideHardRequirementGaps: event.currentTarget.checked,
                }))
              }
              color="lime"
            />
            <Switch
              label="Hide low-fit jobs"
              checked={filters.hideLowFit}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  hideLowFit: event.currentTarget.checked,
                }))
              }
              color="lime"
            />
          </Stack>

          <Group justify="space-between" align="center">
            <Text size="xs" c="ink.5">
              Defaults follow your settings for hours and commute.
            </Text>
            <Group gap="xs">
              <Button
                variant="default"
                color="gray"
                size="sm"
                onClick={() => setFilters(defaultFilters)}
              >
                Reset
              </Button>
              <Button color="ink" size="sm" onClick={() => setFiltersOpen(false)}>
                Show {displayJobs.length} jobs
              </Button>
            </Group>
          </Group>
        </Stack>
      </Drawer>

      <Modal
        opened={marketOpen}
        onClose={() => setMarketOpen(false)}
        title={
          <Text fw={700} c="ink.9">
            Choose market
          </Text>
        }
        centered
      >
        <Stack gap="md">
          <Select
            label="Province or territory"
            value={draftProvinceCode}
            onChange={(value) => setDraftProvinceCode(value ?? draftProvinceCode)}
            data={provinceOptions}
            allowDeselect={false}
          />
          <Select
            label="City"
            value={draftCity}
            onChange={(value) => setDraftCity(value ?? draftCity)}
            data={cityOptions}
            allowDeselect={false}
          />
          <Group justify="flex-end" gap="xs" mt="xs">
            <Button variant="default" color="gray" onClick={() => setMarketOpen(false)}>
              Cancel
            </Button>
            <Button color="ink" onClick={handleSaveMarket}>
              Save market
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Box component="main" flex={1} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Center py={8} mb={12} px={{ base: 'md', xl: 'lg' }}>
          <Group gap={6} c="sage.6">
            <Clock size={12} strokeWidth={2.5} />
            <Text size="xs" fw={600} style={{ letterSpacing: '0.025em' }}>
              Refreshed {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </Group>
        </Center>

        <Box flex={1} px={{ base: mobileContentInset, xl: 'lg' }} style={{ overflowY: 'auto', overflowX: 'hidden' }}>
          {displayJobs.length === 0 ? (
            <EmptyState
              icon={<Filter size={24} color="var(--mantine-color-sage-5)" />}
              title="No jobs found"
              description="Try widening your filters or lowering the hours/commute thresholds to see more roles."
            />
          ) : (
            <Flex direction="column" pb={24}>
              <AnimatePresence mode="popLayout">
                {displayJobs.map((job) => (
                  <motion.div
                    layout
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.2 }}
                  >
                    <JobCard job={job} status={getStatus(job.id)} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </Flex>
          )}
        </Box>
      </Box>
    </AppPage>
  );
}

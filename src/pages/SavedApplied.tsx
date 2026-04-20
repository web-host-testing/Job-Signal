import { useState, useMemo } from 'react';
import { useJobStore } from '../store/useJobStore';
import { MOCK_JOBS } from '../data/mockData';
import { JobCard } from '../components/JobCard';
import { motion, AnimatePresence } from 'motion/react';
import { SegmentedControl, Flex, ThemeIcon } from '@mantine/core';
import { Bookmark } from 'lucide-react';
import { AppPage, PageHeader, PageSection } from '../components/layout/AppPage';
import { EmptyState } from '../components/ui/EmptyState';

export function SavedApplied() {
  const { getStatus } = useJobStore();
  const [tab, setTab] = useState<'saved' | 'applied'>('saved');

  const displayJobs = useMemo(() => {
    return MOCK_JOBS.filter(job => getStatus(job.id) === tab)
      .sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
  }, [getStatus, tab]);

  return (
    <AppPage width="full">
      <PageHeader
        title="My Jobs"
        icon={
          <ThemeIcon size="md" radius="xl" color="ink.9" className="xl:hidden">
            <Bookmark size={16} />
          </ThemeIcon>
        }
        hideTitleOnDesktop
        bottomSection={
          <SegmentedControl
            fullWidth
            radius="lg"
            size="md"
            value={tab}
            onChange={(value) => setTab(value as 'saved' | 'applied')}
            data={[
              { label: 'Saved', value: 'saved' },
              { label: 'Applied', value: 'applied' },
            ]}
            color="ink.9"
          />
        }
      />

	      <PageSection compactTop>
	          {displayJobs.length === 0 ? (
	            <EmptyState
	              icon={<Bookmark size={24} color="var(--mantine-color-sage-5)" />}
              title={`No jobs ${tab} yet`}
              description={`Jobs you mark as ${tab} will appear here.`}
            />
          ) : (
            <Flex direction="column" gap={0} pb={24}>
              <AnimatePresence mode="popLayout">
                {displayJobs.map(job => (
                  <motion.div 
                    layout
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  >
                    <JobCard job={job} status={tab} variant="my-jobs" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </Flex>
          )}
      </PageSection>
    </AppPage>
  );
}

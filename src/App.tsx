import { BrowserRouter as Router, Routes, Route, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { Feed } from './pages/Feed';
import { JobDetail } from './pages/JobDetail';
import { SavedApplied } from './pages/SavedApplied';
import { Preferences } from './pages/Preferences';
import { Navigation } from './components/Navigation';
import { DesktopHeader } from './components/DesktopHeader';
import ScrollToTop from './components/ScrollToTop';
import { Target } from 'lucide-react';
import { useDesktop } from './lib/useDesktop';
import { useEffect } from 'react';
import { Notifications } from '@mantine/notifications';
import { Box, Flex, Text, Center } from '@mantine/core';

function GlobalLayout() {
  const isDesktop = useDesktop();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const jobId = searchParams.get('job');

  useEffect(() => {
    if (isDesktop && location.pathname.startsWith('/jobs/')) {
      // If we land on a job detail route directly while on desktop, seamlessly
      // migrate it to the master-detail pattern with the feed on the left.
      const id = location.pathname.split('/')[2];
      if (id) {
        navigate(`/?job=${id}`, { replace: true });
      }
    }

    if (!isDesktop && location.pathname === '/' && jobId) {
      // In narrow/mobile views, `?job=` should resolve to the standalone detail route.
      navigate(`/jobs/${jobId}`, { replace: true });
    }
  }, [isDesktop, jobId, location.pathname, navigate]);

  const isPrefs = location.pathname.startsWith('/prefs');

  return (
    <Box
      bg="sage.0"
      pos="relative"
      style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}
      className="xl:h-screen xl:overflow-hidden xl:pt-16"
    >
      <DesktopHeader />
      
      {isPrefs ? (
        <div className="relative flex w-full flex-1 bg-transparent xl:overflow-hidden">
          <Box
            className="hide-scrollbar h-full w-full xl:overflow-y-auto"
          >
            <Routes>
              <Route path="/prefs" element={<Preferences />} />
            </Routes>
          </Box>
        </div>
      ) : (
        <div className="relative flex w-full flex-1 xl:mx-auto xl:max-w-[var(--app-shell-max-width)] xl:overflow-hidden">
          <Box 
            className="w-full shrink-0 xl:h-full xl:overflow-y-auto"
            style={{ 
              borderRight: isDesktop ? '1px solid var(--mantine-color-sage-2)' : 'none',
              backgroundColor: isDesktop ? 'var(--mantine-color-surface-0)' : 'transparent',
              width: isDesktop ? 'var(--app-feed-pane-width)' : '100%',
            }}
          >
            <Routes>
              <Route path="/" element={<Feed />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/saved" element={<SavedApplied />} />
            </Routes>
          </Box>

          {/* Right Side: Only visible on Desktop */}
          {isDesktop && (
            <div className="hidden flex-1 items-start justify-center overflow-hidden p-6 xl:flex" style={{ backgroundColor: 'transparent' }}>
                 <Box 
                   className="flex h-full w-full max-w-5xl flex-col overflow-hidden"
                   style={{
                     backgroundColor: 'var(--mantine-color-surface-0)',
                     border: '1px solid var(--mantine-color-sage-2)',
                     borderRadius: 'var(--app-radius-lg)',
                     boxShadow: 'var(--app-shadow-md)',
                   }}
                 >
                 {jobId ? (
                    <JobDetail embeddedId={jobId} />
                 ) : (
                    <Center w="100%" h="100%" p="xl" style={{ flexDirection: 'column', backgroundColor: 'var(--mantine-color-surface-0)', gap: '1rem' }}>
                      <Flex align="center" justify="center" w={64} h={64} style={{ borderRadius: '1rem', backgroundColor: 'var(--mantine-color-surface-0)', border: '1px dashed var(--mantine-color-sage-3)' }}>
                        <Target size={32} color="var(--mantine-color-sage-4)" />
                      </Flex>
                      <Box ta="center" maw={280}>
                        <Text fw={600} c="ink.9">No Job Selected</Text>
                        <Text size="sm" c="ink.6">Select a job from the list to analyze its details.</Text>
                      </Box>
                    </Center>
                 )}
               </Box>
            </div>
          )}
        </div>
      )}
      <Navigation />
      <Notifications position="bottom-center" />
    </Box>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <GlobalLayout />
    </Router>
  );
}

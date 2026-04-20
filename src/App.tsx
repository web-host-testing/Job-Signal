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
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        height: isDesktop ? '100dvh' : undefined,
        overflow: isDesktop ? 'hidden' : undefined,
        paddingTop: isDesktop ? '4rem' : undefined,
      }}
    >
      <DesktopHeader />

      {isPrefs ? (
        <Box
          style={{
            position: 'relative',
            display: 'flex',
            width: '100%',
            flex: 1,
            justifyContent: 'center',
            overflow: isDesktop ? 'hidden' : undefined,
            maxWidth: isDesktop ? 'var(--app-shell-max-width)' : undefined,
            marginInline: isDesktop ? 'auto' : undefined,
          }}
        >
          <Box
            className="hide-scrollbar"
            style={{
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              overflowY: isDesktop ? 'auto' : undefined,
            }}
          >
            <Box w="100%">
              <Routes>
                <Route path="/prefs" element={<Preferences />} />
              </Routes>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box
          style={{
            position: 'relative',
            display: 'flex',
            width: '100%',
            flex: 1,
            overflow: isDesktop ? 'hidden' : undefined,
            maxWidth: isDesktop ? 'var(--app-shell-max-width)' : undefined,
            marginInline: isDesktop ? 'auto' : undefined,
          }}
        >
          <Box
            style={{
              width: isDesktop ? 'var(--app-feed-pane-width)' : '100%',
              flexShrink: 0,
              height: isDesktop ? '100%' : undefined,
              overflowY: isDesktop ? 'auto' : undefined,
              borderRight: isDesktop ? '1px solid var(--mantine-color-sage-2)' : 'none',
              backgroundColor: isDesktop ? 'var(--mantine-color-surface-0)' : 'transparent',
            }}
          >
            <Routes>
              <Route path="/" element={<Feed />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/saved" element={<SavedApplied />} />
            </Routes>
          </Box>

          {isDesktop && (
            <Flex
              style={{
                flex: 1,
                alignItems: 'flex-start',
                justifyContent: 'center',
                overflow: 'hidden',
                padding: '1.5rem',
                backgroundColor: 'transparent',
              }}
            >
              <Box
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  height: '100%',
                  maxWidth: '64rem',
                  overflow: 'hidden',
                  backgroundColor: 'var(--mantine-color-surface-0)',
                  border: '1px solid var(--mantine-color-sage-2)',
                  borderRadius: 'var(--app-radius-lg)',
                  boxShadow: 'var(--app-shadow-md)',
                }}
              >
                {jobId ? (
                  <JobDetail embeddedId={jobId} />
                ) : (
                  <Center
                    w="100%"
                    h="100%"
                    p="xl"
                    style={{
                      flexDirection: 'column',
                      backgroundColor: 'var(--mantine-color-surface-0)',
                      gap: '1rem',
                    }}
                  >
                    <Flex
                      align="center"
                      justify="center"
                      w={64}
                      h={64}
                      style={{
                        borderRadius: '1rem',
                        backgroundColor: 'var(--mantine-color-surface-0)',
                        border: '1px dashed var(--mantine-color-sage-3)',
                      }}
                    >
                      <Target size={32} color="var(--mantine-color-sage-4)" />
                    </Flex>
                    <Box ta="center" maw={280}>
                      <Text fw={600} c="ink.9">
                        No Job Selected
                      </Text>
                      <Text size="sm" c="ink.6">
                        Select a job from the list to analyze its details.
                      </Text>
                    </Box>
                  </Center>
                )}
              </Box>
            </Flex>
          )}
        </Box>
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

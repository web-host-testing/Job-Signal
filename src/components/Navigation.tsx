import { Link, useLocation } from 'react-router-dom';
import { Box, Flex, Text } from '@mantine/core';
import { primaryNavLinks } from '../navigation';

export function Navigation() {
  const location = useLocation();
  const path = location.pathname;

  if (path.startsWith('/jobs/')) {
    return null;
  }

  return (
    <Box component="nav" bg="surface.0" className="fixed bottom-0 w-full pb-safe z-50 xl:hidden" style={{ borderTop: '1px solid var(--mantine-color-sage-2)' }}>
      <Flex justify="space-around" align="center" h={64} maw={448} mx="auto">
        {primaryNavLinks.map((link) => {
          const Icon = link.icon;
          const isActive = path === link.href || (link.href !== '/' && path.startsWith(link.href));
          return (
            <Box
              component={Link}
              key={link.name}
              to={link.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                color: isActive ? 'var(--mantine-color-ink-9)' : 'var(--mantine-color-sage-5)',
                textDecoration: 'none',
              }}
            >
              <Box mb={4} c={isActive ? 'ink.9' : 'sage.5'}>
                <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} />
              </Box>
              <Text size="xs" fw={isActive ? 600 : 500}>{link.name}</Text>
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
}

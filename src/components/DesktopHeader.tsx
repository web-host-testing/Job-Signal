import { Link, useLocation } from 'react-router-dom';
import { Target } from 'lucide-react';
import { Box, Flex, Group, Button, ThemeIcon, Text } from '@mantine/core';
import { primaryNavLinks } from '../navigation';

export function DesktopHeader() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <Box 
      component="header" 
      bg="surface.0" 
      className="hidden xl:flex w-full h-16 shrink-0 z-50 fixed top-0 left-0 right-0"
      style={{ borderBottom: '1px solid var(--mantine-color-sage-2)' }}
    >
      <Flex w="100%" maw="var(--app-shell-max-width)" mx="auto" px={24} justify="space-between" align="center">
        <Box component={Link} to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ThemeIcon size="lg" radius="xl" color="ink.9">
            <Target size={20} />
          </ThemeIcon>
          <Text fw={700} size="lg" c="ink.9" style={{ letterSpacing: '-0.5px' }}>Job Radar</Text>
        </Box>
        
        <Group gap="xs">
          {primaryNavLinks.map((link) => {
            const Icon = link.icon;
            const isActive = path === link.href || (link.href !== '/' && path.startsWith(link.href));
            return (
               <Button
                key={link.name}
                component={Link}
               to={link.href}
                variant={isActive ? "light" : "subtle"}
                color={isActive ? "ink" : "ink"}
                leftSection={<Icon size={16} />}
                radius="md"
                size="sm"
                styles={{
                  root: {
                    backgroundColor: isActive ? 'var(--mantine-color-sage-1)' : undefined,
                    color: isActive ? 'var(--mantine-color-ink-9)' : 'var(--mantine-color-ink-7)',
                    border: isActive ? '1px solid var(--mantine-color-sage-2)' : '1px solid transparent',
                    boxShadow: isActive ? 'var(--app-shadow-sm)' : undefined,
                    transition: 'background-color 160ms ease, color 160ms ease, border-color 160ms ease',
                    '&:hover': {
                      backgroundColor: 'var(--mantine-color-sage-1)',
                      color: isActive ? 'var(--mantine-color-ink-9)' : 'var(--mantine-color-ink-8)',
                    },
                  }
                }}
              >
                {link.name}
              </Button>
            );
          })}
        </Group>
      </Flex>
    </Box>
  );
}

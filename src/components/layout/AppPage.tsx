import type { ReactNode } from 'react';
import { Box, Group, Stack, Text, Title } from '@mantine/core';
import { cn } from '../../lib/utils';
import { mobileContentInset } from '../../layout';

type AppPageWidth = 'pane' | 'wide' | 'full';

interface AppPageProps {
  children: ReactNode;
  width?: AppPageWidth;
  withBottomNavSpace?: boolean;
}
interface PageSectionProps {
  children: ReactNode;
  as?: 'main' | 'section' | 'div';
  compactTop?: boolean;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  rightSection?: ReactNode;
  bottomSection?: ReactNode;
  hideTitleOnDesktop?: boolean;
}

const pageWidths: Record<Exclude<AppPageWidth, 'full'>, number> = {
  pane: 720,
  wide: 1080,
};

export function AppPage({
  children,
  width = 'pane',
  withBottomNavSpace = true,
}: AppPageProps) {
  const widthStyle =
    width === 'full'
      ? undefined
      : {
          maxWidth: pageWidths[width],
          marginInline: 'auto',
        };

  return (
    <Box bg="sage.0" style={{ flex: 1, minHeight: '100%' }}>
      <Box
        w="100%"
        pb={withBottomNavSpace ? { base: 88, xl: 0 } : 0}
        style={{
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          ...widthStyle,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export function PageHeader({
  title,
  subtitle,
  icon,
  rightSection,
  bottomSection,
  hideTitleOnDesktop = false,
}: PageHeaderProps) {
  return (
    <Box
      component="header"
      px={{ base: mobileContentInset, xl: 'lg' }}
      py="md"
      bg="sage.0"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <Stack gap={bottomSection ? 'sm' : 0}>
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Stack gap={4} className={cn(hideTitleOnDesktop && 'xl:hidden')}>
            <Group gap="xs" wrap="nowrap">
              {icon}
              <Title order={1} size="h4" c="ink.9" style={{ letterSpacing: '-0.03em' }}>
                {title}
              </Title>
            </Group>
            {subtitle ? (
              <Text size="sm" c="ink.5">
                {subtitle}
              </Text>
            ) : null}
          </Stack>
          {rightSection}
        </Group>
        {bottomSection}
      </Stack>
    </Box>
  );
}

export function PageSection({ children, as = 'main', compactTop = false }: PageSectionProps) {
  return (
    <Box
      component={as}
      flex={1}
      px={{ base: mobileContentInset, xl: 'lg' }}
      pt={compactTop ? { base: 'sm', xl: 'sm' } : { base: 'md', xl: 'lg' }}
      pb={{ base: 'md', xl: 'lg' }}
      style={{ overflow: 'hidden' }}
    >
      {children}
    </Box>
  );
}

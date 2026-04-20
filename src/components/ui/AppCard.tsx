import type { ReactNode } from 'react';
import { Box, type BoxProps } from '@mantine/core';

interface AppCardProps extends BoxProps {
  children?: ReactNode;
  selected?: boolean;
  interactive?: boolean;
}

export function AppCard({
  selected = false,
  interactive = false,
  style,
  children,
  ...props
}: AppCardProps) {
  return (
    <Box
      style={{
        backgroundColor: 'var(--mantine-color-surface-0)',
        border: selected
          ? '1px solid var(--mantine-color-ink-3)'
          : '1px solid var(--mantine-color-sage-2)',
        borderRadius: 'var(--app-radius-lg)',
        boxShadow: selected
          ? '0 0 0 1px rgba(59, 63, 60, 0.08), 0 8px 22px rgba(26, 28, 26, 0.08)'
          : 'var(--app-shadow-sm)',
        transition: interactive ? 'border-color 160ms ease, box-shadow 160ms ease' : undefined,
        ...(style as object),
      }}
      {...props}
    >
      {children}
    </Box>
  );
}

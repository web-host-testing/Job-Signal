import type { ReactNode } from 'react';
import { Box, Stack, Text, Title } from '@mantine/core';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <Stack align="center" justify="center" py={56} px="md" ta="center" gap="sm">
      <Box
        w={64}
        h={64}
        bg="surface.0"
        style={{
          borderRadius: '999px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px dashed var(--mantine-color-sage-3)',
        }}
      >
        {icon}
      </Box>
      <Title order={3} size="h4" c="ink.9">
        {title}
      </Title>
      <Text size="sm" c="ink.5" maw={320}>
        {description}
      </Text>
    </Stack>
  );
}

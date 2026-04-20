import type { ReactNode } from 'react';
import { Group, Stack, Text, Title } from '@mantine/core';

interface SectionHeaderProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  rightSection?: ReactNode;
  marginBottom?: string | number;
}

export function SectionHeader({
  icon,
  title,
  description,
  rightSection,
  marginBottom = 'md',
}: SectionHeaderProps) {
  return (
    <Stack gap={description ? 4 : 0} mb={marginBottom}>
      <Group justify="space-between" align="flex-start" wrap="nowrap" gap="sm">
        <Group gap="sm" wrap="nowrap">
          {icon}
          <Title order={2} size="1.05rem" c="ink.9" style={{ letterSpacing: '-0.02em' }}>
            {title}
          </Title>
        </Group>
        {rightSection}
      </Group>
      {description ? (
        <Text size="sm" c="ink.6">
          {description}
        </Text>
      ) : null}
    </Stack>
  );
}

import { Bus, Clock3, DollarSign, type LucideIcon } from 'lucide-react';
import { Box, Group, Text } from '@mantine/core';

interface JobMetaRowProps {
  pay?: string | null;
  hours: string;
  transitMinutes: number;
  compact?: boolean;
}

export function JobMetaRow({
  pay,
  hours,
  transitMinutes,
  compact = false,
}: JobMetaRowProps) {
  const normalizeHours = (rawHours: string) => {
    const condensed = rawHours
      .split('(')[0]
      .replace(/\bhours?\b/gi, '')
      .replace(/\bhrs?\/?wk\b/gi, '')
      .replace(/\bhrs?\b/gi, '')
      .replace(/\/\s*week/gi, '')
      .trim();

    return condensed ? `${condensed} hrs/wk` : 'Hours not listed';
  };

  const facts: Array<{ label: string; icon: LucideIcon; emphasized?: boolean }> = [
    {
      label: pay || (compact ? 'Not listed' : 'Pay not listed'),
      icon: DollarSign,
      emphasized: true,
    },
    { label: normalizeHours(hours), icon: Clock3 },
    { label: compact ? `${transitMinutes} min` : `${transitMinutes} min transit`, icon: Bus },
  ];

  return (
    <Group gap={compact ? 4 : 6} wrap="wrap">
      {facts.map((fact) => {
        const Icon = fact.icon;

        return (
          <Box
            key={fact.label}
            px={compact ? 8 : 10}
            py={compact ? 3 : 5}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: compact ? '0.25rem' : '0.3125rem',
              backgroundColor: 'var(--app-surface-muted)',
              border: 'var(--app-border-subtle)',
              borderRadius: 'var(--mantine-radius-md)',
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
          >
            <Icon
              size={compact ? 10 : 12}
              color={fact.emphasized ? 'var(--mantine-color-ink-7)' : 'var(--mantine-color-sage-6)'}
            />
            <Text
              size={compact ? '0.75rem' : '0.8125rem'}
              fw={fact.emphasized ? 650 : 600}
              c={fact.emphasized ? 'ink.8' : 'ink.6'}
              style={{ letterSpacing: 'var(--app-body-tracking)', lineHeight: 1.15 }}
            >
              {fact.label}
            </Text>
          </Box>
        );
      })}
    </Group>
  );
}

import type { ReactNode } from 'react';
import { Badge } from '@mantine/core';

export type SignalTone = 'neutral' | 'success' | 'warning' | 'danger' | 'quick-win';

interface SignalBadgeProps {
  label: string;
  tone?: SignalTone;
  leftSection?: ReactNode;
  size?: 'sm' | 'md';
  prominent?: boolean;
  bookmark?: boolean;
}

const toneMap: Record<SignalTone, { color: string; variant: 'light' | 'outline' | 'default' }> =
  {
    neutral: { color: 'sage', variant: 'outline' },
    success: { color: 'teal', variant: 'light' },
    warning: { color: 'yellow', variant: 'light' },
    danger: { color: 'red', variant: 'light' },
    'quick-win': { color: 'lime', variant: 'light' },
  };

export function SignalBadge({
  label,
  tone = 'neutral',
  leftSection,
  size = 'sm',
  prominent = false,
  bookmark = false,
}: SignalBadgeProps) {
  const config = toneMap[tone];

  return (
    <Badge
      color={config.color}
      variant={config.variant}
      size={size}
      leftSection={leftSection}
      styles={{
        section: {
          marginInlineEnd: leftSection ? 6 : undefined,
          display: 'flex',
          alignItems: 'center',
        },
        root: {
          paddingInline: bookmark ? 18 : prominent ? 12 : 10,
          minHeight: bookmark ? 42 : prominent ? 26 : undefined,
          fontSize: bookmark ? '0.95rem' : prominent ? '0.75rem' : '0.72rem',
          fontWeight: prominent || bookmark ? 700 : 600,
          borderColor: tone === 'neutral' ? 'var(--mantine-color-sage-3)' : undefined,
          borderRadius: bookmark ? '0 0 14px 14px' : undefined,
          letterSpacing: '-0.01em',
        },
      }}
    >
      {label}
    </Badge>
  );
}

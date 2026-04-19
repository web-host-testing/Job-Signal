import { createTheme } from '@mantine/core';

export const appTheme = createTheme({
  primaryColor: 'ink',
  primaryShade: 9,
  defaultRadius: 'md',
  fontFamily: 'Inter, sans-serif',
  headings: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: '700',
  },
  radius: {
    xs: '0.25rem',
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  colors: {
    sage: [
      '#F4F5F2',
      '#ECEEE8',
      '#DDE0D8',
      '#D1D5CC',
      '#C2C7BC',
      '#B3BAAD',
      '#A1A993',
      '#8F977F',
      '#7F866F',
      '#6E7560',
    ],
    ink: [
      '#F5F5F5',
      '#E8E9E8',
      '#D4D6D4',
      '#B9BDB9',
      '#9EA39E',
      '#858A85',
      '#6A706A',
      '#505650',
      '#343934',
      '#1A1C1A',
    ],
    surface: [
      '#FCFDFB',
      '#F6F7F4',
      '#EEF0EB',
      '#E3E7E0',
      '#D8DDD4',
      '#CAD1C6',
      '#B9C2B5',
      '#A5AFA0',
      '#8E9788',
      '#798271',
    ],
  },
  components: {
    Paper: {
      defaultProps: {
        radius: 'lg',
      },
      styles: {
        root: {
          backgroundColor: 'var(--mantine-color-surface-0)',
          border: '1px solid var(--mantine-color-sage-2)',
          boxShadow: 'var(--app-shadow-sm)',
        },
      },
    },
    Button: {
      defaultProps: {
        radius: 'md',
        fw: 600,
      },
      styles: {
        root: {
          letterSpacing: '-0.01em',
        },
      },
    },
    ActionIcon: {
      defaultProps: {
        radius: 'md',
      },
    },
    Badge: {
      defaultProps: {
        radius: 'sm',
        fw: 600,
        size: 'sm',
      },
      styles: {
        root: {
          textTransform: 'none',
          letterSpacing: 0,
        },
      },
    },
    SegmentedControl: {
      styles: {
        root: {
          backgroundColor: 'var(--mantine-color-surface-0)',
          border: '1px solid var(--mantine-color-sage-2)',
          padding: 4,
        },
        indicator: {
          backgroundColor: 'var(--mantine-color-sage-1)',
          boxShadow: 'none',
        },
        label: {
          fontWeight: 600,
          color: 'var(--mantine-color-ink-7)',
        },
      },
    },
    Input: {
      styles: {
        input: {
          backgroundColor: 'var(--mantine-color-surface-1)',
          border: '1px solid var(--mantine-color-sage-2)',
        },
      },
    },
    InputWrapper: {
      styles: {
        label: {
          color: 'var(--mantine-color-ink-8)',
          fontSize: '0.8125rem',
          fontWeight: 600,
          marginBottom: 6,
        },
        description: {
          color: 'var(--mantine-color-ink-5)',
          fontSize: '0.75rem',
        },
      },
    },
    Switch: {
      styles: {
        label: {
          color: 'var(--mantine-color-ink-8)',
          fontSize: '0.875rem',
          fontWeight: 600,
        },
      },
    },
    Accordion: {
      styles: {
        item: {
          border: '1px solid var(--mantine-color-sage-2)',
          backgroundColor: 'var(--mantine-color-surface-0)',
        },
        control: {
          paddingBlock: '0.875rem',
          color: 'var(--mantine-color-ink-8)',
          fontWeight: 600,
        },
      },
    },
  },
});

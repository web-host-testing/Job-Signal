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
    signalNeutral: [
      '#F6F7F4',
      '#EEF0EB',
      '#E3E7E0',
      '#D8DDD4',
      '#C9CFC4',
      '#B6BEB0',
      '#9EA897',
      '#848F7C',
      '#687360',
      '#4F564A',
    ],
    signalSuccess: [
      '#F2F9F5',
      '#E6F2EA',
      '#D4E8DC',
      '#C2DDCF',
      '#AAD0BA',
      '#8DBEA0',
      '#6FA987',
      '#568B6C',
      '#3E6E52',
      '#2C5A42',
    ],
    signalWarning: [
      '#FFFAEF',
      '#FFF4DE',
      '#FCE8BE',
      '#F2DAA0',
      '#E8CB82',
      '#DDBA61',
      '#C79F3F',
      '#A78329',
      '#876817',
      '#6B500C',
    ],
    signalDanger: [
      '#FFF4F4',
      '#FFE7E7',
      '#FCD2D2',
      '#F2BABA',
      '#E59E9E',
      '#D67F7F',
      '#BE6161',
      '#9E4747',
      '#822F2F',
      '#692020',
    ],
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
          backgroundColor: 'var(--app-surface-base)',
          border: 'var(--app-border-subtle)',
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
          border: 'var(--app-border-subtle)',
        },
      },
    },
    SegmentedControl: {
      styles: {
        root: {
          backgroundColor: 'var(--app-surface-base)',
          border: 'var(--app-border-subtle)',
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
          backgroundColor: 'var(--app-surface-muted)',
          border: 'var(--app-border-subtle)',
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
          border: 'var(--app-border-subtle)',
          backgroundColor: 'var(--app-surface-base)',
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

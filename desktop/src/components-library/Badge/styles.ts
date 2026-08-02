export const badgeStyles = {
  container: {
    position: 'relative' as const,
    display: 'inline-flex' as const,
  },
  badge: (variant: string) => {
    const colors: Record<string, string> = {
      primary: '#2196F3',
      success: '#4CAF50',
      error: '#F44336',
      warning: '#FFC107',
    };
    return {
      padding: '2px 6px',
      borderRadius: 10,
      background: colors[variant] || colors.primary,
      color: '#fff',
      fontSize: 10,
      fontWeight: 'bold' as const,
      lineHeight: '1',
      display: 'inline-block',
    };
  }
};

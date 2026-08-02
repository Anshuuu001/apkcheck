export const chipStyles = {
  chip: (selected: boolean) => ({
    padding: '6px 12px',
    borderRadius: 16,
    background: selected ? '#2196F3' : '#1a1d2e',
    border: `1px solid ${selected ? '#2196F3' : '#252840'}`,
    color: selected ? '#fff' : '#c5cae9',
    fontSize: 12,
    fontWeight: 'bold' as const,
    display: 'inline-flex',
    alignItems: 'center',
    cursor: 'pointer',
    marginRight: 6,
    marginBottom: 6,
  })
};

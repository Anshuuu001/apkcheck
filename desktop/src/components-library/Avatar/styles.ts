export const avatarStyles = {
  container: (size: number, shape: 'circle' | 'square') => ({
    width: size,
    height: size,
    borderRadius: shape === 'circle' ? size / 2 : 8,
    overflow: 'hidden' as const,
    background: '#252840',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  placeholder: {
    color: '#8c98bc',
    fontSize: 14,
    fontWeight: 'bold' as const,
  }
};

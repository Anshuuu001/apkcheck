import React from 'react';
import { avatarStyles } from './styles';

interface AvatarProps {
  imageUrl?: string;
  size?: number;
  shape?: 'circle' | 'square';
}

export const AvatarComponent: React.FC<AvatarProps> = ({ imageUrl, size = 48, shape = 'circle' }) => {
  return (
    <div style={avatarStyles.container(size, shape)}>
      {imageUrl ? (
        <img src={imageUrl} alt="Avatar" style={avatarStyles.image} />
      ) : (
        <span style={avatarStyles.placeholder}>U</span>
      )}
    </div>
  );
};

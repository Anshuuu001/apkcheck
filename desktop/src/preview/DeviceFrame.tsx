import React from 'react';
import type { ThemeTokens } from '../blueprint/schema';

export type DeviceType = 'phone' | 'tablet' | 'desktop';

export const DEVICE_CONFIGS: Record<DeviceType, { width: number; height: number; label: string }> = {
  phone: { width: 390, height: 844, label: 'iPhone 14' },
  tablet: { width: 820, height: 1180, label: 'iPad Pro' },
  desktop: { width: 1280, height: 800, label: 'Desktop' },
};

export const PhoneFrame: React.FC<{ children: React.ReactNode; theme: ThemeTokens; scale: number }> = ({ children, theme, scale }) => (
  <div style={{
    position: 'relative',
    width: 390 * scale,
    height: 844 * scale,
    borderRadius: 44 * scale,
    background: '#1A1A1A',
    padding: 10 * scale,
    boxShadow: `0 ${30 * scale}px ${80 * scale}px rgba(0,0,0,0.7), 0 0 0 ${2 * scale}px #333, inset 0 0 0 ${1 * scale}px #555`,
  }}>
    {/* Dynamic Island */}
    <div style={{
      position: 'absolute',
      top: 14 * scale,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 120 * scale,
      height: 34 * scale,
      background: '#000',
      borderRadius: 20 * scale,
      zIndex: 10,
    }} />

    {/* Screen content */}
    <div style={{
      width: '100%',
      height: '100%',
      borderRadius: 36 * scale,
      overflow: 'hidden',
      background: theme.colors.background,
      position: 'relative',
    }}>
      {/* Status bar */}
      <div style={{
        height: 48 * scale,
        background: theme.colors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `0 ${16 * scale}px`,
        paddingTop: 14 * scale,
      }}>
        <span style={{ fontSize: 11 * scale, fontWeight: 700, color: theme.colors.onBackground, fontFamily: theme.typography.fontFamily }}>9:41</span>
        <div style={{ display: 'flex', gap: 4 * scale, alignItems: 'center' }}>
          <span style={{ fontSize: 10 * scale, color: theme.colors.onBackground }}>●●●●</span>
          <span style={{ fontSize: 9 * scale, color: theme.colors.onBackground }}>WiFi</span>
          <span style={{ fontSize: 10 * scale, color: theme.colors.onBackground }}>🔋</span>
        </div>
      </div>

      {/* App content */}
      <div style={{ height: `calc(100% - ${48 * scale}px)`, overflow: 'hidden' }}>
        {children}
      </div>
    </div>

    {/* Home indicator */}
    <div style={{
      position: 'absolute',
      bottom: 22 * scale,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 130 * scale,
      height: 5 * scale,
      background: '#fff',
      borderRadius: 3 * scale,
      opacity: 0.6,
    }} />

    {/* Side buttons */}
    <div style={{ position: 'absolute', left: -4 * scale, top: 130 * scale, width: 4 * scale, height: 30 * scale, background: '#444', borderRadius: `${2 * scale}px 0 0 ${2 * scale}px` }} />
    <div style={{ position: 'absolute', left: -4 * scale, top: 175 * scale, width: 4 * scale, height: 50 * scale, background: '#444', borderRadius: `${2 * scale}px 0 0 ${2 * scale}px` }} />
    <div style={{ position: 'absolute', left: -4 * scale, top: 235 * scale, width: 4 * scale, height: 50 * scale, background: '#444', borderRadius: `${2 * scale}px 0 0 ${2 * scale}px` }} />
    <div style={{ position: 'absolute', right: -4 * scale, top: 150 * scale, width: 4 * scale, height: 70 * scale, background: '#444', borderRadius: `0 ${2 * scale}px ${2 * scale}px 0` }} />
  </div>
);

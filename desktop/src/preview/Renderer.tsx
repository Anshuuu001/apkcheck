import React, { useState } from 'react';
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import type { ScreenBlueprint, ThemeTokens } from '../blueprint/schema';
import { DEVICE_CONFIGS, PhoneFrame, type DeviceType } from './DeviceFrame';
import { CanvasGrid } from './Grid';
import { Canvas } from './Canvas';
import { PropertyInspector } from './Inspector';
import { SelectionOutline } from './Selection';

interface PreviewRendererProps {
  screen: ScreenBlueprint;
  theme: ThemeTokens;
  deviceType?: DeviceType;
  showDeviceSwitcher?: boolean;
  showScreenName?: boolean;
  onSelectComponent?: (id: string) => void;
  selectedComponentId?: string | null;
  onUpdateComponentProps?: (componentId: string, key: string, value: any) => void;
}

export const PreviewRenderer: React.FC<PreviewRendererProps> = ({
  screen,
  theme,
  deviceType: initialDevice = 'phone',
  showDeviceSwitcher = true,
  showScreenName = true,
  onSelectComponent,
  selectedComponentId,
  onUpdateComponentProps,
}) => {
  const [device, setDevice] = useState<DeviceType>(initialDevice);
  const [zoom, setZoom] = useState(0.75);

  const selectedComponent = screen.components.find(c => c.id === selectedComponentId);

  // Content scale configuration based on active device zoom
  const contentScale = device === 'phone' ? zoom : device === 'tablet' ? zoom * 0.55 : zoom * 0.4;

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, flex: 1, height: '100%', overflow: 'hidden', position: 'relative' }}>
        
        {/* Visual positioning grid */}
        <CanvasGrid />

        {/* Controls bar */}
        {(showDeviceSwitcher || showScreenName) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 16px', flexShrink: 0, zIndex: 10, background: '#0a0d16' }}>
            {showScreenName && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, background: theme.colors.primary }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#c5cae9', fontFamily: 'Inter, sans-serif' }}>
                  {screen.name}
                </span>
                <span style={{ fontSize: 10, color: '#4a5070', fontFamily: 'Inter, sans-serif' }}>
                  {screen.route}
                </span>
              </div>
            )}

            <div style={{ flex: 1 }} />

            {/* Zoom controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                onClick={() => setZoom(z => Math.max(0.4, z - 0.05))}
                style={{ width: 22, height: 22, borderRadius: 4, background: '#1a1d2e', border: '1px solid #252840', color: '#c5cae9', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >−</button>
              <span style={{ fontSize: 10, color: '#4a5070', fontFamily: 'Inter, sans-serif', minWidth: 32, textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom(z => Math.min(1.5, z + 0.05))}
                style={{ width: 22, height: 22, borderRadius: 4, background: '#1a1d2e', border: '1px solid #252840', color: '#c5cae9', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >+</button>
            </div>

            {/* Device switcher */}
            {showDeviceSwitcher && (
              <div style={{ display: 'flex', background: '#11131c', border: '1px solid #252840', borderRadius: 6, padding: 2, gap: 2 }}>
                <button
                  onClick={() => setDevice('phone')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, border: 'none', padding: '4px 8px', borderRadius: 4, fontSize: 11, cursor: 'pointer',
                    background: device === 'phone' ? '#2196F3' : 'transparent',
                    color: device === 'phone' ? '#fff' : '#8c98bc'
                  }}
                >
                  <Smartphone size={12} /> Phone
                </button>
                <button
                  onClick={() => setDevice('tablet')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, border: 'none', padding: '4px 8px', borderRadius: 4, fontSize: 11, cursor: 'pointer',
                    background: device === 'tablet' ? '#2196F3' : 'transparent',
                    color: device === 'tablet' ? '#fff' : '#8c98bc'
                  }}
                >
                  <Tablet size={12} /> Tablet
                </button>
                <button
                  onClick={() => setDevice('desktop')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, border: 'none', padding: '4px 8px', borderRadius: 4, fontSize: 11, cursor: 'pointer',
                    background: device === 'desktop' ? '#2196F3' : 'transparent',
                    color: device === 'desktop' ? '#fff' : '#8c98bc'
                  }}
                >
                  <Monitor size={12} /> Desktop
                </button>
              </div>
            )}
          </div>
        )}

        {/* Dynamic preview viewport canvas */}
        <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', padding: 24, zIndex: 1 }}>
          {device === 'phone' ? (
            <PhoneFrame theme={theme} scale={contentScale}>
              <Canvas 
                screen={screen} 
                theme={theme} 
                scale={1}
                selectedComponentId={selectedComponentId}
                onSelectComponent={onSelectComponent}
              />
            </PhoneFrame>
          ) : (
            <div style={{
              width: DEVICE_CONFIGS[device].width * contentScale,
              height: DEVICE_CONFIGS[device].height * contentScale,
              background: theme.colors.background,
              borderRadius: 8,
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              overflow: 'hidden',
            }}>
              <Canvas 
                screen={screen} 
                theme={theme} 
                scale={contentScale}
                selectedComponentId={selectedComponentId}
                onSelectComponent={onSelectComponent}
              />
            </div>
          )}
        </div>
      </div>

      {/* Embedded property sidebar inspector */}
      {selectedComponent && onUpdateComponentProps && (
        <PropertyInspector
          componentId={selectedComponent.id}
          type={selectedComponent.type}
          props={selectedComponent.props || {}}
          onChangeProp={(key, val) => onUpdateComponentProps(selectedComponent.id, key, val)}
        />
      )}
    </div>
  );
};

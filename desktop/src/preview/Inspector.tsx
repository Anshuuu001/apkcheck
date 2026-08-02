import React from 'react';

interface PropertyInspectorProps {
  componentId: string;
  type: string;
  props: Record<string, any>;
  onChangeProp: (key: string, value: any) => void;
}

export const PropertyInspector: React.FC<PropertyInspectorProps> = ({ componentId, type, props, onChangeProp }) => {
  return (
    <div style={{
      width: 240,
      background: '#11131c',
      borderLeft: '1px solid #252840',
      padding: 16,
      fontFamily: 'Inter, sans-serif',
      color: '#c5cae9',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      height: '100%',
      overflowY: 'auto',
    }}>
      <div style={{ fontSize: 13, fontWeight: 'bold', borderBottom: '1px solid #252840', paddingBottom: 8 }}>
        Inspector: {type}
      </div>
      <div style={{ fontSize: 10, color: '#4a5070' }}>ID: {componentId}</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Object.keys(props).map(key => (
          <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, color: '#8c98bc' }}>{key}</label>
            {typeof props[key] === 'boolean' ? (
              <input 
                type="checkbox" 
                checked={props[key]} 
                onChange={(e) => onChangeProp(key, e.target.checked)} 
              />
            ) : typeof props[key] === 'number' ? (
              <input 
                type="number" 
                value={props[key]} 
                onChange={(e) => onChangeProp(key, Number(e.target.value))}
                style={{ background: '#1a1d2e', border: '1px solid #252840', borderRadius: 4, padding: '4px 8px', color: '#c5cae9', fontSize: 12 }}
              />
            ) : (
              <input 
                type="text" 
                value={props[key]} 
                onChange={(e) => onChangeProp(key, e.target.value)}
                style={{ background: '#1a1d2e', border: '1px solid #252840', borderRadius: 4, padding: '4px 8px', color: '#c5cae9', fontSize: 12 }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

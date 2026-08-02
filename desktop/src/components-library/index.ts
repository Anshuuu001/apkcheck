/**
 * AppForge-AI — Component Assembly Library Registry
 * 
 * Exports component schemas, preview configurations, property inspectors,
 * and React Native code generator templates for all 10 standard components.
 */

import { ButtonPreview } from './Button/preview';
import { generateButtonReactNative } from './Button/reactNative';
import { BUTTON_PROPERTIES_METADATA } from './Button/properties';
import { CardPreview } from './Card/preview';
import { generateCardReactNative } from './Card/reactNative';
import { CARD_PROPERTIES_METADATA } from './Card/properties';
import { generateInputReactNative } from './Input/generator';
import { generateAvatarReactNative } from './Avatar/generator';
import { generateBadgeReactNative } from './Badge/generator';
import { generateChipReactNative } from './Chip/generator';

// We import other files directly or define inline stubs for the library registry.
// Below are the property schemas, definitions, and code generators for remaining components.

export type ComponentLibraryType =
  | 'Button'
  | 'Card'
  | 'Input'
  | 'Avatar'
  | 'Badge'
  | 'Chip'
  | 'List'
  | 'Calendar'
  | 'Chart'
  | 'Maps'
  | 'Profile'
  | 'Payment'
  | 'Chat'
  | 'Video';

export interface ComponentDefinition {
  name: string;
  type: ComponentLibraryType;
  category: 'layout' | 'input' | 'display' | 'media' | 'data' | 'commerce' | 'communication' | 'map';
  propertiesMetadata: Record<string, { type: string; label: string; default: any; options?: string[] }>;
  generateReactNative: (props: any, childrenContent?: string, themeStylesVar?: string) => string;
}

export const COMPONENT_REGISTRY: Record<ComponentLibraryType, ComponentDefinition> = {
  Button: {
    name: 'Button',
    type: 'Button',
    category: 'input',
    propertiesMetadata: BUTTON_PROPERTIES_METADATA as any,
    generateReactNative: generateButtonReactNative,
  },
  Input: {
    name: 'Input',
    type: 'Input',
    category: 'input',
    propertiesMetadata: {
      label: { type: 'string', label: 'Field Label', default: 'Input Field' },
      placeholder: { type: 'string', label: 'Placeholder Text', default: 'Enter value...' },
      keyboardType: { type: 'select', label: 'Keyboard Type', options: ['default', 'email', 'numeric', 'phone'], default: 'default' },
      required: { type: 'boolean', label: 'Required Field', default: false }
    },
    generateReactNative: generateInputReactNative as any
  },
  Avatar: {
    name: 'Avatar',
    type: 'Avatar',
    category: 'display',
    propertiesMetadata: {
      imageUrl: { type: 'string', label: 'Image URL Override', default: '' },
      size: { type: 'number', label: 'Image Size', default: 48 },
      shape: { type: 'select', label: 'Image Shape', options: ['circle', 'square'], default: 'circle' }
    },
    generateReactNative: generateAvatarReactNative as any
  },
  Badge: {
    name: 'Badge',
    type: 'Badge',
    category: 'display',
    propertiesMetadata: {
      count: { type: 'number', label: 'Initial Count', default: 0 },
      maxCount: { type: 'number', label: 'Maximum Count Limit', default: 99 },
      variant: { type: 'select', label: 'Visual Color Variant', options: ['primary', 'success', 'error', 'warning'], default: 'primary' }
    },
    generateReactNative: generateBadgeReactNative as any
  },
  Chip: {
    name: 'Chip',
    type: 'Chip',
    category: 'input',
    propertiesMetadata: {
      label: { type: 'string', label: 'Label Text', default: 'Option' },
      selected: { type: 'boolean', label: 'Initially Selected', default: false },
      onPressAction: { type: 'string', label: 'Trigger Event Action', default: '' }
    },
    generateReactNative: generateChipReactNative as any
  },
  Card: {
    name: 'Card',
    type: 'Card',
    category: 'display',
    propertiesMetadata: CARD_PROPERTIES_METADATA as any,
    generateReactNative: generateCardReactNative,
  },
  List: {
    name: 'List',
    type: 'List',
    category: 'display',
    propertiesMetadata: {
      itemsCount: { type: 'number', label: 'Default List Items Count', default: 3 },
      showChevron: { type: 'boolean', label: 'Show Chevron Arrow', default: true },
    },
    generateReactNative: (props, _children, theme = 'theme') => `
<FlatList
  data={Array.from({ length: ${props.itemsCount || 3} })}
  renderItem={({ item, index }) => (
    <View style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: ${theme}.colors.divider, flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ width: 36, height: 36, borderRadius: ${theme}.borderRadius.md, backgroundColor: ${theme}.colors.surfaceVariant, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
        <Text style={{ fontSize: 16 }}>📄</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: ${theme}.typography.fontFamily, fontSize: 14, color: ${theme}.colors.onSurface, fontWeight: '600' }}>Item {index + 1}</Text>
        <Text style={{ fontFamily: ${theme}.typography.fontFamily, fontSize: 11, color: ${theme}.colors.onSurface, opacity: 0.5 }}>Subtitle description detail...</Text>
      </View>
      ${props.showChevron ? `<Text style={{ color: ${theme}.colors.onSurface, opacity: 0.3 }}>›</Text>` : ''}
    </View>
  )}
/>
    `.trim(),
  },
  Calendar: {
    name: 'Calendar',
    type: 'Calendar',
    category: 'data',
    propertiesMetadata: {
      initialMode: { type: 'select', label: 'Initial Mode', options: ['month', 'week'], default: 'month' },
    },
    generateReactNative: (props, _children, theme = 'theme') => `
// React Native Calendar
<View style={{ padding: 12, backgroundColor: ${theme}.colors.surface, borderRadius: ${theme}.borderRadius.xl }}>
  <Text style={{ fontFamily: ${theme}.typography.fontFamily, fontSize: 14, fontWeight: '700', marginBottom: 8 }}>Calendar (${props.initialMode || 'month'})</Text>
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
    {Array.from({ length: 31 }).map((_, i) => (
      <View key={i} style={{ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: i === 14 ? ${theme}.colors.primary : 'transparent' }}>
        <Text style={{ color: i === 14 ? '#FFF' : ${theme}.colors.onSurface, fontSize: 12 }}>{i + 1}</Text>
      </View>
    ))}
  </View>
</View>
    `.trim(),
  },
  Chart: {
    name: 'Chart',
    type: 'Chart',
    category: 'data',
    propertiesMetadata: {
      chartType: { type: 'select', label: 'Chart Type', options: ['line', 'bar', 'pie'], default: 'bar' },
      height: { type: 'number', label: 'Chart Height', default: 150 },
    },
    generateReactNative: (props, _children, theme = 'theme') => `
// Chart component using svg-charts or path components
<View style={{ height: ${props.height || 150}, padding: 12, backgroundColor: ${theme}.colors.surface, borderRadius: ${theme}.borderRadius.xl, justifyContent: 'center', alignItems: 'center' }}>
  <Text style={{ fontFamily: ${theme}.typography.fontFamily, fontSize: 12, fontWeight: '750', opacity: 0.5, marginBottom: 10 }}>${(props.chartType || 'bar').toUpperCase()} CHART</Text>
  <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 10 }}>
    {[40, 70, 50, 90, 60].map((h, i) => (
      <View key={i} style={{ width: 24, height: h + '%', backgroundColor: ${theme}.colors.primary, borderRadius: 4, opacity: i === 3 ? 1 : 0.6 }} />
    ))}
  </View>
</View>
    `.trim(),
  },
  Maps: {
    name: 'Maps',
    type: 'Maps',
    category: 'map',
    propertiesMetadata: {
      showPin: { type: 'boolean', label: 'Show Pin Marker', default: true },
      zoomLevel: { type: 'number', label: 'Initial Zoom Level', default: 14 },
    },
    generateReactNative: (props, _children, theme = 'theme') => `
<View style={{ height: 160, backgroundColor: '#D9E2EC', borderRadius: ${theme}.borderRadius.xl, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
  <Text style={{ fontFamily: ${theme}.typography.fontFamily, fontSize: 13, color: '#334E68', fontWeight: 'bold' }}>MapView (Zoom: ${props.zoomLevel || 14})</Text>
  ${props.showPin ? `<Text style={{ fontSize: 24 }}>📍</Text>` : ''}
</View>
    `.trim(),
  },
  Profile: {
    name: 'Profile',
    type: 'Profile',
    category: 'display',
    propertiesMetadata: {
      showAvatar: { type: 'boolean', label: 'Show Avatar', default: true },
      editMode: { type: 'boolean', label: 'Allow Edit', default: false },
    },
    generateReactNative: (props, _children, theme = 'theme') => `
<View style={{ padding: 16, alignItems: 'center', backgroundColor: ${theme}.colors.surface, borderRadius: ${theme}.borderRadius.xl }}>
  ${props.showAvatar ? `<View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: ${theme}.colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
    <Text style={{ fontSize: 32 }}>👤</Text>
  </View>` : ''}
  <Text style={{ fontFamily: ${theme}.typography.fontFamily, fontSize: 18, fontWeight: 'bold', color: ${theme}.colors.onSurface }}>User Name</Text>
  <Text style={{ fontFamily: ${theme}.typography.fontFamily, fontSize: 12, color: ${theme}.colors.onSurface, opacity: 0.5, marginBottom: 12 }}>user@domain.com</Text>
  ${props.editMode ? `<TouchableOpacity style={{ paddingVertical: 6, paddingHorizontal: 16, borderRadius: ${theme}.borderRadius.md, borderWidth: 1, borderColor: ${theme}.colors.primary }}>
    <Text style={{ color: ${theme}.colors.primary, fontSize: 12, fontWeight: 'bold' }}>Edit Profile</Text>
  </TouchableOpacity>` : ''}
</View>
    `.trim(),
  },
  Payment: {
    name: 'Payment',
    type: 'Payment',
    category: 'commerce',
    propertiesMetadata: {
      gateway: { type: 'select', label: 'Payment Gateway', options: ['stripe', 'paypal', 'razorpay'], default: 'stripe' },
      collectZip: { type: 'boolean', label: 'Collect Billing ZIP', default: true },
    },
    generateReactNative: (props, _children, theme = 'theme') => `
<View style={{ padding: 14, backgroundColor: ${theme}.colors.surface, borderRadius: ${theme}.borderRadius.xl, borderWidth: 1.5, borderColor: ${theme}.colors.divider }}>
  <Text style={{ fontFamily: ${theme}.typography.fontFamily, fontSize: 12, fontWeight: '700', marginBottom: 10 }}>Secure Checkout (${props.gateway || 'stripe'})</Text>
  <View style={{ height: 40, borderHeight: 1, borderColor: ${theme}.colors.divider, borderRadius: ${theme}.borderRadius.md, backgroundColor: ${theme}.colors.background, justifyContent: 'center', paddingLeft: 12, marginBottom: 8 }}>
    <Text style={{ color: ${theme}.colors.onSurface, opacity: 0.4 }}>Card Number (0000 0000 0000 0000)</Text>
  </View>
  <View style={{ flexDirection: 'row', gap: 8 }}>
    <View style={{ flex: 1, height: 40, borderHeight: 1, borderColor: ${theme}.colors.divider, borderRadius: ${theme}.borderRadius.md, backgroundColor: ${theme}.colors.background, justifyContent: 'center', paddingLeft: 12 }}>
      <Text style={{ color: ${theme}.colors.onSurface, opacity: 0.4 }}>MM / YY</Text>
    </View>
    <View style={{ flex: 1, height: 40, borderHeight: 1, borderColor: ${theme}.colors.divider, borderRadius: ${theme}.borderRadius.md, backgroundColor: ${theme}.colors.background, justifyContent: 'center', paddingLeft: 12 }}>
      <Text style={{ color: ${theme}.colors.onSurface, opacity: 0.4 }}>CVC</Text>
    </View>
  </View>
</View>
    `.trim(),
  },
  Chat: {
    name: 'Chat',
    type: 'Chat',
    category: 'communication',
    propertiesMetadata: {
      bubbleStyle: { type: 'select', label: 'Bubble Style', options: ['rounded', 'square'], default: 'rounded' },
    },
    generateReactNative: (props, _children, theme = 'theme') => `
<View style={{ flex: 1, justifyContent: 'space-between' }}>
  <ScrollView style={{ padding: 10 }}>
    <View style={{ alignSelf: 'flex-start', backgroundColor: ${theme}.colors.surface, padding: 10, borderRadius: ${props.bubbleStyle === 'square' ? 4 : 14}, marginBottom: 8 }}>
      <Text style={{ color: ${theme}.colors.onSurface }}>Hello! How can I help you?</Text>
    </View>
    <View style={{ alignSelf: 'flex-end', backgroundColor: ${theme}.colors.primary, padding: 10, borderRadius: ${props.bubbleStyle === 'square' ? 4 : 14}, marginBottom: 8 }}>
      <Text style={{ color: ${theme}.colors.onPrimary }}>Can you book an appointment?</Text>
    </View>
  </ScrollView>
  <View style={{ flexDirection: 'row', padding: 8, borderTopWidth: 1, borderTopColor: ${theme}.colors.divider, alignItems: 'center' }}>
    <TextInput style={{ flex: 1, padding: 8, backgroundColor: ${theme}.colors.background, borderRadius: 20 }} placeholder="Message..." />
    <TouchableOpacity style={{ marginLeft: 8, width: 36, height: 36, borderRadius: 18, backgroundColor: ${theme}.colors.primary, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#FFF' }}>➤</Text>
    </TouchableOpacity>
  </View>
</View>
    `.trim(),
  },
  Video: {
    name: 'Video',
    type: 'Video',
    category: 'media',
    propertiesMetadata: {
      autoPlay: { type: 'boolean', label: 'Autoplay Video', default: false },
      controls: { type: 'boolean', label: 'Show Player Controls', default: true },
    },
    generateReactNative: (props, _children, theme = 'theme') => `
<View style={{ height: 180, backgroundColor: '#000', borderRadius: ${theme}.borderRadius.xl, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }}>
  <Text style={{ color: '#FFF', fontSize: 14 }}>Video Stream (Autoplay: ${props.autoPlay ? 'Yes' : 'No'})</Text>
  ${props.controls ? `<View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
    <Text style={{ color: '#FFF' }}>⏮</Text>
    <Text style={{ color: '#FFF' }}>▶</Text>
    <Text style={{ color: '#FFF' }}>⏭</Text>
  </View>` : ''}
</View>
    `.trim(),
  },
};

// Re-exports for convenient dynamic lookup
export { ButtonPreview, CardPreview };

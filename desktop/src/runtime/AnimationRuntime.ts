/**
 * AppForge-AI — Animation Runtime
 * 
 * Defines micro-animation presets that components use on mount, interact, and exit.
 * These are CSS keyframe-based animations for the preview canvas.
 */

export interface AnimationPreset {
  name: string;
  keyframes: Record<string, Record<string, string>>;
  duration: number;       // ms
  easing: string;
  delay?: number;         // ms
}

// ─── Preset Definitions ──────────────────────────────────────────────────────

export const ANIMATION_PRESETS: Record<string, AnimationPreset> = {
  fadeIn: {
    name: 'fadeIn',
    keyframes: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
    duration: 300,
    easing: 'ease-out',
  },
  fadeOut: {
    name: 'fadeOut',
    keyframes: { '0%': { opacity: '1' }, '100%': { opacity: '0' } },
    duration: 200,
    easing: 'ease-in',
  },
  slideUp: {
    name: 'slideUp',
    keyframes: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
    duration: 350,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  slideDown: {
    name: 'slideDown',
    keyframes: { '0%': { transform: 'translateY(-20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
    duration: 350,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  slideLeft: {
    name: 'slideLeft',
    keyframes: { '0%': { transform: 'translateX(30px)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
    duration: 300,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  scaleIn: {
    name: 'scaleIn',
    keyframes: { '0%': { transform: 'scale(0.9)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
    duration: 250,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  pulse: {
    name: 'pulse',
    keyframes: { '0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.05)' }, '100%': { transform: 'scale(1)' } },
    duration: 400,
    easing: 'ease-in-out',
  },
  shake: {
    name: 'shake',
    keyframes: {
      '0%': { transform: 'translateX(0)' },
      '25%': { transform: 'translateX(-4px)' },
      '50%': { transform: 'translateX(4px)' },
      '75%': { transform: 'translateX(-4px)' },
      '100%': { transform: 'translateX(0)' },
    },
    duration: 300,
    easing: 'ease-in-out',
  },
  staggeredFadeIn: {
    name: 'staggeredFadeIn',
    keyframes: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
    duration: 300,
    easing: 'ease-out',
    delay: 50,
  },
};

// ─── Animation Runtime ───────────────────────────────────────────────────────

export class AnimationRuntime {
  /**
   * Get a CSS animation string for a preset.
   */
  getAnimation(presetName: string, index: number = 0): string {
    const preset = ANIMATION_PRESETS[presetName];
    if (!preset) return '';
    const delay = (preset.delay || 0) * index;
    return `${preset.duration}ms ${preset.easing} ${delay}ms`;
  }

  /**
   * Get the appropriate entrance animation for a component type.
   */
  getEntranceAnimation(componentType: string): string {
    const typeAnimationMap: Record<string, string> = {
      'TopBar': 'slideDown',
      'BottomNavigation': 'slideUp',
      'Card': 'fadeIn',
      'StatCard': 'scaleIn',
      'Button': 'fadeIn',
      'ListItem': 'staggeredFadeIn',
      'MessageList': 'fadeIn',
      'Chart': 'scaleIn',
      'Avatar': 'scaleIn',
      'Image': 'fadeIn',
    };
    return typeAnimationMap[componentType] || 'fadeIn';
  }

  /**
   * Get the appropriate interaction animation for a component type.
   */
  getInteractionAnimation(componentType: string): string {
    const typeAnimationMap: Record<string, string> = {
      'Button': 'pulse',
      'FAB': 'pulse',
      'TextField': 'fadeIn',
      'Toggle': 'scaleIn',
      'ListItem': 'slideLeft',
    };
    return typeAnimationMap[componentType] || 'pulse';
  }
}

import type { LayoutTemplate } from './types';

export const ChatLayout: LayoutTemplate = {
  id: 'layout-chat',
  name: 'Chat',
  description: 'Message list, input bar, attachment picker',
  category: 'communication',
  slots: [
    { id: 'header', name: 'Chat Header', position: 'top', flex: 0, acceptsComponents: ['TopBar'], defaultComponent: 'TopBar' },
    { id: 'messages', name: 'Message List', position: 'center', flex: 5, acceptsComponents: ['MessageList', 'MessageBubble'], defaultComponent: 'MessageList' },
    { id: 'input', name: 'Input Bar', position: 'bottom', flex: 0, acceptsComponents: ['ChatInput'], defaultComponent: 'ChatInput' },
  ],
  defaultComponents: ['TopBar', 'MessageList', 'ChatInput'],
};

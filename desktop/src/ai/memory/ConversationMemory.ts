/**
 * AppForge-AI — Conversation Memory V2
 * 
 * Manages the memory of dialogues, requirement interview state,
 * and user-assistant messages.
 */

export interface MemoryMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export class ConversationMemory {
  private messages: MemoryMessage[] = [];

  addMessage(role: 'user' | 'assistant' | 'system', content: string): void {
    this.messages.push({
      role,
      content,
      timestamp: new Date().toISOString(),
    });
  }

  getHistory(): MemoryMessage[] {
    return this.messages;
  }

  clear(): void {
    this.messages = [];
  }

  serialize(): string {
    return JSON.stringify(this.messages);
  }

  deserialize(data: string): void {
    this.messages = JSON.parse(data);
  }
}

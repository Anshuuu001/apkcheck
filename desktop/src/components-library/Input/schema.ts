export interface InputSchema {
  label: string;
  placeholder: string;
  keyboardType: 'default' | 'email' | 'numeric' | 'phone';
  required: boolean;
}

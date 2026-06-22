export interface LoginFormState {
  username: string;
  password: string;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export type LoginFormAction =
  | { type: 'SET_FIELD'; field: keyof Omit<LoginFormState, 'loading' | 'error' | 'success'>; value: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SUCCESS'; payload: boolean }
  | { type: 'RESET' };

export interface LoginProps {
  onLogin?: () => void;
}
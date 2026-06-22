export interface RegisterFormState {
  username: string;
  email: string;
  character: string;
  password: string;
  confirmPassword: string;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export type RegisterFormAction =
  | { type: 'SET_FIELD'; field: keyof Omit<RegisterFormState, 'loading' | 'error' | 'success'>; value: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SUCCESS'; payload: boolean }
  | { type: 'RESET' };
import React, { useReducer } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/assets/reservoir-logo.png';
import Cover from '@/assets/loading-logo.jpeg';
import type { LoginFormState, LoginFormAction } from './types';

const loginReducer = (
  state: LoginFormState,
  action: LoginFormAction
): LoginFormState => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SUCCESS':
      return { ...state, success: action.payload };
    case 'RESET':
      return {
        ...state,
        username: '',
        password: '',
        success: false,
        error: null,
      };
    default:
      return state;
  }
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [state, dispatch] = useReducer(loginReducer, {
    username: '',
    password: '',
    loading: false,
    error: null,
    success: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    dispatch({
      type: 'SET_FIELD',
      field: name as keyof Omit<LoginFormState, 'loading' | 'error' | 'success'>,
      value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    const result = await login(state.username, state.password);

    if (result.success) {
      navigate('/'); // artık beklemeden direkt yönlendiriyor
    } else {
      dispatch({ type: 'SET_ERROR', payload: result.error || 'Login failed' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <>
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-center gap-2 md:justify-start">
            <a href="#" className="flex items-center gap-2 font-medium">
              <img src={Logo} className="h-6" alt="Logo" />
            </a>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <form className={cn('flex flex-col gap-6')} onSubmit={handleSubmit}>
                <FieldGroup>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">Login to your account</h1>
                    <p className="text-sm text-balance text-muted-foreground">
                      Enter your credentials below to login to your account
                    </p>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="username">Username</FieldLabel>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="john_doe"
                      value={state.username}
                      onChange={handleChange}
                      required
                      disabled={state.loading}
                    />
                  </Field>

                  <Field>
                    <div className="flex items-center">
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="*********"
                      value={state.password}
                      onChange={handleChange}
                      required
                      disabled={state.loading}
                    />
                  </Field>

                  <Field>
                    <Button type="submit" disabled={state.loading}>
                      {state.loading ? 'Logging in...' : 'Login'}
                    </Button>
                  </Field>

                  {state.error && (
                    <div className="text-sm text-red-500 text-center">{state.error}</div>
                  )}

                  <Field>
                    <FieldDescription className="text-center">
                      Don&apos;t have an account?{' '}
                      <Link to="/register" className="underline underline-offset-4">
                        Sign up
                      </Link>
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </form>
            </div>
          </div>
        </div>
        <div className="hidden bg-[#d50d0d] lg:flex lg:justify-center lg:items-center">
          <img
            src={Cover}
            alt="Image"
            className="h-100 inline-flex rounded-2xl 2xl:h-125"
          />
        </div>
      </div>
    </>
  );
};

export default Login;
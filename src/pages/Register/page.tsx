import React, { useReducer, useState, useEffect } from 'react';
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
import type { RegisterFormState, RegisterFormAction } from './types';

const validatePassword = (password: string, confirmPassword: string): string | null => {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
};

const formReducer = (
  state: RegisterFormState,
  action: RegisterFormAction
): RegisterFormState => {
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
        email: '',
        password: '',
        confirmPassword: '',
        success: false,
        error: null,
      };
    default:
      return state;
  }
};

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [state, dispatch] = useReducer(formReducer, {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    loading: false,
    error: null,
    success: false,
  });

  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    dispatch({
      type: 'SET_FIELD',
      field: name as keyof Omit<RegisterFormState, 'loading' | 'error' | 'success'>,
      value,
    });

    if (name === 'password' || name === 'confirmPassword') {
      const newPassword = name === 'password' ? value : state.password;
      const newConfirmPassword =
        name === 'confirmPassword' ? value : state.confirmPassword;
      const error = validatePassword(newPassword, newConfirmPassword);
      setPasswordError(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const passwordValidationError = validatePassword(
      state.password,
      state.confirmPassword
    );
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: state.username,
          email: state.email,
          password: state.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Error detail:', errorData);

        let errorMessage = 'Registration failed';
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail
              .map((err) => err.msg)
              .join(', ');
          } else {
            errorMessage = errorData.detail;
          }
        }
        throw new Error(errorMessage);
      }

      dispatch({ type: 'SET_SUCCESS', payload: true });
      navigate('/login');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      dispatch({ type: 'SET_ERROR', payload: message });
    } finally {
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
          <div className="flex flex-1 items-center justify-center mt-5">
            <div className="w-full max-w-xs">
              <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                <FieldGroup>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">Create your account</h1>
                    <p className="text-sm text-balance text-muted-foreground">
                      Fill in the form below to create your account
                    </p>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="username">Username</FieldLabel>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="mr.white"
                      value={state.username}
                      onChange={handleChange}
                      required
                      disabled={state.loading}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="m@example.com"
                      value={state.email}
                      onChange={handleChange}
                      required
                      disabled={state.loading}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
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
                    <FieldLabel htmlFor="confirmPassword">
                      Confirm Password
                    </FieldLabel>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="*********"
                      value={state.confirmPassword}
                      onChange={handleChange}
                      required
                      disabled={state.loading}
                    />
                    {passwordError && (
                      <p className="text-sm text-red-500 mt-1">{passwordError}</p>
                    )}
                  </Field>

                  <Field>
                    <Button type="submit" disabled={state.loading}>
                      {state.loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </Field>

                  {state.error && (
                    <div className="text-sm text-red-500 text-center">
                      {state.error}
                    </div>
                  )}

                  <Field>
                    <FieldDescription className="px-6 text-center">
                      Already have an account? <Link to="/login">Sign in</Link>
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

export default Register;
import { appUrl } from './shared';

/** Sign-in page copy (Figma 2385:1678 default, 2385:1037 active, 2385:862 errors). */
export const intro = {
  titleOne: 'Recruitment.',
  titleTwo: 'Running at scale.',
  body: 'The operating system behind high-performing recruitment teams.',
};

export const form = {
  title: 'Sign in',
  subtitle: 'Access your Ditto workspace.',
  email: { label: 'Work Email', placeholder: 'you@company.com' },
  password: { label: 'Password', placeholder: 'Enter your password', show: 'Show', hide: 'Hide' },
  remember: 'Remember me',
  forgot: 'Forgot Password?',
  submit: 'Sign in',
  submitting: 'Signing in…',
};

export const errors = {
  email: 'You must enter a valid email',
  password: 'Password is too short - must be at least 8 chars.',
};

export const PASSWORD_MIN = 8;

/**
 * Where the details go. The form posts straight to the app, which does the actual signing in; the marketing site
 * never handles the password itself. Both endpoints are assumptions until the app team confirms them.
 */
export const endpoints = {
  signIn: `${appUrl}/login`,
  forgot: `${appUrl}/forgot-password`,
};

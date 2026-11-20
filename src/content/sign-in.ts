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
  newHere: 'New to Ditto?',
  register: 'Create an account',
};

/** Reset password: the work email, then the emailed code and a new password, then done. */
export const reset = {
  request: {
    title: 'Reset password',
    subtitle: 'Enter your work email and we’ll send you a verification code.',
    submit: 'Send code',
    submitting: 'Sending…',
  },
  verify: {
    title: 'Check your email',
    subtitle: 'We sent a verification code to',
    code: { label: 'Verification code', placeholder: '6-digit code' },
    password: { label: 'New password', placeholder: 'At least 8 characters' },
    confirm: { label: 'Confirm new password', placeholder: 'Type it again' },
    submit: 'Reset password',
    submitting: 'Resetting…',
    resend: 'Send a new code',
    resent: 'New code sent',
  },
  done: {
    title: 'Password updated',
    subtitle: 'You can now sign in with your new password.',
    submit: 'Sign in',
  },
  back: 'Back to sign in',
};

/** Create an account: name and surname, work email, and a password typed twice. */
export const register = {
  title: 'Create account',
  subtitle: 'Set up your Ditto workspace.',
  firstName: { label: 'Name', placeholder: 'Jane' },
  lastName: { label: 'Surname', placeholder: 'Smith' },
  confirm: { label: 'Confirm password', placeholder: 'Type it again' },
  password: { label: 'Password', placeholder: 'At least 8 characters' },
  submit: 'Create account',
  submitting: 'Creating account…',
  haveAccount: 'Already have an account?',
  signIn: 'Sign in',
};

export const errors = {
  email: 'You must enter a valid email',
  password: 'Password is too short - must be at least 8 chars.',
  firstName: 'Enter your name',
  lastName: 'Enter your surname',
  confirm: 'Passwords don’t match',
  code: 'Enter the 6-digit code from the email',
};

export const PASSWORD_MIN = 8;

/**
 * Where the details go. Sign in and register post straight to the app, which does the work; the marketing site never
 * handles a password itself. All of these are assumptions until the app team confirms them. Reset password has no
 * endpoint yet, so its steps run on the page (sign-in.ts) without sending anything.
 */
export const endpoints = {
  signIn: `${appUrl}/login`,
  register: `${appUrl}/register`,
};

/** The three screens' addresses (one page, sign-in.html, with reset-password.html and register.html as entries). */
export const routes = { signin: '/sign-in', reset: '/reset-password', register: '/register' } as const;

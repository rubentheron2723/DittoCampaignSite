/* Contact copy and form options, from brief v2.2 section 3.9. */
/** Contact page copy (Figma 2396:121, 2390:340, 2396:191). */
export const hero = {
  /** Two lines in the design: "Book a demo" / "or talk to sales". */
  title: ['Book a demo', 'or talk to sales'],
  subtitle: "Tell us what you're trying to solve and we'll show you how Ditto handles it.",
  support: 'No pressure. A short conversation to see if Ditto fits the way you work.',
};

export const roles = [
  'Recruiter',
  'Recruitment Agency Owner',
  'Hiring Manager',
  'Talent Acquisition Lead',
  'HR Manager',
  'Founder / Business Owner',
  'Internal Recruitment Team',
];

export const teamSizes = ['1 to 9 recruiters', '10 to 24 recruiters', '25 to 49 recruiters', '50 or more recruiters'];

export const interests = [
  'A demo of Ditto',
  'Ditto for Claude, ChatGPT and Copilot',
  'Switching from another ATS',
  'Pricing for my team',
  'Something else',
];

/** `optional`: shown lighter, with "(optional)" after the label, and may be left empty. */
export const fields: Record<string, { label: string; placeholder?: string; optional?: boolean }> = {
  name: { label: 'Full name', placeholder: 'Your full name' },
  email: { label: 'Business email', placeholder: 'you@company.com' },
  business: { label: 'Business name', placeholder: 'Your company name' },
  website: { label: 'Business website', placeholder: 'yourcompany.com', optional: true },
  phone: { label: 'Contact number', placeholder: 'Your number' },
  role: { label: 'Your role' },
  teamSize: { label: 'Recruitment team size' },
  interest: { label: 'What you\u2019re interested in' },
  message: { label: 'Message', placeholder: 'Anything you\u2019d like us to cover in the demo?', optional: true },
};

export const submitLabel = 'Request my demo';
export const jobsLine = { lead: 'Looking for a job?', label: 'Visit ditto.jobs.', href: 'https://ditto.jobs' };

/** Dialling codes for the contact number (South Africa first, as in the design). */
export const dialCodes = [
  { code: '+27', country: 'South Africa' },
  { code: '+1', country: 'United States / Canada' },
  { code: '+44', country: 'United Kingdom' },
  { code: '+61', country: 'Australia' },
  { code: '+64', country: 'New Zealand' },
  { code: '+353', country: 'Ireland' },
  { code: '+31', country: 'Netherlands' },
  { code: '+49', country: 'Germany' },
  { code: '+971', country: 'United Arab Emirates' },
  { code: '+91', country: 'India' },
  { code: '+234', country: 'Nigeria' },
  { code: '+254', country: 'Kenya' },
];

export const errors = {
  name: 'Please enter your full name.',
  email: 'Please enter a valid business email address.',
  business: 'Please enter your business name.',
  website: 'Please enter a valid website, for example google.com.',
  phone: 'Please enter a valid contact number.',
  role: 'Please select an option.',
  teamSize: 'Please select your recruitment team size.',
  interest: 'Please select what you are interested in.',
};

/** Shown under the button when the request could not be sent; the address is a mailto link. */
export const sendError = { lead: 'We couldn\u2019t send your request. Please try again, or email us at', email: 'hello@ditto.work' };

export const success = {
  title: 'Thanks.',
  copy: 'We have your request and will be in touch within one business day.',
};

export const next = {
  title: 'What happens next?',
  steps: [
    { title: 'A guided walkthrough.', copy: 'We show you Ditto around how your team works: sourcing, jobs, collaboration and client submissions.' },
    { title: 'Your call.', copy: 'If Ditto fits, we move forward together. If not, you still leave with a clear picture.' },
    {
      title: 'Onboarding and migration.',
      copy: 'We migrate your candidates, clients, documents and history, configure your account and set up your CV templates and permissions.',
    },
  ],
  direct: { label: 'Prefer email?', email: 'hello@ditto.work' },
};

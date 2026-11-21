/**
 * Contact copy and form options, lifted from the production contact page.
 */
/** Contact page copy (Figma 2396:121, 2390:340, 2396:191). */
export const hero = {
  /** Two lines in the design: "Book a demo" / "or talk to sales". */
  title: ['Book a demo', 'or talk to sales'],
  subtitle: "Tell us what you're trying to solve and we'll point you to the right setup.",
  support: 'No sales pressure. Just a quick conversation to see if Ditto fits your workflow.',
};

export const roles = [
  'Recruiter',
  'Recruitment Agency Owner',
  'Hiring Manager',
  'Talent Acquisition Lead',
  'HR Manager',
  'Founder / Business Owner',
  'Internal Recruitment Team',
  'Candidate',
];

export const teamSizes = ['Starter (1 – 9 recruiters)', 'Growth (10 – 24 recruiters)', 'Scale (25 – 49 recruiters)', 'Enterprise (50 – 100 recruiters)'];

export const interests = [
  'Book a demo',
  'Switching from another ATS',
  'Improving recruiter productivity',
  'Scaling our recruitment team',
  'Exploring Ditto',
  'Something else',
];

export const fields = {
  name: { label: 'Full Name', placeholder: 'Your full name' },
  email: { label: 'Business Email', placeholder: 'you@company.com' },
  business: { label: 'Business Name', placeholder: 'Your company name' },
  website: { label: 'Business Website', placeholder: 'yourcompany.com' },
  phone: { label: 'Contact Number', placeholder: 'Your number' },
  role: { label: 'Your Role' },
  teamSize: { label: 'Recruitment team size' },
  interest: { label: 'What you’re interested in' },
  message: { label: 'Message', placeholder: 'Tell us the goals for the demo' },
};

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
  message: 'Please enter a message.',
};

export const success = {
  title: 'Thanks for reaching out!',
  copy: 'One of our teammates will be in touch shortly.',
};

export const next = {
  title: 'What happens next?',
  steps: [
    { title: 'A guided walkthrough', copy: 'We show you how recruiters source, manage jobs, collaborate, and submit candidates in Ditto.' },
    { title: 'Your call', copy: 'If Ditto fits your team and goals, we move forward together. If not, you still leave with a clear picture.' },
    { title: 'Onboarding and migration', copy: 'We import your database, configure your account, and set up branded templates and permissions.' },
  ],
  direct: { label: 'Prefer email?', email: 'hello@ditto.work' },
};

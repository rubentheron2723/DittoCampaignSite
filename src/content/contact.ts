/**
 * Contact copy and form options, lifted from the production contact page.
 */
export const hero = {
  title: 'Book a demo or talk to sales',
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
  name: { label: 'Full name', placeholder: 'Your full name' },
  email: { label: 'Business email', placeholder: 'you@company.com' },
  business: { label: 'Business name', placeholder: 'Company name' },
  website: { label: 'Business website', placeholder: 'company.com' },
  phone: { label: 'Contact number', placeholder: '+27 ...' },
  role: { label: 'Your role' },
  teamSize: { label: 'Recruitment team size' },
  interest: { label: "What you're interested in" },
  message: { label: 'Message', placeholder: 'Tell us your goals for the demo' },
};

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

export const aside = {
  label: 'What happens next',
  steps: [
    { title: 'A guided walkthrough', copy: 'We show you how recruiters source, manage jobs, collaborate, and submit candidates in Ditto.' },
    { title: 'Your call', copy: 'If Ditto fits your team and goals, we move forward together. If not, you still leave with a clear picture.' },
    { title: 'Onboarding and migration', copy: 'We import your database, configure your account, and set up branded templates and permissions.' },
  ],
  direct: { label: 'Prefer email?', email: 'hello@ditto.work' },
};

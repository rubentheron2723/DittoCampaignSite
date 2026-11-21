/* Pricing copy, from brief v2.2 section 3.6. The prices and the maths are unchanged. */
export type Currency = 'ZAR' | 'USD';

export type Tier = {
  label: 'Starter' | 'Growth' | 'Scale' | 'Enterprise';
  rangeLabel: string;
  description: string;
  min: number;
  max: number;
  rates: { ZAR: number; USD: number } | null;
};

export const ANNUAL_MULTIPLIER = 0.85;

export const hero = {
  titleOne: 'Recruitment software',
  titleTwo: 'pricing for growing teams.',
  subtitle: 'Simple pricing per recruiter. Every plan includes the full platform.',
  cta: 'See your price \u2193',
  body: 'The more recruiters you have, the less each licence costs. Add or remove recruiters at any time, and pay monthly or annually.',
};

export const tiers: Tier[] = [
  {
    label: 'Starter',
    rangeLabel: '1 to 9 recruiters',
    description: 'For small teams getting serious about structured hiring.',
    min: 1,
    max: 9,
    rates: { ZAR: 949, USD: 63 },
  },
  {
    label: 'Growth',
    rangeLabel: '10 to 24 recruiters',
    description: 'Built for recruiters adding momentum and scaling fast.',
    min: 10,
    max: 24,
    rates: { ZAR: 849, USD: 56 },
  },
  {
    label: 'Scale',
    rangeLabel: '25 to 49 recruiters',
    description: 'For established teams running high-volume hiring at scale.',
    min: 25,
    max: 49,
    rates: { ZAR: 749, USD: 49 },
  },
  {
    label: 'Enterprise',
    rangeLabel: '50+ recruiters',
    description: 'For larger operations that need power, flexibility, and reach.',
    min: 50,
    max: 100,
    rates: null,
  },
];

export const tierForUsers = (users: number) => tiers.find((t) => users >= t.min && users <= t.max) ?? tiers[0];

export const calculator = {
  title: 'Work out your price.',
  description: 'Priced per recruiter licence, per month. Every plan includes the full Ditto platform. Only the number of licences changes.',
  sliderLabel: 'How many recruiters?',
  annualToggle: 'Annual, save 15%',
  perRecruiter: { ZAR: 'per recruiter / month, excl. VAT', USD: 'per recruiter / month, excl. taxes' },
  monthlyTotal: { ZAR: 'Monthly total, excl. VAT', USD: 'Monthly total, excl. taxes' },
  annualTotal: { ZAR: 'Annual total, billed once upfront, excl. VAT', USD: 'Annual total, billed once upfront, excl. taxes' },
  savePrefix: 'You save ',
  saveSuffix: ' a year',
  enterprise: { big: 'Let\u2019s talk', line: 'Custom pricing for 50 or more recruiters.', button: 'Talk to us' },
  book: 'Book a demo',
  faq: { lead: 'Questions about billing?', label: 'Read the FAQ \u2192', href: '/faq#billing-contracts-licensing' },
};

export const nextSteps = {
  title: 'From first call to first placement',
  steps: [
    {
      title: 'See Ditto in action.',
      description: 'A guided walkthrough built around how your team works. Bring a job spec and we\u2019ll show you how it goes from brief to shortlist to submission.',
    },
    {
      title: 'Decide if Ditto is right for your team.',
      description: 'You\u2019ll know exactly how Ditto works and what running your desk on it would look like. If it fits, we move forward together. If it doesn\u2019t, you\u2019ve lost nothing.',
    },
    {
      title: 'Plan onboarding, migration and setup.',
      description: 'We plan the rollout with you. That includes migrating your candidates, clients, documents and history, configuring your account, setting up your branded CV templates, and defining permissions and settings.',
    },
    {
      title: 'Start sourcing, engaging and placing.',
      description: 'Once your account is set up and your data is in, your team logs in and gets to work. Training is included for every recruiter.',
    },
    {
      title: 'Ongoing support as your team grows.',
      description: 'A dedicated account manager stays with you after launch: extra configuration, training for new recruiters, and answers when your team needs them.',
    },
  ],
};

/** The four promises under the steps. */
export const guarantees = [
  { id: 'month', title: 'Month to month.', copy: 'No long-term contracts. One calendar month\u2019s notice.' },
  { id: 'minimums', title: 'No minimums.', copy: 'Start with a single licence. Add or remove recruiters whenever you need to.' },
  { id: 'start', title: 'Same-day start.', copy: 'Once your accounts are created, your team can log in the same day. Migrations add a few days.' },
  { id: 'suite', title: 'Full suite, always.', copy: 'Every feature on every plan. No modules to unlock.' },
];

/**
 * Pricing copy, lifted from the production pricing page.
 */
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
  titleOne: 'Recruitment software pricing',
  titleTwo: 'for growing teams',
  subtitle: 'Simple, transparent pricing built for recruitment teams operating at scale.',
  body:
    'Seat-based pricing that grows with your business. Add users anytime, switch between monthly or annual billing, and keep your recruitment operations running from one structured system.',
};

export const tiers: Tier[] = [
  {
    label: 'Starter',
    rangeLabel: '1 – 9 users',
    description: 'For small teams getting serious about structured hiring.',
    min: 1,
    max: 9,
    rates: { ZAR: 949, USD: 63 },
  },
  {
    label: 'Growth',
    rangeLabel: '10 – 24 users',
    description: 'Built for recruiters adding momentum and scaling fast.',
    min: 10,
    max: 24,
    rates: { ZAR: 849, USD: 56 },
  },
  {
    label: 'Scale',
    rangeLabel: '25 – 49 users',
    description: 'For established teams running high-volume hiring at scale.',
    min: 25,
    max: 49,
    rates: { ZAR: 749, USD: 49 },
  },
  {
    label: 'Enterprise',
    rangeLabel: '50 – 100 users',
    description: 'For larger operations that need power, flexibility, and reach.',
    min: 50,
    max: 100,
    rates: null,
  },
];

export const tierForUsers = (users: number) => tiers.find((t) => users >= t.min && users <= t.max) ?? tiers[0];

export const calculator = {
  title: 'Transparent pricing for teams that scale',
  description: 'Choose monthly or annual billing. Pricing is based on recruiter licenses.',
  sliderLabel: 'How many recruiters?',
  includes: 'We do not limit features or usage by license count. You always get the full suite. No modules, no paid add-ons.',
  enterprise: 'Custom pricing per recruiter license. Tailored for your team size.',
  perLicense: 'per recruiter license / month',
};

export const nextSteps = {
  title: 'From first call to first placement',
  steps: [
    {
      title: 'See Ditto in action',
      description:
        'We start with a guided walkthrough of the platform so you can see exactly how Ditto works in practice. We’ll show you how recruiters source candidates, manage jobs, collaborate with their team, and submit candidates to clients.',
    },
    {
      title: 'Decide if Ditto is right for your team',
      description:
        'After the demo, you’ll have a clear understanding of how the platform works and what it would look like to run your recruitment operations inside Ditto. If it aligns with your team and your goals, we move forward together.',
    },
    {
      title: 'Plan onboarding, migration, and setup',
      description:
        'We work with you to plan the rollout across your team. This includes importing your existing database, configuring your account, setting up branded CV templates, and defining permissions and settings.',
    },
    {
      title: 'Start sourcing, engaging, and placing immediately',
      description:
        'Once your account is configured and your data is in place, your team can begin working inside Ditto right away, all from one system designed to support recruitment at scale.',
    },
    {
      title: 'Ongoing support as your team grows',
      description:
        'Our team stays involved after launch. We help with additional configuration, answer questions from your recruiters, and make sure your team keeps getting the most value from the platform.',
    },
  ],
};

export const guarantees = [
  { title: 'Month to month', copy: 'No long-term contracts. Scale seats up or down as needed.' },
  { title: 'No minimums', copy: 'Start with a single licence and add users whenever you need to.' },
  { title: 'Same-day start', copy: 'Sign up and start using Ditto the same day. Migrations add a few days.' },
  { title: 'Full suite, always', copy: 'Every feature on every plan. No modules, no paid add-ons.' },
];

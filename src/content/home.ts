/**
 * Copy for the prototype, lifted from the production campaign site
 * (src/lib/content.ts and the home landing page) so the words are real.
 */

export const nav = [
  { label: 'Product', href: '#flow' },
  { label: 'AI', href: '#ai' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#trust' },
];

export const hero = {
  eyebrow: 'The Recruitment Operating System',
  lineOne: 'Recruitment.',
  lineTwo: 'Running at scale.',
  subhead: 'The operating system behind high-performing recruitment teams.',
  support:
    'Built to structure sourcing, engagement, and placements for teams operating at scale. One system. One flow.',
  primary: 'Book a demo',
  secondary: 'View pricing',
  rotating: [
    'The operating system for recruitment agencies.',
    'The platform behind every high-performing recruiter.',
    'People. Process. Performance.',
  ],
};

export const system = {
  lineOne: 'Everything recruiters do.',
  lineTwo: 'Running inside one system.',
  lead:
    'Ditto unifies sourcing, communication, collaboration, AI automation, reporting, and revenue tracking into one structured operating system for recruitment.',
  /** One scroll step each. The striped shape morphs per step and ends as the Ditto mark. */
  steps: [
    { name: 'Sourcing', body: 'Agentic AI search, one-click job ads to every board and smart qualifiers turn your database into a working intelligence system.' },
    { name: 'Communication', body: 'Email and calendars sync with Google and Microsoft, so every conversation sits on the right candidate and client.' },
    { name: 'Collaboration', body: 'Custom pipelines, talent pools and branded CVs keep the whole team working from one structured workflow.' },
    { name: 'AI automation', body: 'AI drafts outreach, summarises profiles and suggests matches, so recruiters focus on conversations and decisions.' },
    { name: 'Reporting', body: 'Team targets, advertising ROI and pipeline activity, visible in one place as the work happens.' },
    { name: 'Revenue', body: 'Placements connect straight to revenue and financial reporting, so leaders see how work turns into results.' },
  ],
};

export type Act = {
  id: 'source' | 'engage' | 'place';
  number: string;
  label: string;
  headline: string;
  paragraphs: string[];
  chips: string[];
};

export const acts: Act[] = [
  {
    id: 'source',
    number: '01',
    label: 'Source',
    headline: 'Build a candidate intelligence system.',
    paragraphs: [
      'Recruitment databases usually become graveyards of old resumes.',
      'Ditto turns your database into a working intelligence system. Profiles are enriched with AI summaries, structured activity history, and searchable signals.',
      'Agentic AI search surfaces the right candidates instantly across your own database.',
    ],
    chips: ['Agentic AI search', '1-click job ads', 'All job boards', 'Smart qualifiers', 'Editable matching'],
  },
  {
    id: 'engage',
    number: '02',
    label: 'Engage',
    headline: 'Execution without chaos.',
    paragraphs: [
      'Recruitment execution happens between first contact and final decision.',
      'Ditto keeps communication, scheduling, collaboration, and pipeline movement inside one structured workflow.',
      'AI assists with matching, outreach drafting, and summarising profiles, so recruiters focus on conversations and decisions.',
    ],
    chips: ['Custom pipelines', 'Google + Microsoft', 'Talent pools', 'Branded CVs', 'Built-in sales CRM'],
  },
  {
    id: 'place',
    number: '03',
    label: 'Place',
    headline: 'Where activity becomes outcomes.',
    paragraphs: [
      'Placements are the result of hundreds of small actions.',
      'Ditto connects pipeline activity to placements, revenue, and team performance in the same system.',
      'Leaders gain clear visibility into how work turns into results.',
    ],
    chips: ['Faster placements', 'Advertising ROI', 'Financial reporting', 'Team targets', 'After-care'],
  },
];

export const trust = {
  headline: 'Trusted by leading recruitment teams since 2016.',
  body:
    'Ditto powers recruitment agencies and hiring teams across multiple markets, providing the infrastructure behind modern recruitment operations. From independent agencies to large, listed organisations, teams rely on Ditto to manage sourcing, communication, and placements while keeping their entire recruitment engine running smoothly.',
  stats: [
    { value: 2016, label: 'Backing the industry since', format: 'year' as const },
    { value: 10, suffix: '+', label: 'Years in high-volume recruitment' },
    { value: 1, label: 'Seat minimum. Start with one licence.' },
    { value: 0, label: 'Long-term contracts. Month to month.' },
  ],
  ticker: [
    'Listed groups',
    'Independent agencies',
    'In-house hiring teams',
    'Permanent',
    'Contract',
    'Retained',
    'Contingent',
    'Executive search',
  ],
};

export const ai = {
  title: 'Practical AI that recruiters can trust',
  description:
    'Ditto applies AI where it saves real time. Search, drafting, matching, and summaries. You keep full control at every step.',
  cards: [
    {
      title: 'Agentic + legacy search',
      copy: 'Use intelligent search to understand intent, or run keyword and Boolean search when preferred.',
    },
    {
      title: 'Automatic job ad writing',
      copy: 'Generate clear, structured ads instantly from your role brief, then edit before publishing.',
    },
    {
      title: 'Editable matching prompts',
      copy: 'Ditto proposes matching logic from your spec. Your team can refine prompts with no limits.',
    },
  ],
  flow: [
    'Create role brief and define hiring intent',
    'Let Ditto generate ad, prompt, and candidate scoring',
    'Review, adjust, and approve with complete transparency',
  ],
  note: 'Ditto is not a black box. Matching logic is visible, editable, and never shown to candidates.',
};

export const pricing = {
  title: 'Simple pricing based on team size',
  copy: 'Start with one seat. Scale up or down as needed. Monthly and annual options are available.',
  monthlyLabel: 'Billed monthly',
  annualLabel: 'Billed annually',
  annualNote: 'save 15%',
  perSeat: 'per active user / month',
  tiers: [
    { users: '1 – 4', monthly: 949, annual: 806.65 },
    { users: '5 – 9', monthly: 849, annual: 721.65 },
    { users: '10+', monthly: 749, annual: 636.65 },
  ],
};

export const cta = {
  lineOne: 'Ready to scale your',
  lineTwo: 'recruitment business?',
  copy: 'Book a guided demo and see why high-performing recruiters run on Ditto.',
  button: 'Book a demo',
};

export const footer = {
  tagline: 'Source. Engage. Place. One platform.',
  links: ['Product', 'Pricing', 'About', 'FAQ', 'Contact', 'Terms'],
  legal: `© ${new Date().getFullYear()} Ditto. All rights reserved.`,
};

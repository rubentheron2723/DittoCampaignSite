/**
 * Home copy, from brief v2.2 section 3.3, set into the existing sections (no new sections, labels or buttons).
 */

export const hero = {
  lineOne: 'Recruitment.',
  lineTwo: 'Running at scale.',
  /** The brief's one sub, split across the hero's two lines. "Microsoft Copilot" in full on its first mention. */
  subhead: 'The ATS and CRM recruitment teams use to find candidates, manage clients and make placements.',
  support: ['With AI built in, and now inside Claude, ChatGPT and Microsoft Copilot.'],
  primary: 'Book a demo',
  secondary: 'View pricing',
};

/** Second section (Figma node 2364:777): the headline, and the angled marquee under it. */
export const system = {
  lineOne: 'Everything recruiters do.',
  lineTwo: 'Running inside one system.',
  body: 'Candidates, clients, jobs, email, calendar, pipelines, reporting and revenue in one place. No spreadsheets on the side. No second system to keep in sync.',
  loop: 'Source. Engage. Place.',
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
    headline: 'Find the right candidate in the database you already have.',
    paragraphs: [
      'Most recruitment databases become graveyards of old CVs.',
      'Ditto keeps every profile current and searchable, with an AI summary and a full history of every call, email and submission. Paste a client’s job spec and Scout, Ditto’s agentic AI search, finds the people who fit, even when their CVs use different words.',
    ],
    chips: ['Agentic AI search', '1-click job ads', 'All job boards', 'Smart qualifiers', 'Editable matching'],
  },
  {
    id: 'engage',
    number: '02',
    label: 'Engage',
    headline: 'Keep every candidate moving.',
    paragraphs: [
      'Placements are won or lost between first contact and final decision.',
      'Email, calendar, interviews, notes and pipeline stages live in one workflow the whole team can see. AI scores applicants against the job, drafts outreach and summarises profiles, so recruiters spend their time on conversations.',
    ],
    chips: ['Custom pipelines', 'Google + Microsoft', 'Talent pools', 'Branded CVs', 'Built-in sales CRM'],
  },
  {
    id: 'place',
    number: '03',
    label: 'Place',
    headline: 'See how work turns into revenue.',
    paragraphs: [
      'A placement is the result of hundreds of small actions.',
      'Ditto connects pipeline activity to placements, fees and targets, per recruiter and per team. Owners and managers see what is working without asking for a report.',
    ],
    chips: ['Faster placements', 'Advertising ROI', 'Financial reporting', 'Team targets', 'After-care'],
  },
];

export const ai = {
  title: 'Practical AI that recruiters can trust',
  description: 'Ditto uses AI where it saves time: search, matching, job ads and summaries. You review and decide at every step.',
  cards: [
    {
      title: 'Agentic AI search',
      copy: 'Describe the person you need or paste the job spec. Scout understands what you mean, not only the keywords. Prefer Boolean? It is still there.',
    },
    {
      title: 'Job ads written for you',
      copy: 'Turn a role brief into a clear, structured advert in seconds. Edit it, then publish to your job boards in one click.',
    },
    {
      title: 'Matching you can see and change',
      copy: 'Ditto shows how it will score applicants against each job. Change the criteria whenever the role changes. Candidates never see them.',
    },
  ],
  /** The summary under the cards; the full list is on the Product page's Source / Engage / Place features. */
  all: {
    title: 'Everything Ditto’s AI does',
    items: [
      'Job ad writing',
      'Candidate summaries',
      'Candidate scoring',
      'CV parsing',
      'Enrich candidates with meeting notes',
      'Scout agentic search',
      'Smart rewriting',
    ],
    mcp: {
      title: 'MCP',
      copy: 'Control everything in Ditto from Claude, ChatGPT or Copilot, to read and write. Generate custom reports, see how your team is performing, bulk-schedule activities and more.',
    },
    link: 'See every feature',
  },
};

export const cta = {
  lineOne: 'Ready to run your desk',
  lineTwo: 'on Ditto?',
  copy: 'Book a guided demo and watch a job spec become a shortlist.',
  button: 'Book a demo',
};

export const footer = {
  tagline: 'Source. Engage. Place. One platform.',
  links: ['Product', 'Pricing', 'About', 'FAQ', 'Contact', 'Terms'],
  legal: `© ${new Date().getFullYear()} Ditto. All rights reserved.`,
};

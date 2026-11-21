/**
 * Copy for the prototype, lifted from the production campaign site
 * (src/lib/content.ts and the home landing page) so the words are real.
 */

export const hero = {
  lineOne: 'Recruitment.',
  lineTwo: 'Running at scale.',
  subhead: 'The operating system behind high-performing recruitment teams.',
  support: ['Built to structure sourcing, engagement, and placements for teams operating at scale.', 'One system. One flow.'],
  primary: 'Book a demo',
  secondary: 'View Pricing',
};

/** Second section (Figma node 2364:777): the headline, and the angled marquee under it. */
export const system = {
  lineOne: 'Everything recruiters do.',
  lineTwo: 'Running inside one system.',
  body:
    'Ditto unifies sourcing, communication, collaboration, AI automation, reporting, and revenue tracking into one structured operating system for recruitment.',
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

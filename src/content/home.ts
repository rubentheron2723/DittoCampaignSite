/* Home copy, from brief v2.2 section 3.3. */

export const hero = {
  lineOne: 'Recruitment.',
  lineTwo: 'Running at scale.',
  sub: 'The ATS and CRM recruitment teams use to find candidates, manage clients and make placements. With AI built in, and now inside Claude, ChatGPT and Copilot.',
  primary: 'Book a demo',
  secondary: 'View pricing',
};

export const system = {
  lineOne: 'Everything recruiters do.',
  lineTwo: 'Running inside one system.',
  body: 'Candidates, clients, jobs, email, calendar, pipelines, reporting and revenue in one place. No spreadsheets on the side. No second system to keep in sync.',
};

export type Act = {
  id: 'source' | 'engage' | 'place';
  label: string;
  headline: string;
  lead: string;
  body: string;
  link: { label: string; href: string };
};

export const acts: Act[] = [
  {
    id: 'source',
    label: 'Source',
    headline: 'Find the right candidate in the database you already have.',
    lead: 'Most recruitment databases become graveyards of old CVs.',
    body: 'Ditto keeps every profile current and searchable, with an AI summary and a full history of every call, email and submission. Paste a client’s job spec and Scout, Ditto’s agentic AI search, finds the people who fit, even when their CVs use different words.',
    link: { label: 'See how sourcing works →', href: '/product#source' },
  },
  {
    id: 'engage',
    label: 'Engage',
    headline: 'Keep every candidate moving.',
    lead: 'Placements are won or lost between first contact and final decision.',
    body: 'Email, calendar, interviews, notes and pipeline stages live in one workflow the whole team can see. AI scores applicants against the job, drafts outreach and summarises profiles, so recruiters spend their time on conversations.',
    link: { label: 'See how engagement works →', href: '/product#engage' },
  },
  {
    id: 'place',
    label: 'Place',
    headline: 'See how work turns into revenue.',
    lead: 'A placement is the result of hundreds of small actions.',
    body: 'Ditto connects pipeline activity to placements, fees and targets, per recruiter and per team. Owners and managers see what is working without asking for a report.',
    link: { label: 'See how placements work →', href: '/product#place' },
  },
];

export const assistant = {
  eyebrow: 'New',
  title: 'Ditto, inside the AI assistant you already use.',
  sub: 'Connect Ditto to Claude, ChatGPT or Microsoft Copilot once. Then just ask. Your assistant searches your Ditto database, adds candidates, updates pipelines, creates placements and pulls your numbers. It works on your live data, and the changes are made in Ditto.',
  asks: [
    'Here’s the client’s spec. Who do we already have?',
    'Add this LinkedIn profile and shortlist her for the Financial Manager job.',
    'Move Thabo to second interview and remind me to chase the client on Friday.',
    'Priya accepted. Create the placement.',
  ],
  primary: { label: 'See a day on the desk →', href: '/ai-assistant#day' },
  secondary: 'Book a demo',
  small: 'You stay in control. Ditto never sends email on your behalf and never uses your data to train AI models.',
};

export const ai = {
  eyebrow: 'Also built into Ditto',
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
};

export const proof = {
  title: 'Trusted by recruitment teams since 2016.',
  stats: [
    { big: 'Since 2016', small: '' },
    { big: 'Thousands', small: 'of recruiters' },
    { big: 'Millions', small: 'of job applications every month' },
  ],
  body: 'From independent agencies to large listed groups, across multiple markets.',
  link: { label: 'About us →', href: '/about' },
};

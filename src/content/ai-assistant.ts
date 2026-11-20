/* Ditto for Claude, ChatGPT and Copilot (/ai-assistant). Copy from brief v2.2, section 3.4; the demo from 4.5. */

/** The three points, shared with Home's AI assistant section. */
export const assistantPoints = [
  {
    title: 'It knows your database, not just the internet.',
    body: 'Ask for a shortlist and it searches your own candidates in Ditto, with all the history your team has built up over the years.',
  },
  {
    title: 'It does the admin, not just the thinking.',
    body: 'Open a job, add a candidate, move a stage, log a call, create a placement. Say it once and it is done in Ditto.',
  },
  {
    title: 'It works as you.',
    body: 'Each recruiter signs in with their own Ditto login. The assistant only sees what that recruiter is allowed to see, and every change is recorded under their name.',
  },
];

export const aiHero = {
  eyebrow: 'New · For Claude, ChatGPT and Microsoft Copilot',
  title: ['Run your desk from', 'Claude, ChatGPT or Copilot.'],
  sub: 'Connect Ditto to the AI assistant you already use. Then just ask. It searches your candidate database, adds candidates, updates pipelines, creates placements and pulls your numbers. Everything it does is saved in Ditto.',
  primary: 'Book a demo',
  secondary: 'Watch a day on the desk ↓',
};

export const whatItIs = {
  title: 'Your AI assistant knows the internet. Now it knows your database.',
  body: 'On its own, an AI assistant can tidy a job spec or draft an email. It cannot see your candidates, your clients or your pipeline. Connected to Ditto, it can. It reads your live Ditto data with your permissions, and it can act on it: open jobs, add candidates, move stages, log calls and create placements.',
};

/* ---------- The demo ---------- */

export type Candidate = { name: string; role: string; note: string; match: number; hue: number };

/** One line of the conversation. `screen` names the "In Ditto" state it brings about (see the page's screens). */
export type Turn =
  | { kind: 'me'; text: string; file?: string }
  | { kind: 'steps'; steps: string[] }
  | { kind: 'reply'; text: string }
  | { kind: 'people'; people: Candidate[] }
  | { kind: 'draft'; text: string }
  | { kind: 'placement' }
  | { kind: 'month' };

export type Chapter = {
  id: 'source' | 'engage' | 'place';
  time: string;
  stage: string;
  caption: string;
  turns: (Turn & { screen?: string })[];
};

export const demo = {
  title: 'A day on the desk.',
  sub: 'Three roles at three different stages. Jane handles all of them from one conversation.',
  caption: 'Illustrative. Names, companies and figures are fictional. Works in Claude, ChatGPT and Copilot.',
  greeting: 'Good morning, Jane.',
  placeholder: 'Ask about your candidates, clients and jobs',
  badge: 'Ditto · Connected',
  chips: ['Find candidates', 'Add from LinkedIn', 'Update pipeline', 'Team numbers'],
  panel: 'In Ditto',
  replay: 'Replay',
  book: 'Book a demo',
};

export const people: Candidate[] = [
  { name: 'Amara Okafor', role: 'Financial Manager, retail group', note: 'Last spoke to your team 3 months ago', match: 96, hue: 205 },
  { name: 'Sipho Nkosi', role: 'Finance Lead, FMCG', note: 'Placed by your team in 2022', match: 91, hue: 160 },
  { name: 'Claire Jacobs', role: 'Senior Financial Accountant, retail', note: 'Applied to you in March', match: 88, hue: 265 },
];

export const naledi = { name: 'Naledi Dlamini', role: 'Added from LinkedIn profile', hue: 330 };

export const draft =
  'Thabo has run distribution operations for nine years, the last three leading a team of 40 across two depots. He cut late deliveries by a third in his current role and is available on one calendar month’s notice.';

export const placement = {
  name: 'Priya Naidoo',
  role: 'Senior Product Designer',
  client: 'Lumen Pay',
  status: 'Placed',
  facts: [
    { label: 'Starts', value: '1 February' },
    { label: 'Package', value: 'R960,000 a year' },
    { label: 'Fee', value: '20% of annual package · R192,000 · invoice drafted' },
    { label: 'Check-ins', value: 'Weeks 1, 4 and 12' },
  ],
  commission: 'Commission awaiting approval',
};

export const month = {
  total: '9 approved placements',
  fees: 'R1,314,000',
  rows: [
    { who: 'Jane', placements: 4, fees: 'R612,000', share: 612 / 612 },
    { who: 'Marcus', placements: 3, fees: 'R438,000', share: 438 / 612 },
    { who: 'Lerato', placements: 2, fees: 'R264,000', share: 264 / 612 },
  ],
  pending: 'Priya Naidoo · R192,000 awaiting approval',
};

export const chapters: Chapter[] = [
  {
    id: 'source',
    time: '08:30',
    stage: 'Source',
    caption: 'New brief from Harbour Retail. Start with the people you already know.',
    turns: [
      {
        kind: 'me',
        text: 'New brief from Harbour Retail: Financial Manager, Cape Town, qualified CA, 5+ years in retail. Spec attached. Who do we already have?',
        file: 'Harbour Retail, Financial Manager spec.pdf',
      },
      { kind: 'steps', steps: ['Reading the job spec', 'Searching 48,200 candidates in your database', 'Ranking the best fits'], screen: 'search' },
      { kind: 'reply', text: '14 people in your database fit this brief. The strongest three:' },
      { kind: 'people', people },
      { kind: 'reply', text: 'Want me to open the job and shortlist them?' },
      { kind: 'me', text: 'Yes. Open it under Harbour Retail and shortlist all three.' },
      { kind: 'steps', steps: ['Checking the job doesn’t already exist', 'Creating the job', 'Adding 3 candidates'], screen: 'job' },
      { kind: 'reply', text: 'Done. Financial Manager is open under Harbour Retail with three candidates on the shortlist.' },
      { kind: 'me', text: 'Add this one too.', file: 'Naledi Dlamini, LinkedIn profile.pdf' },
      { kind: 'steps', steps: ['Reading the profile', 'Checking for duplicates'] },
      { kind: 'reply', text: 'Naledi isn’t in your database yet. I need her email address to create her profile. Should I make you the owner?' },
      { kind: 'me', text: 'Yes. naledi.dlamini@example.com' },
      { kind: 'reply', text: 'Created and shortlisted. Her work history came across from the profile.', screen: 'job4' },
    ],
  },
  {
    id: 'engage',
    time: '11:50',
    stage: 'Engage',
    caption: 'Interview feedback comes in on a different role. One message updates everything.',
    turns: [
      {
        kind: 'me',
        text: 'Thabo Mokoena’s first interview at Kestrel Logistics went well. Move him to second interview, log my call with him at 11:30, and remind me to chase Kestrel for feedback on Friday.',
      },
      { kind: 'steps', steps: ['Moving Thabo to Second interview', 'Logging your call', 'Creating a task for Friday'], screen: 'moved' },
      {
        kind: 'reply',
        text: 'All three done. Thabo is at Second interview, your call is on his timeline, and you have a task for Friday: “Chase Kestrel Logistics for feedback”.',
      },
      { kind: 'me', text: 'Write a short summary of Thabo for the client. Use my Client submission persona.' },
      { kind: 'steps', steps: ['Reading Thabo’s profile', 'Applying your Client submission persona'] },
      { kind: 'reply', text: 'Here’s a draft in your Client submission style:' },
      { kind: 'draft', text: draft },
      { kind: 'reply', text: 'Edit it or copy it into your email. I don’t send anything for you.' },
    ],
  },
  {
    id: 'place',
    time: '15:30',
    stage: 'Place',
    caption: 'An offer is accepted on a third role. Close it out, then check the month.',
    turns: [
      {
        kind: 'me',
        text: 'Priya Naidoo has accepted the offer at Lumen Pay. Senior Product Designer, starting 1 February, R960,000 a year. Create the placement.',
      },
      {
        kind: 'steps',
        steps: ['Moving Priya to Placed', 'Applying the fee from Lumen Pay’s terms', 'Drafting the invoice', 'Scheduling after-care check-ins'],
        screen: 'placed',
      },
      { kind: 'reply', text: 'Done. Here’s the placement:' },
      { kind: 'placement' },
      { kind: 'reply', text: 'The commission is waiting for approval in Ditto.' },
      { kind: 'me', text: 'How is the month looking for the team?' },
      { kind: 'steps', steps: ['Running your placements report'], screen: 'month' },
      { kind: 'reply', text: '9 approved placements this month, worth R1,314,000 in fees:' },
      { kind: 'month' },
      { kind: 'reply', text: 'Priya’s placement will add R192,000 once it’s approved.' },
    ],
  },
];

/* ---------- Below the demo ---------- */

export const asks = {
  title: 'What you can ask',
  intro: 'Most of what you do in Ditto, you can now ask for. A few examples.',
  columns: [
    {
      stage: 'Source',
      items: [
        'Who do we have for this spec?',
        'Find qualified CAs in Cape Town with retail experience.',
        'Add this CV and shortlist her for the Financial Manager job.',
        'Open a new job for Kestrel Logistics from this brief.',
      ],
    },
    {
      stage: 'Engage',
      items: [
        'Move Thabo to second interview.',
        'Log my call with Amara and remind me to follow up on Thursday.',
        'What’s on my list today?',
        'Summarise Thabo for the client in my Client submission style.',
      ],
    },
    {
      stage: 'Place',
      items: [
        'Priya accepted. Create the placement.',
        'Which placements are waiting for approval?',
        'How many placements has the team made this month?',
        'Show me fees by recruiter this quarter.',
      ],
    },
  ],
};

export const howItWorks = {
  title: 'Set up once. Then just ask.',
  steps: [
    {
      title: 'Connect.',
      body: 'Add Ditto in your assistant’s settings and sign in with your Ditto login. It works on any plan, including free accounts.',
    },
    {
      title: 'Ask in plain language.',
      body: 'Search, shortlist, add candidates, update pipelines, log activity, create placements and pull reports. No menus, no forms.',
    },
    {
      title: 'Find it all in Ditto.',
      body: 'Everything the assistant does is saved in Ditto on the right candidate, client or job, under your name. Your team sees it straight away.',
    },
  ],
};

export const control = {
  title: 'You stay in charge.',
  points: [
    { title: 'It works as you.', body: 'Each recruiter signs in with their own Ditto login. If you can’t see something in Ditto, the assistant can’t either.' },
    { title: 'It asks before it guesses.', body: 'It checks for duplicates before it creates a record, and it asks you for anything that is missing.' },
    { title: 'Everything is on the record.', body: 'Every change is saved in Ditto under your name and written to the audit log.' },
    {
      title: 'It never speaks for you.',
      body: 'It drafts, you send. Ditto does not email candidates or clients on your behalf, and commissions are still approved in Ditto.',
    },
  ],
  line: 'Ditto never uses your data to train AI models.',
};

export const builtIn = {
  title: 'Prefer to stay in Ditto? The AI is built in there too.',
  body: 'Scout search, candidate matching, summaries and job ad writing all work inside Ditto in the browser. The assistant connection is one more way to work, not a replacement.',
  link: { label: 'See the product →', href: '/product' },
};

export const questions = {
  title: 'Questions',
  items: [
    {
      q: 'Which AI assistants does it work with?',
      a: 'Claude, ChatGPT and Microsoft Copilot. You use your own account with the assistant and connect it to Ditto by signing in with your Ditto login.',
    },
    {
      q: 'Do I need a paid AI plan?',
      a: 'No. Ditto connects to Claude, ChatGPT and Microsoft Copilot on any plan, including free accounts. If your company manages your assistant, an admin may need to switch the connection on first.',
    },
    {
      q: 'Can the assistant see everything in our database?',
      a: 'No. It acts as the recruiter who is signed in, with that recruiter’s permissions. If a recruiter cannot see something in Ditto, the assistant cannot see it either.',
    },
    {
      q: 'Will it email candidates or clients for me?',
      a: 'No. It drafts messages and summaries for you to review and send yourself. Ditto does not send emails or calendar invites on your behalf.',
    },
    {
      q: 'Is our data used to train AI?',
      a: 'Ditto never uses your candidate or client data to train AI models. Your assistant provider has its own rules. On personal plans, chats may be used to improve the provider’s models unless you switch that off in your settings. Business plans do not use them by default. Check this setting before you connect Ditto.',
    },
  ],
  more: { label: 'More questions →', href: '/faq#ai-assistant' },
};

export const aiCta = {
  lineOne: 'See it run',
  lineTwo: 'a real brief.',
  copy: 'Book a demo and watch a job spec become a shortlist without leaving the chat.',
};

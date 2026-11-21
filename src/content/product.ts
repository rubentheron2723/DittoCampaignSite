/* Product copy, from brief v2.2 section 3.5. */

export const productHero = {
  title: ['Recruitment software', 'for teams that scale.'],
  lead: 'One ATS and CRM for sourcing, engagement and placements. Use it in the browser, or from Claude, ChatGPT and Microsoft Copilot.',
  support: 'Built for agencies and in-house hiring teams that need speed, visibility and control.',
  primary: 'Book a demo',
  secondary: { label: 'See it inside Claude and ChatGPT →', href: '/ai-assistant' },
};

/** Card icons: a small line drawing per feature (no numbers on feature cards, brief 4.4 point 6). */
export type Icon =
  | 'search'
  | 'ad'
  | 'broadcast'
  | 'sliders'
  | 'filter'
  | 'summary'
  | 'pipeline'
  | 'record'
  | 'mail'
  | 'bell'
  | 'team'
  | 'pool'
  | 'cv'
  | 'crm'
  | 'rocket'
  | 'eye'
  | 'chart'
  | 'target'
  | 'coins'
  | 'heart';

export type ProductFeature = { title: string; body: string; note?: string; icon: Icon; lead?: boolean };
export type ProductAct = { id: 'source' | 'engage' | 'place'; label: string; features: ProductFeature[] };

export const features = {
  title: 'Everything in one system.',
  lead: 'Pick a stage to see what Ditto does for you there.',
  acts: [
    {
      id: 'source',
      label: 'Source',
      features: [
        {
          title: 'Scout: agentic AI search across your database',
          body: 'Describe who you need, or paste the job spec. Scout reads your whole database and finds people by what they have done, not only the words on their CV. A sales brief also finds business development and partnerships people.',
          note: 'Prefer Boolean? Keyword and Boolean search are still there.',
          icon: 'search',
          // The one blue card, on purpose: Scout is what we most want read (brief 4.4, point 7).
          lead: true,
        },
        { title: 'Job specs become job ads', body: 'Paste the client’s spec and Ditto writes a clear, structured job ad in one click. Edit it, then publish.', icon: 'ad' },
        {
          title: 'One place for all your advertising',
          body: 'Post a job once and Ditto sends it to free and premium job boards, aggregators, social platforms and your own website. Every application comes back into one pipeline.',
          note: 'Premium boards use your own board account.',
          icon: 'broadcast',
        },
        {
          title: 'Matching you can see and change',
          body: 'For every job, Ditto writes out how it will score applicants, based on your spec. Applicants are scored and ranked as they apply. Change the criteria whenever the role changes.',
          note: 'Candidates never see your criteria.',
          icon: 'sliders',
        },
        {
          title: 'Screening questions that filter early',
          body: 'Add must-have questions to any application. Ditto checks the answers and filters out applicants who don’t meet your requirements.',
          icon: 'filter',
        },
        {
          title: 'Candidate summaries, your way',
          body: 'Every candidate gets a short summary written the way you want it, using your Personas. Edit it at any time.',
          icon: 'summary',
        },
      ],
    },
    {
      id: 'engage',
      label: 'Engage',
      features: [
        {
          title: 'Pipelines that match how you recruit',
          body: 'Separate pipelines, stages and statuses for permanent, contract, retained or executive search, per client or per role.',
          icon: 'pipeline',
        },
        {
          title: 'Every interaction on the record',
          body: 'Calls, emails, meetings, interviews, notes, feedback and tasks in one place, linked to the candidate, job and client.',
          icon: 'record',
        },
        {
          title: 'Email and calendar built in',
          body: 'Connect Google Workspace or Microsoft 365. Emails and meetings sync into Ditto and attach to the right records.',
          note: 'You choose which emails are shared with the team and which stay private.',
          icon: 'mail',
        },
        {
          title: 'Follow-ups that don’t get forgotten',
          body: 'Log and schedule follow-ups, CV submissions and business development calls. Tasks and reminders keep busy days under control.',
          icon: 'bell',
        },
        {
          title: 'Work the same role together',
          body: 'Tag colleagues on jobs, candidates and activities, so decisions stay attached to the work and handovers are clean.',
          icon: 'team',
        },
        {
          title: 'Talent pools',
          body: 'Group candidates by skill, role type or potential, so your warm network is one click away when a new role lands.',
          icon: 'pool',
        },
        {
          title: 'Branded CVs in one click',
          body: 'Turn any candidate profile into a Word CV in your agency’s template. As many templates as you need. No retyping, no formatting.',
          icon: 'cv',
        },
        {
          title: 'Sales CRM included',
          body: 'Track leads, client relationships and opportunities from first contact to placement, in the same system as your candidates.',
          icon: 'crm',
        },
      ],
    },
    {
      id: 'place',
      label: 'Place',
      features: [
        { title: 'Faster from offer to start date', body: 'Clear steps from offer to start date, so decisions don’t stall and nothing is forgotten.', icon: 'rocket' },
        { title: 'See where every placement stands', body: 'Offers out, offers accepted, start dates coming up. One view, no chasing.', icon: 'eye' },
        { title: 'Reporting on what drives results', body: 'Activity, conversion rates at every stage and results, per recruiter and per team.', icon: 'chart' },
        {
          title: 'Know which job boards pay off',
          body: 'See which boards and sourcing channels lead to interviews, offers and placements. Spend where it converts.',
          icon: 'target',
        },
        { title: 'Fees, commissions and targets', body: 'Track placement values, commissions, revenue, forecasts and targets in one place.', icon: 'coins' },
        {
          title: 'After-care that protects the placement',
          body: 'Schedule check-ins with the candidate and the client after every placement. Protect the guarantee period and earn the next brief.',
          icon: 'heart',
        },
      ],
    },
  ] as ProductAct[],
};

export const aiBand = {
  title: 'Now inside Claude, ChatGPT and Copilot.',
  body: 'Search your database, add candidates, update pipelines and create placements by asking your AI assistant. It all happens in Ditto.',
  button: { label: 'See a day on the desk →', href: '/ai-assistant#day' },
};

export const trust = {
  headline: 'Trusted by leading recruitment teams since 2016.',
  body: 'Thousands of recruiters run their desks on Ditto, from independent agencies to large listed groups, across multiple markets.',
  stats: [
    { big: 'Since 2016', small: '' },
    { big: 'Thousands', small: 'of recruiters' },
    { big: 'Millions', small: 'of job applications every month' },
  ],
  tickerLabel: 'Built for',
  ticker: [
    'Independent agencies',
    'Listed recruitment groups',
    'In-house hiring teams',
    'Permanent',
    'Contract',
    'Temporary',
    'Retained',
    'Contingent',
    'Executive search',
  ],
};

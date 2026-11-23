/**
 * Product copy, from brief v2.2 section 3.5, set into the existing sections (no new sections or buttons; the
 * "Day in the life" demo stays).
 */
/** The hero (Figma 2398:532). */
export const productHero = {
  title: ['Recruitment software', 'for teams that scale.'],
  /** The brief's sub, one sentence per line. */
  lead: ['One ATS and CRM for sourcing, engagement and placements.', 'Use it in the browser, or from Claude, ChatGPT and Microsoft Copilot.'],
  support: 'Built for agencies and in-house hiring teams that need speed, visibility and control.',
  cta: 'Day in the life',
};

/** "Day in the life" (Figma 2407:6): a recruiter's day, stage by stage, starting with the time and the stage. */
export const dayInTheLife = {
  stages: ['Source', 'Engage', 'Place'],
  /** `group`: how many of the stage's screens come before it (1: after the app window and its chat). */
  moments: [
    { time: '08:30', stage: 'Source' },
    { time: '11:50', stage: 'Engage', group: 1 },
    { time: '15:30', stage: 'Place', group: 2 },
  ] as { time: string; stage: string; group?: number }[],
  /** What the recruiter asks once the window zooms in on the chat, and what comes back. */
  chat: {
    request: 'I need a few good examples of a Senior Product Designer. Use my LinkedIn connections to find one.',
    by: 'Ditto',
    steps: [
      'Connecting to your LinkedIn',
      'Reading 1,284 connections',
      'Matching against the Senior Product Designer brief',
      'Ranking the strongest fits',
    ],
    answer: 'Here are 3 strong fits from your network:',
    followUp: 'Amara’s the closest match. Want me to draft an intro?',
    people: [
      { name: 'Amara Okafor', role: 'Senior Product Designer', company: 'Northwind', link: '2nd · 14 mutual', match: 96, hue: 214 },
      { name: 'Liam Chen', role: 'Lead Product Designer', company: 'Brightline', link: '1st connection', match: 92, hue: 196 },
      { name: 'Sofia Marques', role: 'Product Designer II', company: 'Kestrel Labs', link: '2nd · 9 mutual', match: 88, hue: 250 },
    ],
  },
  /**
   * Engage (after 11:50): just the chat this time, the sourcing conversation above, where the recruiter takes Ditto
   * up on its offer.
   */
  engage: {
    request: 'Yes please. Keep it warm, mention the Senior Product Designer role and find us a time to talk.',
    steps: [
      'Reading Amara’s profile and recent posts',
      'Checking your calendar for next week',
      'Drafting the message in your voice',
      'Holding a slot for a call',
    ],
    answer: 'Here’s your message to Amara:',
    draft: {
      to: 'Amara Okafor',
      body: 'Hi Amara, your recent post on scaling design systems really stood out. I’m hiring a Senior Product Designer for a fast-growing fintech team, and your work at Northwind is exactly the craft they’re after. Would you be open to a 20-minute call next Thursday at 14:00?',
      slot: 'Thu 14:00 · 20 min held',
      copy: 'Copy',
      copied: 'Copied',
    },
    followUp: 'Paste it into LinkedIn when you’re ready. I’ll remind you to follow up if there’s no reply in 3 days.',
  },
  /**
   * Place (after 15:30, Figma 2415:177): the chat again, the Engage conversation above. Amara has said yes, and Ditto
   * logs the placement. The client is the "fast-growing fintech team" from the message.
   */
  place: {
    request: 'Amara accepted Lumen Pay’s offer! Log the placement and get the invoice ready.',
    steps: [
      'Moving Amara to Placed in your pipeline',
      'Pulling the fee terms from the Lumen Pay agreement',
      'Drafting the invoice',
      'Scheduling check-ins for her first 90 days',
    ],
    answer: 'Done. Here’s the placement:',
    client: 'Lumen Pay',
    status: 'Placed',
    facts: [
      { label: 'Starts', value: 'Mon 4 January' },
      { label: 'Fee', value: '20% of first-year salary · invoice drafted' },
      { label: 'Check-ins', value: 'Weeks 1, 4 and 12' },
    ],
    followUp: 'That’s the role filled, from first search to placement. Nice work today, Jane.',
  },
  /** The assistant's chat, as Source opens on it. */
  app: {
    greeting: 'Good morning, Jane',
    prompt: 'How can we help you today?',
    modes: ['Chat', 'Cowork'],
    model: 'Copus 6.7',
    size: 'Large',
    actions: ['Write', 'Learn', 'Code', 'Career chat'],
  },
};

/** "Trusted by leading recruitment teams since 2016." (moved from the home page): headline, copy and ticker. */
export const trust = {
  headline: 'Trusted by leading recruitment teams since 2016.',
  body: 'Thousands of recruiters run their desks on Ditto, from independent agencies to large listed groups, across multiple markets.',
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

export type ProductFeature = { id: string; title: string; body: string; chips: string[] };
export type ProductAct = {
  id: string;
  label: string;
  headline: string;
  intro: string;
  ctaTitle: string;
  ctaBody: string;
  features: ProductFeature[];
};

/** "Everything in one system": the features of each stage, lifted from the production product page (ditto.work/product). */
export const features = {
  title: 'Everything in one system.',
  lead: 'Pick a stage to see what Ditto does for you there.',
  acts: [
  {
    "id": "source",
    "label": "Source",
    "headline": "Find the right candidates, faster",
    "intro": "Ditto gives recruiters the tools to search deeper, reach wider, and discover better candidates from day one. Every part of the sourcing process is designed to reduce noise early and help recruiters focus their time on candidates who are genuinely worth engaging.",
    "ctaTitle": "See agentic search in action",
    "ctaBody": "Book a guided walkthrough and see how Ditto reduces screening noise from day one.",
    "features": [
      {
        "id": "search",
        "title": "Scout: agentic AI search across your database",
        "body": "Describe who you need, or paste the job spec. Scout reads your whole database and finds people by what they have done, not only the words on their CV. A sales brief also finds business development and partnerships people.",
        "chips": [
          "Agentic AI",
          "Boolean ready",
          "Intent matching"
        ]
      },
      {
        "id": "job-ads",
        "title": "Job specs become job ads",
        "body": "Paste the client’s spec and Ditto writes a clear, structured job ad in one click. Edit it, then publish.",
        "chips": [
          "1-click draft",
          "Consistent quality",
          "Editable"
        ]
      },
      {
        "id": "distribution",
        "title": "One place for all your advertising",
        "body": "Post a job once and Ditto sends it to free and premium job boards, aggregators, social platforms and your own website. Every application comes back into one pipeline.",
        "chips": [
          "Multi-channel",
          "Single inbox",
          "Central pipeline"
        ]
      },
      {
        "id": "matching-prompt",
        "title": "Matching you can see and change",
        "body": "For every job, Ditto writes out how it will score applicants, based on your spec. Applicants are scored and ranked as they apply. Change the criteria whenever the role changes.",
        "chips": [
          "Prompt scoring",
          "Editable logic",
          "Transparent"
        ]
      },
      {
        "id": "qualifiers",
        "title": "Screening questions that filter early",
        "body": "Add must-have questions to any application. Ditto checks the answers and filters out applicants who don’t meet your requirements.",
        "chips": [
          "Role filters",
          "Early gate",
          "Less noise"
        ]
      },
      {
        "id": "summaries",
        "title": "Candidate summaries, your way",
        "body": "Every candidate gets a short summary written the way you want it, using your Personas. Edit it at any time.",
        "chips": [
          "Executive summary",
          "Persona-aware",
          "Editable"
        ]
      }
    ]
  },
  {
    "id": "engage",
    "label": "Engage",
    "headline": "Keep candidates moving, without losing control",
    "intro": "Once candidates enter your pipeline, execution becomes everything. Ditto gives recruiters complete visibility across every interaction, stage, and follow-up, ensuring nothing slips through the cracks and momentum is never lost.",
    "ctaTitle": "Run your pipeline with control",
    "ctaBody": "See how teams coordinate hiring activity, ownership, and follow‑up in one system.",
    "features": [
      {
        "id": "pipelines",
        "title": "Pipelines that match how you recruit",
        "body": "Separate pipelines, stages and statuses for permanent, contract, retained or executive search, per client or per role.",
        "chips": [
          "Custom stages",
          "Role-specific",
          "Client-specific"
        ]
      },
      {
        "id": "activity-tracking",
        "title": "Every interaction on the record",
        "body": "Calls, emails, meetings, interviews, notes, feedback and tasks in one place, linked to the candidate, job and client.",
        "chips": [
          "Full history",
          "Linked records",
          "Manager visibility"
        ]
      },
      {
        "id": "calendar-email",
        "title": "Email and calendar built in",
        "body": "Connect Google Workspace or Microsoft 365. Emails and meetings sync into Ditto and attach to the right records.",
        "chips": [
          "Google Workspace",
          "Microsoft 365",
          "Auto sync"
        ]
      },
      {
        "id": "follow-ups",
        "title": "Follow-ups that don’t get forgotten",
        "body": "Log and schedule follow-ups, CV submissions and business development calls. Tasks and reminders keep busy days under control.",
        "chips": [
          "Task reminders",
          "CV tracking",
          "Daily control"
        ]
      },
      {
        "id": "collaboration",
        "title": "Work the same role together",
        "body": "Tag colleagues on jobs, candidates and activities, so decisions stay attached to the work and handovers are clean.",
        "chips": [
          "Team tags",
          "Shared context",
          "Aligned execution"
        ]
      },
      {
        "id": "talent-pools",
        "title": "Talent pools",
        "body": "Group candidates by skill, role type or potential, so your warm network is one click away when a new role lands.",
        "chips": [
          "Skills clusters",
          "Warm network",
          "Fast activation"
        ]
      },
      {
        "id": "branded-submissions",
        "title": "Branded CVs in one click",
        "body": "Turn any candidate profile into a Word CV in your agency’s template. As many templates as you need. No retyping, no formatting.",
        "chips": [
          "Branded templates",
          "One-click output",
          "Consistent quality"
        ]
      },
      {
        "id": "sales-crm",
        "title": "Sales CRM included",
        "body": "Track leads, client relationships and opportunities from first contact to placement, in the same system as your candidates.",
        "chips": [
          "Lead tracking",
          "Opportunity flow",
          "Revenue context"
        ]
      }
    ]
  },
  {
    "id": "place",
    "label": "Place",
    "headline": "Turn activity into outcomes",
    "intro": "This is where everything comes together. Ditto helps agencies convert sourcing and engagement into placements that close faster, perform better, and strengthen the business over time.",
    "ctaTitle": "Turn effort into predictable billing",
    "ctaBody": "See where revenue is created and what actions drive placement outcomes.",
    "features": [
      {
        "id": "placements-faster",
        "title": "Faster from offer to start date",
        "body": "Clear steps from offer to start date, so decisions don’t stall and nothing is forgotten.",
        "chips": [
          "Structured closing",
          "Fewer delays",
          "Faster billing"
        ]
      },
      {
        "id": "placement-visibility",
        "title": "See where every placement stands",
        "body": "Offers out, offers accepted, start dates coming up. One view, no chasing.",
        "chips": [
          "Status clarity",
          "Bottleneck control",
          "Active tracking"
        ]
      },
      {
        "id": "performance-reporting",
        "title": "Reporting on what drives results",
        "body": "Activity, conversion rates at every stage and results, per recruiter and per team.",
        "chips": [
          "Conversion rates",
          "Team performance",
          "Outcome analytics"
        ]
      },
      {
        "id": "roi",
        "title": "Know which job boards pay off",
        "body": "See which boards and sourcing channels lead to interviews, offers and placements. Spend where it converts.",
        "chips": [
          "Channel ROI",
          "Source impact",
          "Spend clarity"
        ]
      },
      {
        "id": "financials",
        "title": "Fees, commissions and targets",
        "body": "Track placement values, commissions, revenue, forecasts and targets in one place.",
        "chips": [
          "Forecast vs actual",
          "Commissions",
          "Targets"
        ]
      },
      {
        "id": "after-care",
        "title": "After-care that protects the placement",
        "body": "Schedule check-ins with the candidate and the client after every placement. Protect the guarantee period and earn the next brief.",
        "chips": [
          "Retention focus",
          "Follow-up loops",
          "Repeat business"
        ]
      }
    ]
  }
] as ProductAct[],
};

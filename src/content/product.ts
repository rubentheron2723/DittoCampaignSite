/**
 * Product copy.
 */
/** The hero (Figma 2398:532). */
export const productHero = {
  title: ['Recruitment software', 'for teams that scale.'],
  lead: 'One platform for sourcing, engagement, and placements across your full hiring workflow.',
  support: 'A complete system for agencies and hiring teams that need speed, visibility, and control.',
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

export const finalFeaturesCta = {
  title: 'Ready to scale your recruitment business?',
  body: 'Book a guided demo and see why high-performing recruiters run on Ditto.',
};

/** "Trusted by leading recruitment teams since 2016." (moved from the home page): headline, copy and ticker. */
export const trust = {
  headline: 'Trusted by leading recruitment teams since 2016.',
  body:
    'Ditto powers recruitment agencies and hiring teams across multiple markets, providing the infrastructure behind modern recruitment operations. From independent agencies to large, listed organisations, teams rely on Ditto to manage sourcing, communication, and placements while keeping their entire recruitment engine running smoothly.',
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

export type ProductFeature = { id: string; title: string; body: string; supportNote?: string; chips: string[] };
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
  lead: 'One platform for sourcing, engagement, and placements across your full hiring workflow.',
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
        "title": "Agentic AI search across your database",
        "body": "Ditto uses agentic AI search to scan your entire database and understand intent, not just keywords. It surfaces candidates based on skills, experience, and role requirements, even when the brief is evolving.",
        "supportNote": "Prefer legacy search? Keyword and Boolean search are also available.",
        "chips": [
          "Agentic AI",
          "Boolean ready",
          "Intent matching"
        ]
      },
      {
        "id": "job-ads",
        "title": "Turn job specs into ready-to-publish job ads",
        "body": "Drop in the job requirements and let Ditto handle the rest. Ditto converts job specs into clear, professional job ads in a single click, helping recruiters go from brief to live role without rewriting or reformatting.",
        "chips": [
          "1-click draft",
          "Consistent quality",
          "Editable"
        ]
      },
      {
        "id": "distribution",
        "title": "One central place for all job advertising",
        "body": "With a single click, Ditto distributes roles across major free and premium job boards, aggregators, social platforms, and your own website. Every application flows back into one central pipeline.",
        "supportNote": "Some premium job boards may require an account.",
        "chips": [
          "Multi-channel",
          "Single inbox",
          "Central pipeline"
        ]
      },
      {
        "id": "matching-prompt",
        "title": "Candidate matching logic you control",
        "body": "When you create a job, Ditto generates a structured matching prompt based on your job spec. This prompt scores and ranks candidates as they apply. You can review, edit, and refine the prompt at any time.",
        "supportNote": "Fully transparent. Never visible to candidates.",
        "chips": [
          "Prompt scoring",
          "Editable logic",
          "Transparent"
        ]
      },
      {
        "id": "qualifiers",
        "title": "Smart qualifiers to filter early",
        "body": "Add role-specific screening questions to the application process. Ditto evaluates responses and filters out candidates who do not meet required criteria.",
        "chips": [
          "Role filters",
          "Early gate",
          "Less noise"
        ]
      },
      {
        "id": "summaries",
        "title": "Smart candidate summaries, at a glance",
        "body": "Ditto generates concise executive summaries for every candidate, based on your persona. You can edit summaries at any time.",
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
        "title": "Custom hiring pipelines",
        "body": "Design pipelines that reflect how your agency works. Create role-specific and client-specific workflows with custom stages and statuses.",
        "chips": [
          "Custom stages",
          "Role-specific",
          "Client-specific"
        ]
      },
      {
        "id": "activity-tracking",
        "title": "Track everything that matters",
        "body": "Calls, emails, meetings, interviews, notes, feedback, and tasks. Ditto captures it all in one place, linked to the candidate, role, and client.",
        "chips": [
          "Full history",
          "Linked records",
          "Manager visibility"
        ]
      },
      {
        "id": "calendar-email",
        "title": "Integrated email and calendar",
        "body": "Connect Google Workspace or Microsoft 365 email and calendar. Emails and meetings sync into Ditto and link to the correct records.",
        "supportNote": "Shared visibility is configurable. You control privacy and access.",
        "chips": [
          "Google Workspace",
          "Microsoft 365",
          "Auto sync"
        ]
      },
      {
        "id": "follow-ups",
        "title": "Follow-ups that do not get forgotten",
        "body": "Log, schedule, and track follow-ups, CV submissions, and business development activity. Tasks and reminders keep busy days under control.",
        "chips": [
          "Task reminders",
          "CV tracking",
          "Daily control"
        ]
      },
      {
        "id": "collaboration",
        "title": "Real team collaboration",
        "body": "Tag colleagues on jobs, candidates, and activities. Keep decisions tied to the work with shared visibility across the team.",
        "chips": [
          "Team tags",
          "Shared context",
          "Aligned execution"
        ]
      },
      {
        "id": "talent-pools",
        "title": "Talent pools that actually get used",
        "body": "Group candidates into talent pools by skills, role type, and potential. Activate warm networks fast when new roles arrive.",
        "chips": [
          "Skills clusters",
          "Warm network",
          "Fast activation"
        ]
      },
      {
        "id": "branded-submissions",
        "title": "Branded candidate submissions",
        "body": "Convert candidate profiles into polished client-ready submissions using your branded templates. No manual formatting.",
        "chips": [
          "Branded templates",
          "One-click output",
          "Consistent quality"
        ]
      },
      {
        "id": "sales-crm",
        "title": "Built-in sales CRM",
        "body": "Track leads, manage client relationships, and monitor opportunities from first contact through to placement, all in one system.",
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
        "title": "Make placements faster",
        "body": "Reduce delays and stalled decisions with structured workflows and full visibility between offer and start date.",
        "chips": [
          "Structured closing",
          "Fewer delays",
          "Faster billing"
        ]
      },
      {
        "id": "placement-visibility",
        "title": "Full visibility from pipeline to placement",
        "body": "See exactly where placements stand at any moment. Remove bottlenecks and keep opportunities moving.",
        "chips": [
          "Status clarity",
          "Bottleneck control",
          "Active tracking"
        ]
      },
      {
        "id": "performance-reporting",
        "title": "Performance reporting that actually matters",
        "body": "Report on recruiter activity, team performance, and conversion rates across every stage. Understand what drives outcomes.",
        "chips": [
          "Conversion rates",
          "Team performance",
          "Outcome analytics"
        ]
      },
      {
        "id": "roi",
        "title": "Advertising and sourcing ROI",
        "body": "Track which job boards and sourcing channels lead to interviews, offers, and placements. Focus spend on what converts.",
        "chips": [
          "Channel ROI",
          "Source impact",
          "Spend clarity"
        ]
      },
      {
        "id": "financials",
        "title": "Financial reporting and team targets",
        "body": "Track placement values, commissions, revenue, forecasts, and targets in one place.",
        "chips": [
          "Forecast vs actual",
          "Commissions",
          "Targets"
        ]
      },
      {
        "id": "after-care",
        "title": "After-care and long-term relationships",
        "body": "Maintain structured after-care follow-ups with clients and candidates to improve retention and repeat business.",
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

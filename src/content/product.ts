/**
 * Product copy, lifted from the production features content.
 */
export type ActId = 'source' | 'engage' | 'place';

export type ActFeature = {
  id: string;
  title: string;
  navLabel?: string;
  teaser: string;
  body: string;
  supportNote?: string;
  chips: string[];
};

export type ActContent = {
  id: ActId;
  actNumber: string;
  label: string;
  headline: string;
  intro: string;
  ctaTitle: string;
  ctaBody: string;
  features: ActFeature[];
};

export const featuresHeroContent = {
  eyebrow: 'PRODUCT',
  headlineLineOne: 'Recruitment software',
  headlineLineOneTwo: 'for teams that scale',
  headlineLineTwo: 'One platform for sourcing, engagement, and placements across your full hiring workflow.',
  subhead:
    'A complete system for agencies and hiring teams that need speed, visibility, and control.',
};

export const featureActs: ActContent[] = [
  {
    id: 'source',
    actNumber: 'Act 1',
    label: 'SOURCE',
    headline: 'Find the right candidates, faster',
    intro:
      'Ditto gives recruiters the tools to search deeper, reach wider, and discover better candidates from day one. Every part of the sourcing process is designed to reduce noise early and help recruiters focus their time on candidates who are genuinely worth engaging.',
    ctaTitle: 'See agentic search in action',
    ctaBody: 'Book a guided walkthrough and see how Ditto reduces screening noise from day one.',
    features: [
      {
        id: 'search',
        title: 'Agentic AI search across your database',
        navLabel: 'Agentic AI search',
        teaser: 'Intent-aware retrieval with legacy search still available.',
        body: 'Ditto uses agentic AI search to scan your entire database and understand intent, not just keywords. It surfaces candidates based on skills, experience, and role requirements, even when the brief is evolving.',
        supportNote: 'Prefer legacy search? Keyword and Boolean search are also available.',
        chips: ['Agentic AI', 'Boolean ready', 'Intent matching'],
      },
      {
        id: 'job-ads',
        title: 'Turn job specs into ready-to-publish job ads',
        navLabel: 'Job ad generation',
        teaser: 'Move from brief to live role in one click.',
        body: 'Drop in the job requirements and let Ditto handle the rest. Ditto converts job specs into clear, professional job ads in a single click, helping recruiters go from brief to live role without rewriting or reformatting.',
        chips: ['1-click draft', 'Consistent quality', 'Editable'],
      },
      {
        id: 'distribution',
        title: 'One central place for all job advertising',
        navLabel: 'Distribution',
        teaser: 'Broadcast roles while keeping one central pipeline.',
        body: 'With a single click, Ditto distributes roles across major free and premium job boards, aggregators, social platforms, and your own website. Every application flows back into one central pipeline.',
        supportNote: 'Some premium job boards may require an account.',
        chips: ['Multi-channel', 'Single inbox', 'Central pipeline'],
      },
      {
        id: 'matching-prompt',
        title: 'Candidate matching logic you control',
        navLabel: 'Matching logic',
        teaser: 'Prompt-driven ranking that your team can refine.',
        body: 'When you create a job, Ditto generates a structured matching prompt based on your job spec. This prompt scores and ranks candidates as they apply. You can review, edit, and refine the prompt at any time.',
        supportNote: 'Fully transparent. Never visible to candidates.',
        chips: ['Prompt scoring', 'Editable logic', 'Transparent'],
      },
      {
        id: 'qualifiers',
        title: 'Smart qualifiers to filter early',
        navLabel: 'Qualifiers',
        teaser: 'Stop unsuitable applications before manual screening.',
        body: 'Add role-specific screening questions to the application process. Ditto evaluates responses and filters out candidates who do not meet required criteria.',
        chips: ['Role filters', 'Early gate', 'Less noise'],
      },
      {
        id: 'summaries',
        title: 'Smart candidate summaries, at a glance',
        navLabel: 'Smart summaries',
        teaser: 'Condense profiles into clear, decision-ready briefs.',
        body: 'Ditto generates concise executive summaries for every candidate, based on your persona. You can edit summaries at any time.',
        chips: ['Executive summary', 'Persona-aware', 'Editable'],
      },
    ],
  },
  {
    id: 'engage',
    actNumber: 'Act 2',
    label: 'ENGAGE',
    headline: 'Keep candidates moving, without losing control',
    intro:
      'Once candidates enter your pipeline, execution becomes everything. Ditto gives recruiters complete visibility across every interaction, stage, and follow-up, ensuring nothing slips through the cracks and momentum is never lost.',
    ctaTitle: 'Run your pipeline with control',
    ctaBody: 'See how teams coordinate hiring activity, ownership, and follow‑up in one system.',
    features: [
      {
        id: 'pipelines',
        title: 'Custom hiring pipelines',
        navLabel: 'Custom pipelines',
        teaser: 'Model your real workflow, not a generic process.',
        body: 'Design pipelines that reflect how your agency works. Create role-specific and client-specific workflows with custom stages and statuses.',
        chips: ['Custom stages', 'Role-specific', 'Client-specific'],
      },
      {
        id: 'activity-tracking',
        title: 'Track everything that matters',
        navLabel: 'Track everything',
        teaser: 'Capture every call, note, interview, and task in context.',
        body: 'Calls, emails, meetings, interviews, notes, feedback, and tasks. Ditto captures it all in one place, linked to the candidate, role, and client.',
        chips: ['Full history', 'Linked records', 'Manager visibility'],
      },
      {
        id: 'calendar-email',
        title: 'Integrated email and calendar',
        navLabel: 'Email + calendar',
        teaser: 'Sync comms and meetings directly into each record.',
        body: 'Connect Google Workspace or Microsoft 365 email and calendar. Emails and meetings sync into Ditto and link to the correct records.',
        supportNote: 'Shared visibility is configurable. You control privacy and access.',
        chips: ['Google Workspace', 'Microsoft 365', 'Auto sync'],
      },
      {
        id: 'follow-ups',
        title: 'Follow-ups that do not get forgotten',
        navLabel: 'Follow-ups',
        teaser: 'Keep momentum with reminders and structured actions.',
        body: 'Log, schedule, and track follow-ups, CV submissions, and business development activity. Tasks and reminders keep busy days under control.',
        chips: ['Task reminders', 'CV tracking', 'Daily control'],
      },
      {
        id: 'collaboration',
        title: 'Real team collaboration',
        navLabel: 'Collaboration',
        teaser: 'Tag teammates where decisions happen.',
        body: 'Tag colleagues on jobs, candidates, and activities. Keep decisions tied to the work with shared visibility across the team.',
        chips: ['Team tags', 'Shared context', 'Aligned execution'],
      },
      {
        id: 'talent-pools',
        title: 'Talent pools that actually get used',
        navLabel: 'Talent pools',
        teaser: 'Activate warm candidate networks faster.',
        body: 'Group candidates into talent pools by skills, role type, and potential. Activate warm networks fast when new roles arrive.',
        chips: ['Skills clusters', 'Warm network', 'Fast activation'],
      },
      {
        id: 'branded-submissions',
        title: 'Branded candidate submissions',
        navLabel: 'Branded submissions',
        teaser: 'Deliver polished client-ready submissions instantly.',
        body: 'Convert candidate profiles into polished client-ready submissions using your branded templates. No manual formatting.',
        chips: ['Branded templates', 'One-click output', 'Consistent quality'],
      },
      {
        id: 'sales-crm',
        title: 'Built-in sales CRM',
        navLabel: 'Sales CRM',
        teaser: 'Run business development in the same operating system.',
        body: 'Track leads, manage client relationships, and monitor opportunities from first contact through to placement, all in one system.',
        chips: ['Lead tracking', 'Opportunity flow', 'Revenue context'],
      },
    ],
  },
  {
    id: 'place',
    actNumber: 'Act 3',
    label: 'PLACE',
    headline: 'Turn activity into outcomes',
    intro:
      'This is where everything comes together. Ditto helps agencies convert sourcing and engagement into placements that close faster, perform better, and strengthen the business over time.',
    ctaTitle: 'Turn effort into predictable billing',
    ctaBody: 'See where revenue is created and what actions drive placement outcomes.',
    features: [
      {
        id: 'placements-faster',
        title: 'Make placements faster',
        navLabel: 'Placements',
        teaser: 'Reduce delays between offer and start date.',
        body: 'Reduce delays and stalled decisions with structured workflows and full visibility between offer and start date.',
        chips: ['Structured closing', 'Fewer delays', 'Faster billing'],
      },
      {
        id: 'placement-visibility',
        title: 'Full visibility from pipeline to placement',
        navLabel: 'Visibility',
        teaser: 'Know the exact status of every active opportunity.',
        body: 'See exactly where placements stand at any moment. Remove bottlenecks and keep opportunities moving.',
        chips: ['Status clarity', 'Bottleneck control', 'Active tracking'],
      },
      {
        id: 'performance-reporting',
        title: 'Performance reporting that actually matters',
        navLabel: 'Reporting',
        teaser: 'Connect recruiter behaviour to outcomes.',
        body: 'Report on recruiter activity, team performance, and conversion rates across every stage. Understand what drives outcomes.',
        chips: ['Conversion rates', 'Team performance', 'Outcome analytics'],
      },
      {
        id: 'roi',
        title: 'Advertising and sourcing ROI',
        navLabel: 'ROI',
        teaser: 'Invest in channels that create placements.',
        body: 'Track which job boards and sourcing channels lead to interviews, offers, and placements. Focus spend on what converts.',
        chips: ['Channel ROI', 'Source impact', 'Spend clarity'],
      },
      {
        id: 'financials',
        title: 'Financial reporting and team targets',
        navLabel: 'Financials',
        teaser: 'Track forecasts, commissions, revenue, and targets.',
        body: 'Track placement values, commissions, revenue, forecasts, and targets in one place.',
        chips: ['Forecast vs actual', 'Commissions', 'Targets'],
      },
      {
        id: 'after-care',
        title: 'After-care and long-term relationships',
        navLabel: 'After-care',
        teaser: 'Keep post-placement relationships active and measurable.',
        body: 'Maintain structured after-care follow-ups with clients and candidates to improve retention and repeat business.',
        chips: ['Retention focus', 'Follow-up loops', 'Repeat business'],
      },
    ],
  },
];

export const finalFeaturesCta = {
  title: 'Ready to scale your recruitment business?',
  body: 'Book a guided demo and see why high-performing recruiters run on Ditto.',
};

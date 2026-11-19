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

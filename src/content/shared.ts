export type PageId = 'home' | 'product' | 'pricing' | 'about' | 'faq' | 'contact' | 'signin' | 'privacy' | 'terms';

export const nav: { id: PageId; label: string; href: string }[] = [
  { id: 'product', label: 'Product', href: '/product' },
  { id: 'pricing', label: 'Pricing', href: '/pricing' },
  { id: 'about', label: 'About', href: '/about' },
  { id: 'faq', label: 'FAQ', href: '/faq' },
  { id: 'contact', label: 'Contact', href: '/contact' },
];

export const appUrl = 'https://app.ditto.work';
/** Our own sign-in page (sign-in.html), which hands the details on to the app. */
export const signInUrl = '/sign-in';

/** Footer columns, as laid out in the Figma footer (node 2396:311): Company and Info on the first row, Community and
 * Account on the second; Legal (Privacy, Terms) beside Company and Info. */
export const footer = {
  columns: [
    { title: 'Company', links: [{ label: 'About', href: '/about' }, { label: 'Product', href: '/product' }] },
    { title: 'Info', links: [{ label: 'Pricing', href: '/pricing' }, { label: 'FAQ', href: '/faq' }, { label: 'Contact', href: '/contact' }] },
    { title: 'Follow', links: [{ label: 'Facebook', href: 'https://www.facebook.com/DittoHire/' }, { label: 'LinkedIn', href: 'https://www.linkedin.com/company/dittohire/' }] },
    { title: 'Account', links: [{ label: 'Sign in', href: signInUrl }, { label: 'Book a demo', href: '/contact' }] },
    { title: 'Legal', links: [{ label: 'Privacy', href: '/privacy' }, { label: 'Terms', href: '/terms' }] },
  ],
};

/** The closing band on every page except the AI assistant page (which has its own). */
export const finalCta = {
  lineOne: 'Ready to run your desk',
  lineTwo: 'on Ditto?',
  copy: 'Book a guided demo and watch a job spec become a shortlist.',
  button: 'Book a demo',
};

/** The footer's closing lines: the job seekers' pointer, the copyright (year set automatically) and the trademarks. */
export const footerLegal = {
  jobs: { lead: 'Looking for a job?', label: 'Visit ditto.jobs', href: 'https://ditto.jobs' },
  copyright: `© ${new Date().getFullYear()} Ditto Jobs (Pty) Ltd`,
  trademarks:
    'Claude is a trademark of Anthropic. ChatGPT is a trademark of OpenAI. Microsoft Copilot is a trademark of the Microsoft group of companies. Ditto is an independent product and is not affiliated with or endorsed by these companies.',
};

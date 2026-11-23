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

/** Footer columns, as laid out in the Figma footer (node 2396:311): Company and Info on the first row, Follow (brief
 * v2.2, 3.1) and Account on the second; Legal (Privacy, Terms) below them. */
export const footer = {
  columns: [
    { title: 'Company', links: [{ label: 'About', href: '/about' }, { label: 'Product', href: '/product' }] },
    { title: 'Info', links: [{ label: 'Pricing', href: '/pricing' }, { label: 'FAQ', href: '/faq' }, { label: 'Contact', href: '/contact' }] },
    { title: 'Follow', links: [{ label: 'Facebook', href: 'https://www.facebook.com/DittoHire/' }, { label: 'LinkedIn', href: 'https://www.linkedin.com/company/dittohire/' }] },
    { title: 'Account', links: [{ label: 'Sign in', href: signInUrl }, { label: 'Book a demo', href: '/contact' }] },
    { title: 'Legal', links: [{ label: 'Privacy', href: '/privacy' }, { label: 'Terms', href: '/terms' }] },
  ],
};

export const finalCta = {
  lineOne: 'Ready to run your desk',
  lineTwo: 'on Ditto?',
  copy: 'Book a guided demo and watch a job spec become a shortlist.',
  button: 'Book a demo',
};

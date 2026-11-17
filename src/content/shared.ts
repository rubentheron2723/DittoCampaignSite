export type PageId = 'home' | 'product' | 'pricing' | 'about' | 'faq' | 'contact' | 'signin';

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
 * Account on the second. */
export const footer = {
  columns: [
    { title: 'Company', links: [{ label: 'About', href: '/about' }, { label: 'Product', href: '/product' }] },
    { title: 'Info', links: [{ label: 'Pricing', href: '/pricing' }, { label: 'FAQ', href: '/faq' }, { label: 'Contact', href: '/contact' }] },
    { title: 'Community', links: [{ label: 'Facebook', href: 'https://www.facebook.com/DittoHire/' }, { label: 'LinkedIn', href: 'https://www.linkedin.com/company/dittohire/' }] },
    { title: 'Account', links: [{ label: 'Sign in', href: signInUrl }, { label: 'Book a demo', href: '/contact' }] },
  ],
};

export const finalCta = {
  lineOne: 'Ready to scale your',
  lineTwo: 'recruitment business?',
  copy: 'Book a guided demo and see why high-performing recruiters run on Ditto.',
  button: 'Book a demo',
};

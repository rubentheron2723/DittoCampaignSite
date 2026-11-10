export type PageId = 'home' | 'product' | 'pricing' | 'about' | 'faq' | 'contact';

export const nav: { id: PageId; label: string; href: string }[] = [
  { id: 'product', label: 'Product', href: '/product' },
  { id: 'pricing', label: 'Pricing', href: '/pricing' },
  { id: 'about', label: 'About', href: '/about' },
  { id: 'faq', label: 'FAQ', href: '/faq' },
  { id: 'contact', label: 'Contact', href: '/contact' },
];

export const appUrl = 'https://app.ditto.work';

export const footer = {
  tagline: 'Source. Engage. Place. One platform.',
  columns: [
    { title: 'Product', links: [{ label: 'Product', href: '/product' }, { label: 'Pricing', href: '/pricing' }, { label: 'FAQ', href: '/faq' }] },
    { title: 'Company', links: [{ label: 'About', href: '/about' }, { label: 'Contact', href: '/contact' }] },
    { title: 'Account', links: [{ label: 'Sign in', href: appUrl }, { label: 'Book a demo', href: '/contact' }] },
  ],
  legal: `© ${new Date().getFullYear()} Ditto. All rights reserved.`,
};

export const finalCta = {
  lineOne: 'Ready to scale your',
  lineTwo: 'recruitment business?',
  copy: 'Book a guided demo and see why high-performing recruiters run on Ditto.',
  button: 'Book a demo',
};

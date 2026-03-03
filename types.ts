
export enum AmberType {
  DAMLA = 'Damla (Baltık)',
  SIKMA = 'Sıkma Kehribar',
  ATES = 'Ateş Kehribar',
  OSMANLI = 'Osmanlı Tarzı',
}

export interface Product {
  id: string;
  name: string;
  type: AmberType;
  price: number;
  originalPrice?: number;
  image: string;
  specs: string;
  color: string;
  size: string;
  description: string;
  longDescription: string;
  isNew?: boolean;
  isSpecial?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Slide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  tag: string;
}

export interface SiteSettings {
  email: string;
  phone: string;
  address: string;
  instagram: string;
  aboutHeroImage: string;
  aboutContentImage: string;
  aboutTitle: string;
  aboutText1: string;
  aboutText2: string;
  aboutYears: string;
  aboutCustomers: string;
  craftsmanImage: string;
  craftsmanTitle: string;
  craftsmanText1: string;
  craftsmanText2: string;
  craftsmanFeature1Title: string; craftsmanFeature1Desc: string;
  craftsmanFeature2Title: string; craftsmanFeature2Desc: string;
  craftsmanFeature3Title: string; craftsmanFeature3Desc: string;
  craftsmanFeature4Title: string; craftsmanFeature4Desc: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
}


import { Product, Slide, SiteSettings, BlogPost } from './types';

export const DEFAULT_SLIDES: Slide[] = [
  {
    id: '1',
    image: "https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80&w=1920",
    title: "Asaletin Kalbinde Amber",
    subtitle: "Doğanın milyonlarca yıllık hikayesini, en asil haliyle avuçlarınızda hissedin.",
    tag: "Nadir Parçalar • Asil Duruş"
  },
  {
    id: '2',
    image: "https://images.unsplash.com/photo-1596942515093-662588147814?auto=format&fit=crop&q=80&w=1920",
    title: "Kadim Baltık Mirası",
    subtitle: "Kuzeyin soğuk sularından gelen sıcak parıltı. Gerçek Baltık damla kehribar koleksiyonu.",
    tag: "Baltık Koleksiyonu • Saf Enerji"
  },
  {
    id: '3',
    image: "https://images.unsplash.com/photo-1588600129881-c7207aa22aa3?auto=format&fit=crop&q=80&w=1920",
    title: "Zanaatkarın İmzası",
    subtitle: "Her bir habbede usta ellerin titiz dokunuşu. Geleneksel sanatın modern yorumu.",
    tag: "Usta İşi • El Yapımı"
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Özel Kesim Baltık Damla Kehribar Tesbih',
    type: 'Damla (Baltık)',
    price: 4250,
    image: 'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?q=80&w=2070&auto=format&fit=crop',
    specs: 'Gümüş Kamçı • 9x13mm Arpa Kesim',
    color: '#fdd835',
    size: '9x13mm',
    description: 'Doğal Baltık çamı reçinesinden milyonlarca yılda oluşmuş nadide bir parça.',
    longDescription: "Baltık Denizi kıyılarından özenle toplanan bu kehribar, usta ellerde 33'lük özel arpa kesim olarak işlenmiştir. İçindeki doğal hareler ve güneş parıltısı, her bir taneyi benzersiz kılar. Gümüş kazaziye kamçısı ile tamamlanmıştır.",
    isSpecial: true
  },
  {
    id: '2',
    name: 'Vişne Renk Ateş Kehribar Tesbih',
    type: 'Ateş Kehribar',
    price: 1850,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2040&auto=format&fit=crop',
    specs: 'Özel İşçilik • 10x14mm Kapsül Kesim',
    color: '#b71c1c',
    size: '10x14mm',
    description: 'Yoğun vişne rengi ve yüksek kondisyonu ile dikkat çeken premium seri.',
    longDescription: 'Modern işleme teknikleri ve geleneksel formun birleşimi. Gün ışığında muazzam bir renk derinliği sunan ateş kehribar, kadifemsi çekim hissiyle koleksiyoncuların gözdesidir.',
    isNew: true
  },
  {
    id: '3',
    name: 'Osmanlı Model Sıkma Kehribar',
    type: 'Sıkma Kehribar',
    price: 2400,
    image: 'https://images.unsplash.com/photo-1596942515093-662588147814?q=80&w=1964&auto=format&fit=crop',
    specs: 'Habbe Boyu 8x12mm • Gümüş Kazaziye',
    color: '#4e342e',
    size: '8x12mm',
    description: 'Eski objelerden dönüştürülmüş, zamanla renk alacak özel bir döküm.',
    longDescription: 'Osmanlı tesbih kültürünün en değerli örneklerinden esinlenerek hazırlanan sıkma kehribarımız, kullandıkça koyulaşan ve parlayan özel bir yapıya sahiptir. 1000 ayar gümüş örme kamçı ile zenginleştirilmiştir.'
  },
  {
    id: '4',
    name: 'Şeffaf Gün Işığı Damla Kehribar',
    type: 'Damla (Baltık)',
    price: 5200,
    originalPrice: 6500,
    image: 'https://images.unsplash.com/photo-1588600129881-c7207aa22aa3?q=80&w=2070&auto=format&fit=crop',
    specs: 'Usta İmzalı • 11x15mm Küre Kesim',
    color: '#fbbf24',
    size: '11x15mm',
    description: 'Yüksek şeffaflık oranı ve kusursuz küre kesimiyle yatırım değeri taşıyan eser.',
    longDescription: 'Güneşin tüm sıcaklığını içinde barındıran şeffaf damla kehribar. Müze kalitesinde hammaddeden üretilmiş, torna işçiliği ile kusursuz bir dengeye sahiptir.'
  },
  {
    id: '5',
    name: 'Klasik Sıkma Kehribar',
    type: 'Sıkma Kehribar',
    price: 1900,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1974&auto=format&fit=crop',
    specs: 'Geleneksel İşçilik • 10x12mm Kapsül Kesim',
    color: '#d97706',
    size: '10x12mm',
    description: 'Ustalardan yadigâr, zamanla güzelleşen klasik sıkma kehribar.',
    longDescription: 'Geleneksel yöntemlerle dökülen bu klasik sıkma kehribar, kullanıldıkça parlayan ve koyulaşan özel bir yapıya sahiptir. Tesbih severlerin en çok tercih ettiği formlardan biri olan kapsül kesim ile sunulmaktadır.'
  }
];

export const DEFAULT_SETTINGS: SiteSettings = {
  email: 'info@kehribarkoleksiyonum.com',
  phone: '+90 (212) 555 0123',
  address: 'Kapalıçarşı, Kalpakçılar Cd. No:42, Fatih, İstanbul',
  instagram: 'https://instagram.com/asilkehribar',
  aboutHeroImage: 'https://images.unsplash.com/photo-1574347715003-89689f506259?q=80&w=1974&auto=format&fit=crop',
  aboutContentImage: 'https://images.unsplash.com/photo-1588600129881-c7207aa22aa3?q=80&w=2070&auto=format&fit=crop',
  aboutTitle: 'Zamana Yenilmeyen <br/> Bir Asalet.',
  aboutText1: 'Asil Kehribar, sadece bir tesbih mağazası değil; milyonlarca yıllık doğal sürecin, insan zekası ve emeğiyle buluştuğu bir sanat durağıdır. Biz, Baltık ormanlarının gözyaşları olarak anılan kehribarı, en saf ve asil haliyle bulup sizlere sunmak için yola çıktık.',
  aboutText2: 'Temel amacımız, tesbih kültürünü sadece bir aksesuar olmaktan çıkarıp, kuşaktan kuşağa aktarılacak, yatırım değeri taşıyan asil bir miras haline getirmektir. Her bir eserimiz, usta sanatçılarımızın torna tezgahlarında binlerce kez dokunularak şekil alır.',
  aboutYears: '25+',
  aboutCustomers: '12.000+'
};

export const DEFAULT_BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Kehribarın Şifa Kaynağı Olduğunu Biliyor Muydunuz?',
    excerpt: 'Yüzyıllardır alternatif tıpta kullanılan kehribarın bilinmeyen faydaları...',
    content: 'Kehribar, çam ağaçlarının reçinesinin milyonlarca yıl toprak altında kalarak fosilleşmesiyle oluşur. İçerdiği süksinik asit sayesinde doğal bir ağrı kesici ve bağışıklık güçlendirici olarak bilinir. Bebeklerin diş çıkarma dönemlerinde kehribar kolye takılması da bu şifalı asidin vücut ısısıyla salgılanmasından kaynaklanır.',
    image: 'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?q=80&w=2070&auto=format&fit=crop',
    date: '25 Mayıs 2024'
  },
  {
    id: '2',
    title: 'Gerçek Kehribar Nasıl Anlaşılır?',
    excerpt: 'Piyasadaki sahte ürünlerden korunmak için bilmeniz gereken 5 temel test yöntemi.',
    content: 'Gerçek kehribarı anlamanın en bilinen yolu tuzlu su testidir. Gerçek kehribar tuzlu suda yüzerken, plastik veya cam batar. Ayrıca ısıtıldığında çam kokusu yayar. Ancak en güvenilir yöntem, güvenilir ve sertifikalı satıcılardan alışveriş yapmaktır.',
    image: 'https://images.unsplash.com/photo-1588600129881-c7207aa22aa3?q=80&w=2070&auto=format&fit=crop',
    date: '20 Mayıs 2024'
  }
];

export const MOCK_ORDERS = [
  { id: '#ORD-9284', customer: 'Ahmet Yılmaz', date: '22 Mayıs 2024', total: '₺4,250', status: 'Teslim Edildi' },
  { id: '#ORD-9285', customer: 'Elif Demir', date: '23 Mayıs 2024', total: '₺1,850', status: 'Kargoda' },
  { id: '#ORD-9286', customer: 'Murat Kaya', date: '24 Mayıs 2024', total: '₺5,200', status: 'Hazırlanıyor' },
  { id: '#ORD-9287', customer: 'Selin Yıldız', date: '24 Mayıs 2024', total: '₺2,400', status: 'Ödeme Bekliyor' },
];

export const MOCK_CUSTOMERS = [
  { id: 'C-101', name: 'Ahmet Yılmaz', email: 'ahmet@example.com', orders: 4, spent: '₺12,450' },
  { id: 'C-102', name: 'Elif Demir', email: 'elif.d@test.com', orders: 1, spent: '₺1,850' },
  { id: 'C-103', name: 'Murat Kaya', email: 'murat.kaya@gmail.com', orders: 12, spent: '₺45,200' },
  { id: 'C-104', name: 'Selin Yıldız', email: 'selin@yildiz.com', orders: 2, spent: '₺4,800' },
];

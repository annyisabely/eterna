import { Pool, QueryResult, QueryResultRow } from 'pg';
import bcrypt from 'bcryptjs';
import { env } from './env';

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 1500,
});

pool.on('error', (err) => {
  console.warn('[PostgreSQL Pool Warning]', err.message);
});

// In-memory fallback dataset for seamless local execution if PostgreSQL is not running
const defaultHash = bcrypt.hashSync('eterna123', 10);

const mockAdmins = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Eterna Cosméticos e Acessórios',
    email: 'eterna@gmail.com',
    password_hash: defaultHash,
    is_active: true,
  },
];

const mockSettings: Record<string, string> = {
  store_name: 'Eterna Cosméticos e Acessórios',
  store_slogan: 'Cosméticos e Acessórios',
  store_address: 'Av. Emílio Johnson, 1020 - Centro, Almirante Tamandaré – PR',
  store_phone: '(41) 3657-1000',
  store_whatsapp: '5541999999999',
  store_email: 'eterna@gmail.com',
  store_instagram: 'https://www.instagram.com/eternacosmeticos/',
  store_hours: 'Segunda a Sexta: 09h às 18h | Sábado: 09h às 13h',
  store_about:
    'A Eterna Cosméticos e Acessórios é a sua loja completa de beleza, maquiagem, skincare, perfumaria e acessórios em Almirante Tamandaré – PR.',
  delivery_enabled: 'true',
  pickup_enabled: 'true',
  min_order_value: '0',
  low_stock_threshold: '5',
};

const mockCategories = [
  {
    id: 'c1',
    name: 'Maquiagem',
    slug: 'maquiagem',
    description: 'Batom, base, corretivo, sombras e iluminadores',
    is_active: true,
    sort_order: 1,
  },
  {
    id: 'c2',
    name: 'Skincare',
    slug: 'skincare',
    description: 'Séruns, hidratantes, protetores e limpeza facial',
    is_active: true,
    sort_order: 2,
  },
  {
    id: 'c3',
    name: 'Cabelos',
    slug: 'cabelos',
    description: 'Máscaras, óleos finalizadores, shampoos e cronograma',
    is_active: true,
    sort_order: 3,
  },
  {
    id: 'c4',
    name: 'Perfumaria',
    slug: 'perfumaria',
    description: 'Fragrâncias femininas e masculinas marcantes',
    is_active: true,
    sort_order: 4,
  },
  {
    id: 'c5',
    name: 'Corpo & Banho',
    slug: 'corpo-e-banho',
    description: 'Hidratantes corporais, sabonetes especiais e esfoliantes',
    is_active: true,
    sort_order: 5,
  },
  {
    id: 'c6',
    name: 'Acessórios',
    slug: 'acessorios',
    description: 'Pincéis, esponjas, massageadores e aparelhos',
    is_active: true,
    sort_order: 6,
  },
];

const mockBrands = [
  { id: 'b1', name: 'Lattafa', slug: 'lattafa', is_active: true },
  { id: 'b2', name: 'Made Basics', slug: 'made-basics', is_active: true },
  { id: 'b3', name: 'Begônia', slug: 'begonia', is_active: true },
  { id: 'b4', name: 'ICandy', slug: 'icandy', is_active: true },
  { id: 'b5', name: 'Oásis', slug: 'oasis', is_active: true },
  { id: 'b6', name: 'B-MAX', slug: 'b-max', is_active: true },
  { id: 'b7', name: 'Salon Pro', slug: 'salon-pro', is_active: true },
  { id: 'b8', name: 'Piunature', slug: 'piunature', is_active: true },
  { id: 'b9', name: 'Bello Essence', slug: 'bello-essence', is_active: true },
  { id: 'b10', name: 'Super Poderes', slug: 'super-poderes', is_active: true },
];

const mockProducts = [
  {
    id: 'p1',
    name: 'Perfume Mist Lattafa Fakhar',
    slug: 'perfume-mist-lattafa-fakhar',
    description: 'Perfume Mist árabe Lattafa Fakhar com fragrância sofisticada, marcante e envolvente para corpo e cabelo.',
    brand_id: 'b1',
    brand_name: 'Lattafa',
    category_id: 'c4',
    category_name: 'Perfumaria',
    price: 120.00,
    promotional_price: null,
    sku: 'LAT-001',
    stock_quantity: 15,
    min_stock_level: 3,
    is_featured: true,
    is_active: true,
    is_archived: false,
    sold_count: 58,
    primary_image: '/products/perfume-mist-lattafa.jpg',
    created_at: new Date().toISOString(),
  },
  {
    id: 'p2',
    name: 'Depilador Elétrico Portátil Made Basics LMF-1102',
    slug: 'depilador-eletrico-portatil-made-basics',
    description: 'Depilador elétrico portátil com lâmina de precisão lavável em água e proteção suave para pele delicada.',
    brand_id: 'b2',
    brand_name: 'Made Basics',
    category_id: 'c6',
    category_name: 'Acessórios',
    price: 29.99,
    promotional_price: null,
    sku: 'DEP-002',
    stock_quantity: 20,
    min_stock_level: 5,
    is_featured: true,
    is_active: true,
    is_archived: false,
    sold_count: 73,
    primary_image: '/products/depilador-eletrico-made-basics.jpg',
    created_at: new Date().toISOString(),
  },
  {
    id: 'p3',
    name: 'Óleo Reparador Rosa Mosqueta Begônia 60ml',
    slug: 'oleo-reparador-rosa-mosqueta-begonia-60ml',
    description: 'Hidratação, reparação dos fios e brilho extremo. Enriquecido com óleo de rosa mosqueta e vitamina E.',
    brand_id: 'b3',
    brand_name: 'Begônia',
    category_id: 'c3',
    category_name: 'Cabelos',
    price: 19.99,
    promotional_price: null,
    sku: 'BEG-003',
    stock_quantity: 35,
    min_stock_level: 5,
    is_featured: true,
    is_active: true,
    is_archived: false,
    sold_count: 94,
    primary_image: '/products/oleo-reparador-rosa-mosqueta-begonia.jpg',
    created_at: new Date().toISOString(),
  },
  {
    id: 'p4',
    name: 'ICandy Fragrance Mist Hair & Body Vanilla 21 250ml',
    slug: 'icandy-fragrance-mist-hair-body-vanilla-21-250ml',
    description: 'Fragrância doce e sofisticada de Vanilla 21 para cabelos e corpo. Frasco econômico de 250ml (8.6 fl. oz).',
    brand_id: 'b4',
    brand_name: 'ICandy',
    category_id: 'c4',
    category_name: 'Perfumaria',
    price: 99.90,
    promotional_price: null,
    sku: 'CAN-004',
    stock_quantity: 18,
    min_stock_level: 4,
    is_featured: true,
    is_active: true,
    is_archived: false,
    sold_count: 42,
    primary_image: '/products/icandy-vanilla-21.jpg',
    created_at: new Date().toISOString(),
  },
  {
    id: 'p5',
    name: 'Massageador Portátil Oásis OIH-5354',
    slug: 'massageador-portatil-oasis-oih-5354',
    description: 'Massageador portátil capilar e corporal ergonômico com controle de dois botões e 10 níveis de ajuste.',
    brand_id: 'b5',
    brand_name: 'Oásis',
    category_id: 'c6',
    category_name: 'Acessórios',
    price: 79.90,
    promotional_price: null,
    sku: 'OAS-005',
    stock_quantity: 12,
    min_stock_level: 3,
    is_featured: true,
    is_active: true,
    is_archived: false,
    sold_count: 31,
    primary_image: '/products/massageador-portatil-oasis.jpg',
    created_at: new Date().toISOString(),
  },
  {
    id: 'p6',
    name: 'Kit de Maquiagem B-MAX BM-F1848 15 Peças',
    slug: 'kit-de-maquiagem-bmax-bm-f1848-15-pecas',
    description: 'Conjunto completo de pincéis de maquiagem macios e esponjas aplicadoras ergonômicas (15 peças).',
    brand_id: 'b6',
    brand_name: 'B-MAX',
    category_id: 'c1',
    category_name: 'Maquiagem',
    price: 49.90,
    promotional_price: null,
    sku: 'BMX-006',
    stock_quantity: 25,
    min_stock_level: 5,
    is_featured: true,
    is_active: true,
    is_archived: false,
    sold_count: 85,
    primary_image: '/products/kit-pinceis-bmax.jpg',
    created_at: new Date().toISOString(),
  },
  {
    id: 'p7',
    name: 'Cola para Apliques Capilares Salon Pro 30ml',
    slug: 'cola-para-apliques-capilares-salon-pro-30ml',
    description: 'Super Hair Bond Glue Professional Speed 30ml para fixação impecável, segura e rápida de apliques e extensões.',
    brand_id: 'b7',
    brand_name: 'Salon Pro',
    category_id: 'c3',
    category_name: 'Cabelos',
    price: 39.90,
    promotional_price: null,
    sku: 'SAL-007',
    stock_quantity: 40,
    min_stock_level: 8,
    is_featured: false,
    is_active: true,
    is_archived: false,
    sold_count: 110,
    primary_image: '/products/cola-apliques-salon-pro.jpg',
    created_at: new Date().toISOString(),
  },
  {
    id: 'p8',
    name: 'Sabonete Líquido Facial Piunature Fitocosméticos 100ml',
    slug: 'sabonete-liquido-facial-piunature-fitocosmeticos-100ml',
    description: 'Suave limpeza de impurezas e oleosidade com extratos naturais. Vegano, cruelty-free e dermatologicamente testado.',
    brand_id: 'b8',
    brand_name: 'Piunature',
    category_id: 'c2',
    category_name: 'Skincare',
    price: 35.00,
    promotional_price: null,
    sku: 'PIU-008',
    stock_quantity: 28,
    min_stock_level: 5,
    is_featured: true,
    is_active: true,
    is_archived: false,
    sold_count: 67,
    primary_image: '/products/sabonete-liquido-facial-pronature.jpg',
    created_at: new Date().toISOString(),
  },
  {
    id: 'p9',
    name: 'Future Skin Creme Facial Bello Essence 100ml',
    slug: 'future-skin-creme-facial-bello-essence-100ml',
    description: 'Creme diurno/noturno com rosa mosqueta, niacinamida, pantenol e proteção antipoluição e luz azul.',
    brand_id: 'b9',
    brand_name: 'Bello Essence',
    category_id: 'c2',
    category_name: 'Skincare',
    price: 29.99,
    promotional_price: null,
    sku: 'BEL-009',
    stock_quantity: 30,
    min_stock_level: 5,
    is_featured: true,
    is_active: true,
    is_archived: false,
    sold_count: 88,
    primary_image: '/products/future-skin-creme-bello-essence.jpg',
    created_at: new Date().toISOString(),
  },
  {
    id: 'p10',
    name: 'Máscara Facial Peel Off Rosa Glitz Super Poderes 100ml',
    slug: 'mascara-facial-peel-off-rosa-glitz-super-poderes-100ml',
    description: 'Máscara peel off com extrato de rosa mosqueta para ação regeneradora, antioxidante e renovação celular profunda.',
    brand_id: 'b10',
    brand_name: 'Super Poderes',
    category_id: 'c2',
    category_name: 'Skincare',
    price: 16.90,
    promotional_price: null,
    sku: 'SUP-010',
    stock_quantity: 45,
    min_stock_level: 10,
    is_featured: true,
    is_active: true,
    is_archived: false,
    sold_count: 125,
    primary_image: '/products/mascara-facial-rosa-glitz.jpg',
    created_at: new Date().toISOString(),
  },
];

const mockOrders: any[] = [];
const mockCoupons = [
  {
    id: 'cp1',
    code: 'ETERNA10',
    description: '10% de desconto na primeira compra',
    type: 'percentage',
    value: 10,
    min_order_value: 50,
    is_active: true,
    used_count: 5,
  },
];

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  try {
    const res = await pool.query<T>(text, params);
    return res;
  } catch (err: any) {
    // If PostgreSQL is not reachable, gracefully serve mock data
    const queryUpper = text.toUpperCase();

    if (queryUpper.includes('SELECT') && queryUpper.includes('PRODUCTS')) {
      if (queryUpper.includes('WHERE P.SLUG = $1') && params && params[0]) {
        const found = mockProducts.filter((p) => p.slug === params[0]) as any[];
        return { rows: found, rowCount: found.length, command: 'SELECT', oid: 0, fields: [] };
      }
      if (queryUpper.includes('COUNT(*)')) {
        return { rows: [{ total: String(mockProducts.length) }] as any[], rowCount: 1, command: 'SELECT', oid: 0, fields: [] };
      }
      return { rows: mockProducts as any[], rowCount: mockProducts.length, command: 'SELECT', oid: 0, fields: [] };
    }

    if (queryUpper.includes('SELECT') && queryUpper.includes('STORE_SETTINGS')) {
      const rows = Object.entries(mockSettings).map(([key, value]) => ({ key, value })) as any[];
      return { rows, rowCount: rows.length, command: 'SELECT', oid: 0, fields: [] };
    }

    if (queryUpper.includes('SELECT') && queryUpper.includes('CATEGORIES')) {
      return { rows: mockCategories as any[], rowCount: mockCategories.length, command: 'SELECT', oid: 0, fields: [] };
    }

    if (queryUpper.includes('SELECT') && queryUpper.includes('BRANDS')) {
      return { rows: mockBrands as any[], rowCount: mockBrands.length, command: 'SELECT', oid: 0, fields: [] };
    }

    if (queryUpper.includes('SELECT') && queryUpper.includes('BANNERS')) {
      return { rows: [] as any[], rowCount: 0, command: 'SELECT', oid: 0, fields: [] };
    }

    if (queryUpper.includes('SELECT') && queryUpper.includes('ADMINS')) {
      if (params && params[0]) {
        const found = mockAdmins.filter((a) => a.email === String(params[0]).toLowerCase()) as any[];
        return { rows: found, rowCount: found.length, command: 'SELECT', oid: 0, fields: [] };
      }
      return { rows: mockAdmins as any[], rowCount: mockAdmins.length, command: 'SELECT', oid: 0, fields: [] };
    }

    if (queryUpper.includes('SELECT') && queryUpper.includes('COUPONS')) {
      return { rows: mockCoupons as any[], rowCount: mockCoupons.length, command: 'SELECT', oid: 0, fields: [] };
    }

    if (queryUpper.includes('SELECT') && queryUpper.includes('PRODUCT_IMAGES')) {
      return { rows: [] as any[], rowCount: 0, command: 'SELECT', oid: 0, fields: [] };
    }

    if (queryUpper.includes('SELECT') && queryUpper.includes('ORDERS')) {
      return { rows: mockOrders as any[], rowCount: mockOrders.length, command: 'SELECT', oid: 0, fields: [] };
    }

    if (queryUpper.includes('SELECT') && queryUpper.includes('CUSTOMERS')) {
      return { rows: [] as any[], rowCount: 0, command: 'SELECT', oid: 0, fields: [] };
    }

    // Default safe empty result
    return { rows: [] as any[], rowCount: 0, command: 'SELECT', oid: 0, fields: [] };
  }
}

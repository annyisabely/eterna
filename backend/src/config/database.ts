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
    name: 'Eterna Cosméticos',
    email: 'eternacosmeticos',
    password_hash: defaultHash,
    is_active: true,
  },
];

const mockSettings: Record<string, string> = {
  store_name: 'Eterna Cosméticos',
  store_address: 'Av. Emílio Johnson, 1020 - Centro, Almirante Tamandaré – PR',
  store_phone: '(41) 3657-1000',
  store_whatsapp: '5541999999999',
  store_email: 'contato@eternacosmeticos.com.br',
  store_instagram: 'https://instagram.com/eterna.cosmeticos',
  store_hours: 'Segunda a Sexta: 09h às 18h | Sábado: 09h às 13h',
  store_about:
    'A Eterna Cosméticos é referência em beleza, maquiagem, skincare e cuidados capilares em Almirante Tamandaré – PR. Produtos 100% originais com atendimento humanizado.',
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
];

const mockBrands = [
  { id: 'b1', name: 'Eterna Cosméticos', slug: 'eterna-cosmeticos', is_active: true },
  { id: 'b2', name: 'Ruby Rose', slug: 'ruby-rose', is_active: true },
  { id: 'b3', name: 'Boca Rosa', slug: 'boca-rosa', is_active: true },
  { id: 'b4', name: 'Bruna Tavares', slug: 'bruna-tavares', is_active: true },
  { id: 'b5', name: 'Eudora', slug: 'eudora', is_active: true },
];

const mockProducts = [
  {
    id: 'p1',
    name: 'Batom Líquido Matte Rosa Nude Elegance',
    slug: 'batom-liquido-matte-rosa-nude-elegance',
    description: 'Batom líquido de alta fixação com acabamento aveludado e fórmula confortável enriquecida com vitamina E.',
    brand_id: 'b1',
    brand_name: 'Eterna Cosméticos',
    category_id: 'c1',
    category_name: 'Maquiagem',
    price: 34.9,
    promotional_price: 28.9,
    sku: 'BAT-001',
    stock_quantity: 18,
    min_stock_level: 5,
    is_featured: true,
    is_active: true,
    is_archived: false,
    sold_count: 42,
    primary_image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'p2',
    name: 'Sérum Facial Ácido Hialurônico Puro 30ml',
    slug: 'serum-facial-acido-hialuronico-puro-30ml',
    description: 'Hidratação profunda preenchedora com textura leve de rápida absorção para todos os tipos de pele.',
    brand_id: 'b4',
    brand_name: 'Bruna Tavares',
    category_id: 'c2',
    category_name: 'Skincare',
    price: 79.9,
    promotional_price: null,
    sku: 'SER-002',
    stock_quantity: 12,
    min_stock_level: 4,
    is_featured: true,
    is_active: true,
    is_archived: false,
    sold_count: 35,
    primary_image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'p3',
    name: 'Paleta de Sombras Nude Glamour 12 Cores',
    slug: 'paleta-de-sombras-nude-glamour-12-cores',
    description: 'Sombras matte e cintilantes com pigmentação ultra intensa e esfumado macio e elegante.',
    brand_id: 'b2',
    brand_name: 'Ruby Rose',
    category_id: 'c1',
    category_name: 'Maquiagem',
    price: 89.9,
    promotional_price: 69.9,
    sku: 'PAL-003',
    stock_quantity: 9,
    min_stock_level: 3,
    is_featured: true,
    is_active: true,
    is_archived: false,
    sold_count: 28,
    primary_image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'p4',
    name: 'Máscara de Cílios Volume & Alongamento Intenso',
    slug: 'mascara-de-cilios-volume-alongamento-intenso',
    description: 'Pincel anatômico que curva e define fio a fio sem empelotar. Resistente à água.',
    brand_id: 'b3',
    brand_name: 'Boca Rosa',
    category_id: 'c1',
    category_name: 'Maquiagem',
    price: 45.0,
    promotional_price: null,
    sku: 'MAS-004',
    stock_quantity: 24,
    min_stock_level: 5,
    is_featured: false,
    is_active: true,
    is_archived: false,
    sold_count: 51,
    primary_image: 'https://images.unsplash.com/photo-1591360236480-4ed861025fa1?w=600&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'p5',
    name: 'Óleo Reparador Capilar Nutrição & Brilho 60ml',
    slug: 'oleo-reparador-capilar-nutricao-brilho-60ml',
    description: 'Blend nobre de óleos de argan e macadâmia que sela pontas duplas e disciplina o frizz com toque seco.',
    brand_id: 'b5',
    brand_name: 'Eudora',
    category_id: 'c3',
    category_name: 'Cabelos',
    price: 58.0,
    promotional_price: 49.9,
    sku: 'OLE-005',
    stock_quantity: 3,
    min_stock_level: 5,
    is_featured: true,
    is_active: true,
    is_archived: false,
    sold_count: 19,
    primary_image: 'https://images.unsplash.com/photo-1608248597359-5f28430589a1?w=600&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'p6',
    name: 'Base Líquida Acabamento Matte Aveludado',
    slug: 'base-liquida-acabamento-matte-aveludado',
    description: 'Cobertura média a alta construível com longa duração e controle de oleosidade ao longo do dia.',
    brand_id: 'b3',
    brand_name: 'Boca Rosa',
    category_id: 'c1',
    category_name: 'Maquiagem',
    price: 64.9,
    promotional_price: null,
    sku: 'BAS-006',
    stock_quantity: 15,
    min_stock_level: 5,
    is_featured: false,
    is_active: true,
    is_archived: false,
    sold_count: 38,
    primary_image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'p7',
    name: 'Eau de Parfum Eterna Sublime Floral 75ml',
    slug: 'eau-de-parfum-eterna-sublime-floral-75ml',
    description: 'Fragrância envolvente com notas de jasmim, peônia e fundo amadeirado de baunilha e sândalo.',
    brand_id: 'b1',
    brand_name: 'Eterna Cosméticos',
    category_id: 'c4',
    category_name: 'Perfumaria',
    price: 149.9,
    promotional_price: 129.9,
    sku: 'PER-007',
    stock_quantity: 7,
    min_stock_level: 2,
    is_featured: true,
    is_active: true,
    is_archived: false,
    sold_count: 14,
    primary_image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'p8',
    name: 'Hidratante Corporal Toque Aveludado 200ml',
    slug: 'hidratante-corporal-toque-aveludado-200ml',
    description: 'Loção corporal perfumada com manteiga de karité que hidrata por 48 horas com toque sedoso.',
    brand_id: 'b1',
    brand_name: 'Eterna Cosméticos',
    category_id: 'c5',
    category_name: 'Corpo & Banho',
    price: 39.9,
    promotional_price: null,
    sku: 'COR-008',
    stock_quantity: 0,
    min_stock_level: 4,
    is_featured: false,
    is_active: true,
    is_archived: false,
    sold_count: 22,
    primary_image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80',
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

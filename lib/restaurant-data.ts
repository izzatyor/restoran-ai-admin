export type Page =
  | 'dashboard'
  | 'menu'
  | 'tables'
  | 'staff'
  | 'orders'
  | 'settings'

export type OrderStatus = 'pending' | 'preparing' | 'served' | 'paid'

export type Order = {
  id: string
  customer: string
  table: number
  items: number
  total: number
  status: OrderStatus
  placedAt: string
}

export type MenuCategory =
  | 'Starters'
  | 'Mains'
  | 'Desserts'
  | 'Drinks'

export type MenuItem = {
  id: string
  name: string
  price: number
  category: MenuCategory
  image: string
  description: string
}

export type TableStatus = 'empty' | 'occupied' | 'attention'

export type DiningTable = {
  id: string
  number: number
  seats: number
  status: TableStatus
  guests?: number
  since?: string
  server?: string
}

export const menuCategories: MenuCategory[] = [
  'Starters',
  'Mains',
  'Desserts',
  'Drinks',
]

export const stats = {
  ordersToday: 148,
  ordersDelta: 12,
  revenue: 6842,
  revenueDelta: 8.4,
  activeTables: 14,
  totalTables: 20,
  pendingOrders: 7,
}

export const recentOrders: Order[] = [
  {
    id: 'ORD-2041',
    customer: 'Maya Chen',
    table: 4,
    items: 3,
    total: 84.5,
    status: 'preparing',
    placedAt: '12 min ago',
  },
  {
    id: 'ORD-2040',
    customer: 'Diego Alvarez',
    table: 11,
    items: 5,
    total: 142.0,
    status: 'served',
    placedAt: '18 min ago',
  },
  {
    id: 'ORD-2039',
    customer: 'Priya Nair',
    table: 7,
    items: 2,
    total: 46.0,
    status: 'pending',
    placedAt: '21 min ago',
  },
  {
    id: 'ORD-2038',
    customer: 'Tom Becker',
    table: 2,
    items: 4,
    total: 98.25,
    status: 'paid',
    placedAt: '34 min ago',
  },
  {
    id: 'ORD-2037',
    customer: 'Aisha Okafor',
    table: 16,
    items: 6,
    total: 187.9,
    status: 'served',
    placedAt: '41 min ago',
  },
  {
    id: 'ORD-2036',
    customer: 'Lucas Moreau',
    table: 9,
    items: 1,
    total: 14.0,
    status: 'paid',
    placedAt: '52 min ago',
  },
]

export const menuItems: MenuItem[] = [
  {
    id: 'm1',
    name: 'Double Smash Burger',
    price: 18,
    category: 'Mains',
    image: '/menu/smash-burger.png',
    description: 'Aged cheddar, caramelized onion, brioche',
  },
  {
    id: 'm2',
    name: 'Grilled Salmon',
    price: 27,
    category: 'Mains',
    image: '/menu/grilled-salmon.png',
    description: 'Herb butter, asparagus, charred lemon',
  },
  {
    id: 'm3',
    name: 'Truffle Tagliatelle',
    price: 24,
    category: 'Mains',
    image: '/menu/truffle-pasta.png',
    description: 'Black truffle, 24-month parmesan',
  },
  {
    id: 'm4',
    name: 'Burrata & Heirloom',
    price: 15,
    category: 'Starters',
    image: '/menu/burrata-salad.png',
    description: 'Basil oil, aged balsamic, sourdough',
  },
  {
    id: 'm5',
    name: 'Dark Chocolate Tart',
    price: 12,
    category: 'Desserts',
    image: '/menu/chocolate-tart.png',
    description: 'Sea salt, vanilla bean gelato',
  },
  {
    id: 'm6',
    name: 'Spiced Margarita',
    price: 14,
    category: 'Drinks',
    image: '/menu/spiced-margarita.png',
    description: 'Reposado, chili salt, blood orange',
  },
  {
    id: 'm7',
    name: 'Ribeye & Chimichurri',
    price: 38,
    category: 'Mains',
    image: '/menu/ribeye-steak.png',
    description: '12oz dry-aged, roasted potatoes',
  },
  {
    id: 'm8',
    name: 'Baja Fish Tacos',
    price: 16,
    category: 'Starters',
    image: '/menu/fish-tacos.png',
    description: 'Lime crema, slaw, pickled onion',
  },
]

export const diningTables: DiningTable[] = [
  { id: 't1', number: 1, seats: 2, status: 'empty' },
  {
    id: 't2',
    number: 2,
    seats: 4,
    status: 'occupied',
    guests: 3,
    since: '45m',
    server: 'Jonah',
  },
  { id: 't3', number: 3, seats: 2, status: 'empty' },
  {
    id: 't4',
    number: 4,
    seats: 4,
    status: 'occupied',
    guests: 4,
    since: '20m',
    server: 'Rina',
  },
  {
    id: 't5',
    number: 5,
    seats: 6,
    status: 'attention',
    guests: 5,
    since: '1h 10m',
    server: 'Jonah',
  },
  { id: 't6', number: 6, seats: 2, status: 'empty' },
  {
    id: 't7',
    number: 7,
    seats: 4,
    status: 'occupied',
    guests: 2,
    since: '32m',
    server: 'Sam',
  },
  { id: 't8', number: 8, seats: 8, status: 'empty' },
  {
    id: 't9',
    number: 9,
    seats: 2,
    status: 'occupied',
    guests: 2,
    since: '58m',
    server: 'Rina',
  },
  {
    id: 't10',
    number: 10,
    seats: 4,
    status: 'attention',
    guests: 4,
    since: '1h 25m',
    server: 'Sam',
  },
  {
    id: 't11',
    number: 11,
    seats: 6,
    status: 'occupied',
    guests: 6,
    since: '15m',
    server: 'Jonah',
  },
  { id: 't12', number: 12, seats: 2, status: 'empty' },
]

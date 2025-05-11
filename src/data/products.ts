import { Product } from '@/types/product';

export const products: Product[] = [
  {
    id: '1',
    name: 'Fresh Organic Apples',
    description: 'Sweet and juicy organic apples, perfect for snacking or baking. Grown without pesticides or synthetic fertilizers. These apples are hand-picked at peak ripeness to ensure maximum flavor and nutritional value.',
    price: 3.99,
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6',
    category: 'Fruits',
    rating: 4.5,
    reviews: 128,
    stock: 50,
    isExpress: true,
    badges: ['Organic'],
    nutritionInfo: {
      calories: 95,
      protein: 0.5,
      carbs: 25,
      fat: 0.3,
      fiber: 4.4
    },
    ingredients: ['Organic Apples']
  },
  {
    id: '2',
    name: 'Farm Fresh Whole Milk',
    description: 'Creamy, nutritious whole milk from grass-fed cows. Our milk is pasteurized but not homogenized, offering a rich taste with the cream layer on top. Perfect for drinking, cooking, or making homemade cheese and yogurt.',
    price: 4.49,
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b',
    category: 'Dairy',
    rating: 4.8,
    reviews: 95,
    stock: 30,
    isExpress: true,
    badges: ['No Additives'],
    nutritionInfo: {
      calories: 149,
      protein: 7.7,
      carbs: 12.3,
      fat: 7.9,
      fiber: 0
    },
    ingredients: ['Whole Milk']
  },
  {
    id: '3',
    name: 'Fresh Spinach Bundle',
    description: 'Fresh, crisp spinach leaves packed with nutrients. Our spinach is carefully washed and ready to use in salads, smoothies, or cooked dishes. Rich in iron, vitamins, and antioxidants.',
    price: 2.99,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb',
    category: 'Vegetables',
    rating: 4.3,
    reviews: 76,
    stock: 45,
    isNewlyAdded: true,
    badges: ['Organic'],
    nutritionInfo: {
      calories: 23,
      protein: 2.9,
      carbs: 3.6,
      fat: 0.4,
      fiber: 2.2
    },
    ingredients: ['Organic Spinach']
  },
  {
    id: '4',
    name: 'Artisan Sourdough Bread',
    description: 'Handcrafted sourdough bread made with a 100-year-old starter. Our bread features a crispy crust and a tender, tangy interior. Made with only flour, water, salt, and our special sourdough culture.',
    price: 5.99,
    image: 'https://images.unsplash.com/photo-1585478259715-4d3a7c8bf5aa',
    category: 'Bakery',
    rating: 4.9,
    reviews: 152,
    stock: 20,
    isExpress: false,
    badges: ['Artisan', 'No Additives'],
    nutritionInfo: {
      calories: 270,
      protein: 10.5,
      carbs: 53,
      fat: 0.8,
      fiber: 3
    },
    ingredients: ['Organic Flour', 'Water', 'Salt', 'Sourdough Starter']
  },
  {
    id: '5',
    name: 'Cage-Free Large Eggs',
    description: 'Farm-fresh large eggs from cage-free, humanely raised hens. Our hens are fed a nutritious diet without antibiotics or hormones, resulting in delicious eggs with vibrant golden yolks.',
    price: 5.49,
    image: 'https://images.unsplash.com/photo-1564149504298-00c8f01f2c7d',
    category: 'Dairy',
    rating: 4.7,
    reviews: 89,
    stock: 40,
    isExpress: true,
    badges: ['Cage-Free'],
    nutritionInfo: {
      calories: 70,
      protein: 6,
      carbs: 0.6,
      fat: 5,
      fiber: 0
    },
    ingredients: ['Cage-Free Eggs']
  },
  {
    id: '6',
    name: 'Wild-Caught Salmon Fillets',
    description: 'Premium wild-caught salmon fillets, rich in omega-3 fatty acids. Our salmon is sustainably harvested and flash-frozen to preserve freshness. Perfect for grilling, baking, or pan-searing.',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2',
    category: 'Seafood',
    rating: 4.6,
    reviews: 64,
    stock: 15,
    isExpress: false,
    isNewlyAdded: true,
    badges: ['Wild-Caught', 'Sustainable'],
    nutritionInfo: {
      calories: 206,
      protein: 22,
      carbs: 0,
      fat: 13,
      fiber: 0
    },
    ingredients: ['Wild Salmon']
  },
  {
    id: '7',
    name: 'Organic Baby Carrots',
    description: 'Sweet, crunchy organic baby carrots, perfect for snacking or adding to recipes. These carrots are grown without synthetic pesticides and are washed and ready to eat.',
    price: 2.49,
    image: 'https://images.unsplash.com/photo-1447175008436-054170c2e979',
    category: 'Vegetables',
    rating: 4.2,
    reviews: 51,
    stock: 60,
    isExpress: true,
    badges: ['Organic'],
    nutritionInfo: {
      calories: 35,
      protein: 0.8,
      carbs: 8.2,
      fat: 0.2,
      fiber: 2.8
    },
    ingredients: ['Organic Carrots']
  },
  {
    id: '8',
    name: 'Greek Yogurt Plain',
    description: 'Thick, creamy Greek yogurt made from grass-fed cow\'s milk. Our Greek yogurt is strained traditionally for maximum protein content and a rich, tangy flavor. Perfect plain or with your favorite toppings.',
    price: 4.99,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777',
    category: 'Dairy',
    rating: 4.8,
    reviews: 107,
    stock: 25,
    isExpress: false,
    badges: ['High Protein'],
    nutritionInfo: {
      calories: 100,
      protein: 18,
      carbs: 5,
      fat: 0.7,
      fiber: 0
    },
    ingredients: ['Pasteurized Milk', 'Live Active Cultures']
  },
  {
    id: '9',
    name: 'Grass-Fed Ground Beef',
    description: 'Premium ground beef from grass-fed, pasture-raised cattle. Our beef is leaner and more flavorful than conventional beef, with no added hormones or antibiotics.',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976',
    category: 'Meat',
    rating: 4.7,
    reviews: 78,
    stock: 20,
    isExpress: true,
    badges: ['Grass-Fed', 'No Antibiotics'],
    nutritionInfo: {
      calories: 215,
      protein: 22,
      carbs: 0,
      fat: 14,
      fiber: 0
    },
    ingredients: ['100% Grass-Fed Beef']
  },
  {
    id: '10',
    name: 'Organic Avocados',
    description: 'Perfectly ripened organic avocados, ready to eat. Our avocados are rich in healthy fats and nutrients, with a buttery texture and rich flavor. Great for guacamole, toast, salads, or eating straight.',
    price: 6.99,
    image: 'https://images.unsplash.com/photo-1519162808019-7de1683fa2ad',
    category: 'Fruits',
    rating: 4.9,
    reviews: 132,
    stock: 40,
    isExpress: true,
    isNewlyAdded: true,
    badges: ['Organic', 'Superfood'],
    nutritionInfo: {
      calories: 234,
      protein: 2.9,
      carbs: 12.5,
      fat: 21.4,
      fiber: 9.8
    },
    ingredients: ['Organic Avocados']
  },
  {
    id: '11',
    name: 'Organic Quinoa',
    description: 'Premium organic quinoa, a complete protein grain with all nine essential amino acids. Our quinoa is pre-washed to remove bitter saponins and ready to cook. Perfect for salads, bowls, and side dishes.',
    price: 7.49,
    image: 'https://images.unsplash.com/photo-1612439169231-e31e1190e275',
    category: 'Grains',
    rating: 4.5,
    reviews: 95,
    stock: 30,
    isExpress: false,
    badges: ['Organic', 'Gluten-Free'],
    nutritionInfo: {
      calories: 222,
      protein: 8,
      carbs: 39,
      fat: 3.6,
      fiber: 5.2
    },
    ingredients: ['Organic Quinoa']
  },
  {
    id: '12',
    name: 'Dark Chocolate Bar 85%',
    description: 'Rich, intense dark chocolate bar with 85% cacao. Made from ethically sourced cacao beans and minimal sugar. Enjoy the complex flavors and antioxidant benefits of high-quality dark chocolate.',
    price: 3.99,
    image: 'https://images.unsplash.com/photo-1548907040-4baa42d10919',
    category: 'Snacks',
    rating: 4.6,
    reviews: 118,
    stock: 50,
    isExpress: false,
    badges: ['Fair Trade', 'Vegan'],
    nutritionInfo: {
      calories: 170,
      protein: 3,
      carbs: 13,
      fat: 12,
      fiber: 3.5
    },
    ingredients: ['Organic Cacao Mass', 'Organic Cacao Butter', 'Organic Coconut Sugar', 'Organic Vanilla']
  }
];

export const categories = [
  'Fruits',
  'Vegetables',
  'Dairy',
  'Bakery',
  'Meat',
  'Seafood',
  'Grains',
  'Snacks'
];

// Function to get multiple images for a product (for gallery)
export const getProductImages = (productId: string): string[] => {
  const product = products.find(p => p.id === productId);
  if (!product) return [];
  
  // Base image plus variations (in a real app, these would be actual different images)
  return [
    product.image,
    `${product.image}?v=1`,
    `${product.image}?v=2`,
    `${product.image}?v=3`,
  ];
};

// Function to get related products
export const getRelatedProducts = (productId: string, limit: number = 4): Product[] => {
  const product = products.find(p => p.id === productId);
  if (!product) return [];
  
  // Get products in the same category, excluding the current product
  const related = products
    .filter(p => p.category === product.category && p.id !== productId)
    .slice(0, limit);
  
  // If we don't have enough related products, add some other products
  if (related.length < limit) {
    const others = products
      .filter(p => p.category !== product.category && p.id !== productId)
      .slice(0, limit - related.length);
    
    return [...related, ...others];
  }
  
  return related;
};

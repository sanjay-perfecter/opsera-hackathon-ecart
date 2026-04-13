require('dotenv').config({ path: '../../../.env' });
const connectDB = require('./config/database');
const Product = require('./models/Product');
const Category = require('./models/Category');

const sampleCategories = [
  {
    name: 'Vegetables',
    slug: 'vegetable'
  },
  {
    name: 'Fruits',
    slug: 'fruit'
  }
];

const sampleProducts = [
  // Vegetables
  {
    name: 'Fresh Tomatoes',
    categorySlug: 'vegetable',
    price: 2.99,
    quantity: 150,
    description: 'Juicy and ripe red tomatoes, perfect for salads and cooking',
    unit: 'kg',
    imageUrl: '/uploads/placeholder-tomato.svg'
  },
  {
    name: 'Organic Potatoes',
    categorySlug: 'vegetable',
    price: 1.99,
    quantity: 200,
    description: 'Farm-fresh organic potatoes, ideal for all types of dishes',
    unit: 'kg',
    imageUrl: '/uploads/placeholder-potato.svg'
  },
  {
    name: 'Red Onions',
    categorySlug: 'vegetable',
    price: 1.49,
    quantity: 180,
    description: 'Crisp and flavorful red onions, essential for every kitchen',
    unit: 'kg',
    imageUrl: '/uploads/placeholder-onion.svg'
  },
  {
    name: 'Fresh Carrots',
    categorySlug: 'vegetable',
    price: 2.49,
    quantity: 120,
    description: 'Sweet and crunchy carrots, rich in vitamins and minerals',
    unit: 'kg',
    imageUrl: '/uploads/placeholder-carrot.svg'
  },
  {
    name: 'Baby Spinach',
    categorySlug: 'vegetable',
    price: 3.99,
    quantity: 80,
    description: 'Tender baby spinach leaves, perfect for salads and smoothies',
    unit: 'bunch',
    imageUrl: '/uploads/placeholder-spinach.svg'
  },
  {
    name: 'Fresh Broccoli',
    categorySlug: 'vegetable',
    price: 3.49,
    quantity: 90,
    description: 'Nutritious green broccoli florets, great for steaming or stir-frying',
    unit: 'kg',
    imageUrl: '/uploads/placeholder-broccoli.svg'
  },
  {
    name: 'Bell Peppers',
    categorySlug: 'vegetable',
    price: 4.99,
    quantity: 100,
    description: 'Colorful bell peppers - red, yellow, and green varieties',
    unit: 'kg',
    imageUrl: '/uploads/placeholder-bell-pepper.svg'
  },
  {
    name: 'Cucumber',
    categorySlug: 'vegetable',
    price: 1.79,
    quantity: 140,
    description: 'Fresh and crisp cucumbers, perfect for salads and snacking',
    unit: 'kg',
    imageUrl: '/uploads/placeholder-cucumber.svg'
  },

  // Fruits
  {
    name: 'Red Apples',
    categorySlug: 'fruit',
    price: 3.99,
    quantity: 160,
    description: 'Crispy and sweet red apples, great for snacking',
    unit: 'kg',
    imageUrl: '/uploads/placeholder-apple.svg'
  },
  {
    name: 'Fresh Bananas',
    categorySlug: 'fruit',
    price: 2.49,
    quantity: 200,
    description: 'Ripe yellow bananas, rich in potassium and energy',
    unit: 'dozen',
    imageUrl: '/uploads/placeholder-banana.svg'
  },
  {
    name: 'Juicy Oranges',
    categorySlug: 'fruit',
    price: 3.49,
    quantity: 175,
    description: 'Sweet and tangy oranges, loaded with vitamin C',
    unit: 'kg',
    imageUrl: '/uploads/placeholder-orange.svg'
  },
  {
    name: 'Alphonso Mangoes',
    categorySlug: 'fruit',
    price: 5.99,
    quantity: 85,
    description: 'Premium quality Alphonso mangoes, the king of fruits',
    unit: 'kg',
    imageUrl: '/uploads/placeholder-mango.svg'
  },
  {
    name: 'Red Grapes',
    categorySlug: 'fruit',
    price: 4.49,
    quantity: 110,
    description: 'Seedless red grapes, sweet and refreshing',
    unit: 'kg',
    imageUrl: '/uploads/placeholder-grapes.svg'
  },
  {
    name: 'Watermelon',
    categorySlug: 'fruit',
    price: 1.99,
    quantity: 70,
    description: 'Large and sweet watermelons, perfect for hot summer days',
    unit: 'piece',
    imageUrl: '/uploads/placeholder-watermelon.svg'
  },
  {
    name: 'Fresh Strawberries',
    categorySlug: 'fruit',
    price: 6.99,
    quantity: 60,
    description: 'Sweet and juicy strawberries, perfect for desserts',
    unit: 'kg',
    imageUrl: '/uploads/placeholder-strawberry.svg'
  },
  {
    name: 'Kiwi Fruits',
    categorySlug: 'fruit',
    price: 5.49,
    quantity: 95,
    description: 'Tangy kiwi fruits, packed with vitamins and antioxidants',
    unit: 'kg',
    imageUrl: '/uploads/placeholder-kiwi.svg'
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('Cleared existing products and categories');

    // Create categories first
    const categories = await Category.insertMany(sampleCategories);
    console.log(`${categories.length} categories created successfully`);

    // Create a map of slug to category ID
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.slug] = cat._id;
    });

    // Update products with category IDs
    const productsWithCategoryIds = sampleProducts.map(product => ({
      name: product.name,
      category: categoryMap[product.categorySlug],
      price: product.price,
      quantity: product.quantity,
      description: product.description,
      unit: product.unit,
      imageUrl: product.imageUrl
    }));

    // Insert sample products
    const products = await Product.insertMany(productsWithCategoryIds);
    console.log(`${products.length} products seeded successfully`);

    // Display summary
    const vegetables = products.filter(p => p.category.toString() === categoryMap['vegetable'].toString());
    const fruits = products.filter(p => p.category.toString() === categoryMap['fruit'].toString());
    console.log(`\nSeeded ${vegetables.length} vegetables and ${fruits.length} fruits`);

    console.log('\nSample products:');
    products.slice(0, 5).forEach(p => {
      const cat = categories.find(c => c._id.toString() === p.category.toString());
      console.log(`  - ${p.name} (${cat?.name}): $${p.price} - Stock: ${p.quantity} ${p.unit}`);
    });
    console.log('  ...');

    console.log('\n✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();

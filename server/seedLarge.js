import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../server/models/Product.js';

dotenv.config({ path: '../server/.env' });

const categories = ['Men', 'Women', 'Kids', 'Accessories', 'Beauty'];
const items = ['T-Shirt', 'Jacket', 'Jeans', 'Sweater', 'Dress', 'Sneakers', 'Watch', 'Sunglasses', 'Handbag', 'Belt'];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-fashion-ecommerce');
    await Product.deleteMany();

    const products = [];
    for (let i = 1; i <= 60; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const item = items[Math.floor(Math.random() * items.length)];
      const price = Math.floor(Math.random() * 200) + 20;
      const originalPrice = price + Math.floor(Math.random() * 50);

      products.push({
        name: `${category} ${item} ${i}`,
        description: `This is a high-quality ${item} from our exclusive ${category} collection. Designed for comfort and style, this piece is perfect for any occasion.`,
        price,
        originalPrice,
        image: `https://picsum.photos/seed/${i + 100}/800/1000`,
        category,
        subCategory: item,
        countInStock: Math.floor(Math.random() * 50) + 10,
        rating: (Math.random() * 2 + 3).toFixed(1),
        numReviews: Math.floor(Math.random() * 500),
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Black', 'White', 'Blue', 'Gray'],
        isNewArrival: i > 50
      });
    }

    await Product.insertMany(products);
    console.log('Successfully seeded 60 products!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedProducts();

import mongoose from 'mongoose';
import { connectDB } from './config.js';

const seedData = async () => {
  try {
    await connectDB();
    
    // Define a simple Product schema for seeding
    const productSchema = new mongoose.Schema({
      name: String,
      price: Number,
      description: String,
      category: String,
      image: String
    });
    
    // Use models directly or clear them if they exist
    const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
    
    await Product.deleteMany();
    
    const sampleProducts = [
      {
        name: 'Classic White T-Shirt',
        price: 29.99,
        description: 'A comfortable classic white t-shirt made from 100% cotton.',
        category: 'T-Shirts',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Denim Jacket',
        price: 89.99,
        description: 'Vintage style denim jacket perfect for all seasons.',
        category: 'Outerwear',
        image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      }
    ];

    await Product.insertMany(sampleProducts);
    
    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();

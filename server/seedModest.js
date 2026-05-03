import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const modestProducts = [
  { name: "Midnight Elegance Abaya", price: 120, originalPrice: 140, description: "A stunning modest abaya.", category: "abaya", occasion: "party", stock: 10, rating: 4.8, sizes: ["S", "M", "L"], colors: ["black"], image: "/uploads/products/manual-upload-required.jpg" },
  { name: "Emerald Green Long Gown", price: 150, originalPrice: 150, description: "Full sleeve modest gown.", category: "dress", occasion: "wedding", stock: 15, rating: 4.9, sizes: ["XS", "S", "M"], colors: ["green"], image: "/uploads/products/manual-upload-required.jpg" },
  { name: "Modest Denim Maxi Skirt", price: 65, originalPrice: 70, description: "Ankle-length denim skirt.", category: "jeans", occasion: "casual", stock: 20, rating: 4.5, sizes: ["S", "M", "L", "XL"], colors: ["blue"], image: "/uploads/products/manual-upload-required.jpg" },
  { name: "Royal Blue Silk Saree", price: 250, originalPrice: 300, description: "Traditional silk saree.", category: "saree", occasion: "wedding", stock: 5, rating: 5.0, sizes: ["M", "L"], colors: ["blue"], image: "/uploads/products/manual-upload-required.jpg" },
  { name: "Full Sleeve Winter Coat", price: 185, originalPrice: 220, description: "Warm and fully covered.", category: "jacket", occasion: "office", stock: 8, rating: 4.6, sizes: ["M", "L", "XL"], colors: ["black"], image: "/uploads/products/manual-upload-required.jpg" },
  { name: "Classic Long Kurti", price: 75, originalPrice: 75, description: "Beautiful ethnic kurti.", category: "ethnic", occasion: "casual", stock: 25, rating: 4.7, sizes: ["S", "M", "L"], colors: ["pink"], image: "/uploads/products/manual-upload-required.jpg" },
  { name: "Burgundy Velvet Maxi", price: 180, originalPrice: 200, description: "Luxurious velvet maxi dress.", category: "dress", occasion: "party", stock: 12, rating: 4.9, sizes: ["XS", "S", "M"], colors: ["red"], image: "/uploads/products/manual-upload-required.jpg" },
  { name: "Wide Leg Formal Trousers", price: 95, originalPrice: 100, description: "Modest loose-fit trousers.", category: "jeans", occasion: "office", stock: 30, rating: 4.4, sizes: ["M", "L", "XL"], colors: ["black"], image: "/uploads/products/manual-upload-required.jpg" },
  { name: "Modest Sportswear Tunic", price: 55, originalPrice: 55, description: "Full coverage for active wear.", category: "shirt", occasion: "sports", stock: 40, rating: 4.8, sizes: ["XS", "S", "M"], colors: ["black"], image: "/uploads/products/manual-upload-required.jpg" },
  { name: "Gold Embroidered Hijab", price: 35, originalPrice: 35, description: "Elegant hijab for occasions.", category: "accessories", occasion: "wedding", stock: 50, rating: 4.5, sizes: ["M"], colors: ["gold"], image: "/uploads/products/manual-upload-required.jpg" },
  { name: "Pastel Anarkali Suit", price: 125, originalPrice: 140, description: "Flowy full-length suit.", category: "ethnic", occasion: "party", stock: 18, rating: 4.7, sizes: ["S", "M", "L", "XL"], colors: ["pink"], image: "/uploads/products/manual-upload-required.jpg" },
  { name: "Full Coverage Swimwear", price: 110, originalPrice: 110, description: "Modest burkini style.", category: "sports", occasion: "sports", stock: 10, rating: 4.6, sizes: ["M", "L"], colors: ["blue"], image: "/uploads/products/manual-upload-required.jpg" },
  { name: "Oversized Linen Shirt", price: 40, originalPrice: 45, description: "Loose fit modest shirt.", category: "shirt", occasion: "casual", stock: 35, rating: 4.3, sizes: ["S", "M", "L"], colors: ["white"], image: "/uploads/products/manual-upload-required.jpg" },
  { name: "Pleated Midi Skirt", price: 60, originalPrice: 60, description: "Below-knee modest skirt.", category: "dress", occasion: "office", stock: 22, rating: 4.8, sizes: ["S", "M", "L"], colors: ["black"], image: "/uploads/products/manual-upload-required.jpg" },
  { name: "Sequin Evening Abaya", price: 285, originalPrice: 350, description: "Premium party abaya.", category: "abaya", occasion: "party", stock: 5, rating: 4.9, sizes: ["XS", "S", "M"], colors: ["silver"], image: "/uploads/products/manual-upload-required.jpg" }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-fashion-ecommerce');
    console.log('MongoDB Connected');
    
    await Product.deleteMany({});
    console.log('Old products cleared');

    await Product.insertMany(modestProducts);
    console.log('Database Seeded with Modest Fashion');

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedDB();

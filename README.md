# Aura - AI-Powered Fashion E-Commerce Platform

Aura is a modern, production-ready fashion e-commerce platform built with a full-stack monorepo architecture. It features a React frontend, Node.js/Express backend, MongoDB database, and a Python FastAPI service powering an intelligent AI shopping assistant, skin-tone analysis, and a simulated virtual try-on experience.

---

## 🏗 Project Architecture

The project is structured as a monorepo containing three main components:

- **`client/`**: React frontend built with Vite, Tailwind CSS v4, and Framer Motion.
- **`server/`**: Node.js & Express backend providing RESTful APIs for authentication, products, and orders.
- **`ai-services/`**: Python FastAPI microservice handling natural language semantic search (using Sentence Transformers) and computer vision features (using OpenCV).

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.10 or higher)
- MongoDB (Running locally on `127.0.0.1:27017` or via MongoDB Atlas)

### Step 1: Clone the Repository
```bash
git clone <your-repo-url>
cd ai-fashion-ecommerce
```

### Step 2: Set up the Backend (Node.js)
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server/` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/ai-fashion-ecommerce
   JWT_SECRET=your_super_secret_jwt_key
   ```
4. Seed the database with mock products:
   ```bash
   node seedLarge.js
   ```

### Step 3: Set up the Frontend (React)
1. Open a new terminal and navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Step 4: Set up AI Services (Python)
1. Open a new terminal and navigate to the AI services directory:
   ```bash
   cd ai-services
   ```
2. Create and activate a Python virtual environment:
   - **Windows:**
     ```bash
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **Mac/Linux:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
3. Install the required Python packages:
   ```bash
   pip install fastapi uvicorn motor sentence-transformers torch opencv-python python-multipart pillow numpy
   ```
   *(Note: The first time you run the AI service, it will download the SentenceTransformer model, which may take a few minutes).*

---

## 🏃‍♂️ Running the Platform

You need to run all three services concurrently in separate terminal windows.

**1. Start the Backend Server (Port 5000)**
```bash
cd server
npm run dev
```

**2. Start the React Frontend (Port 5174)**
```bash
cd client
npm run dev
```

**3. Start the AI FastAPI Service (Port 8000)**
```bash
cd ai-services
# Ensure virtual environment is activated
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 🌟 Key Features

1. **Modern UI/UX:** Responsive design using Tailwind CSS v4, smooth animations with Framer Motion, skeleton loaders, and toast notifications.
2. **Robust Backend:** Secure JWT authentication, password hashing with bcrypt, and complete CRUD operations for products and orders.
3. **Admin Dashboard:** Manage inventory, add/edit products, and track/update order fulfillment statuses.
4. **Payment Simulation:** A rich checkout experience simulating Credit Card, UPI/GPay, and Cash on Delivery workflows.
5. **AI Stylist & Chatbot:**
   - **Semantic Search:** Understands natural language queries (e.g., "blue dresses under 50").
   - **Skin Tone Analysis:** Uses OpenCV to extract skin tone from an uploaded image and recommends color palettes.
   - **Virtual Try-On (Simulation):** An algorithmic image processing pipeline to composite clothing onto user photos.

---

## 💡 Usage Guide

- **Storefront:** Access the main store at `http://localhost:5174`.
- **Admin Panel:** Navigate to `http://localhost:5174/admin` to manage the platform.
- **AI Chatbot:** Click the floating "AI" button in the bottom right corner of the storefront to chat with the Aura AI Stylist.

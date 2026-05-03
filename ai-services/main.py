import os
from fastapi import FastAPI, Body, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from sentence_transformers import SentenceTransformer, util
import re
import cv2
import numpy as np
import io
import base64
from PIL import Image

app = FastAPI(title="Smart Fashion Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SITE_SCOPE_MESSAGE = (
    "I can help only with this Aura fashion website: modest products, prices, "
    "categories, colors, occasions, outfit suggestions, checkout, wishlist, and order tracking."
)

SITE_CATEGORIES = {
    "abaya": ["abaya", "abayas"],
    "dress": ["dress", "dresses", "gown", "gowns", "maxi", "kaftan"],
    "ethnic": ["ethnic", "kurti", "kurtis", "anarkali", "sharara", "suit"],
    "saree": ["saree", "sarees"],
    "jacket": ["jacket", "jackets", "coat", "coats", "cardigan", "trench"],
    "shirt": ["shirt", "shirts", "tunic", "tunics", "top", "turtleneck"],
    "sports": ["sports", "sportswear", "swimwear", "burkini", "trackpants"],
    "accessories": ["accessory", "accessories", "hijab", "hijabs"],
    "jeans": ["jeans", "trousers", "skirt", "skirts", "palazzo", "palazzos"],
}

SITE_OCCASIONS = ["wedding", "party", "casual", "office", "sports"]
SITE_COLORS = ["black", "white", "blue", "green", "pink", "red", "purple", "gold", "silver"]
OUT_OF_SCOPE_KEYWORDS = [
    "weather", "news", "movie", "song", "recipe", "coding", "homework",
    "meaning", "translate", "cricket", "football", "politics"
]

# Database Connection
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017/ai-fashion-ecommerce")
client = AsyncIOMotorClient(MONGODB_URI)
db = client["ai-fashion-ecommerce"]

print(f"Using MongoDB URI: {MONGODB_URI.split('@')[-1] if '@' in MONGODB_URI else MONGODB_URI}")
print("Loading AI Model...")
model = SentenceTransformer('all-MiniLM-L6-v2')
print("Model loaded successfully.")

# Load OpenCV Face Detector
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

@app.get("/")
async def health():
    return {"status": "ok", "service": "Smart AI Assistant"}

@app.post("/api/chat")
async def chat(payload: dict = Body(...)):
    query = payload.get("query", "").strip()
    if not query:
        return {"response": "Please tell me what you are looking for!"}

    query_lower = query.lower()

    if any(keyword in query_lower for keyword in OUT_OF_SCOPE_KEYWORDS):
        return {"response": SITE_SCOPE_MESSAGE, "products": []}

    if any(word in query_lower for word in ["order", "track", "delivery", "status"]):
        return {
            "response": "You can track your Aura order progress from My Orders. Admin can update each order as Placed, Confirmed, Packed, Shipped, Out for Delivery, or Delivered.",
            "products": []
        }

    if "cart" in query_lower or "checkout" in query_lower or "wishlist" in query_lower:
        return {
            "response": "On Aura, add modest outfits to Cart or Wishlist, then use Checkout to place the order. After ordering, progress appears in My Orders.",
            "products": []
        }

    price_match = re.search(r'(?:under|below|less than|max|within|budget)\s*(?:\$|)?\s*(\d+)', query_lower)
    max_price = int(price_match.group(1)) if price_match else None

    category_filter = None
    for category, keywords in SITE_CATEGORIES.items():
        if any(keyword in query_lower for keyword in keywords):
            category_filter = category
            break

    occasion_filter = next((occasion for occasion in SITE_OCCASIONS if occasion in query_lower), None)
    color_filter = next((color for color in SITE_COLORS if color in query_lower), None)

    db_filter = {}
    db_filter["image"] = {"$not": re.compile("unsplash", re.I)}
    if category_filter:
        db_filter["category"] = {"$regex": category_filter, "$options": "i"}
    if occasion_filter:
        db_filter["occasion"] = {"$regex": occasion_filter, "$options": "i"}
    if color_filter:
        db_filter["$or"] = [
            {"color": {"$regex": color_filter, "$options": "i"}},
            {"colors": {"$regex": color_filter, "$options": "i"}}
        ]
    if max_price:
        db_filter["price"] = {"$lte": max_price}

    cursor = db.products.find(db_filter)
    products = await cursor.to_list(length=100)
    
    if not products:
        if max_price and category_filter:
            fallback_cursor = db.products.find({
                "category": {"$regex": category_filter, "$options": "i"},
                "image": {"$not": re.compile("unsplash", re.I)}
            }).sort("price", 1)
            fallback_products = await fallback_cursor.to_list(length=3)
            if fallback_products:
                closest = [
                    {
                        "id": str(p["_id"]),
                        "_id": str(p["_id"]),
                        "name": p.get("name"),
                        "price": p.get("price"),
                        "image": p.get("image"),
                        "category": p.get("category"),
                        "occasion": p.get("occasion"),
                        "description": p.get("description"),
                    }
                    for p in fallback_products
                ]
                return {
                    "response": f"I do not see {category_filter} options under ₹{max_price} right now. Here are the closest Aura {category_filter} picks:",
                    "products": closest
                }

        return {
            "response": f"I could not find Aura products matching that request{' under ₹' + str(max_price) if max_price else ''}. Try a category like abaya, kurti, saree, dress, hijab, jacket, or office wear.",
            "products": []
        }

    product_texts = [
        f"{p.get('name', '')} {p.get('category', '')} {p.get('occasion', '')} "
        f"{' '.join(p.get('colors', []) or [])} {p.get('color', '')} {p.get('description', '')}"
        for p in products
    ]
    product_embeddings = model.encode(product_texts, convert_to_tensor=True)
    query_embedding = model.encode(query, convert_to_tensor=True)
    
    cosine_scores = util.cos_sim(query_embedding, product_embeddings)[0]
    top_k = min(len(products), 4)
    top_results = cosine_scores.argsort(descending=True)[:top_k]
    
    matched_products = []
    for idx in top_results:
        p = products[idx]
        matched_products.append({
            "id": str(p["_id"]),
            "_id": str(p["_id"]),
            "name": p.get("name"),
            "price": p.get("price"),
            "image": p.get("image"),
            "category": p.get("category"),
            "occasion": p.get("occasion"),
            "description": p.get("description"),
        })

    response_text = "Here are Aura picks from this website:"
    if max_price:
        response_text = f"Here are Aura matches under ₹{max_price}:"
    if color_filter:
        response_text = f"Here are {color_filter} Aura picks from this website:"
    if occasion_filter:
        response_text = f"Here are Aura picks for {occasion_filter}:"
    elif category_filter:
        response_text = f"Check out these Aura {category_filter} picks:"

    return {
        "response": response_text,
        "products": matched_products
    }

@app.post("/api/stylist/analyze-skin")
async def analyze_skin(file: UploadFile = File(...)):
    """
    Phase 7: AI Stylist - Detects face, extracts skin tone, and suggests colors.
    """
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        return {"error": "Invalid image"}

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)

    if len(faces) == 0:
        return {"error": "No face detected in the image."}

    # Take the first face
    x, y, w, h = faces[0]
    
    # Extract the center region of the face (forehead/cheeks) to avoid eyes/hair
    center_y, center_x = y + int(h * 0.5), x + int(w * 0.5)
    roi_h, roi_w = int(h * 0.2), int(w * 0.2)
    face_roi = img[center_y - roi_h:center_y + roi_h, center_x - roi_w:center_x + roi_w]

    # Calculate average color (BGR)
    avg_color_per_row = np.average(face_roi, axis=0)
    avg_color = np.average(avg_color_per_row, axis=0)
    b, g, r = int(avg_color[0]), int(avg_color[1]), int(avg_color[2])

    # Convert RGB to HSV to classify skin tone
    # This is a basic heuristic for categorization
    hsv_color = cv2.cvtColor(np.uint8([[[b, g, r]]]), cv2.COLOR_BGR2HSV)[0][0]
    hue, sat, val = hsv_color[0], hsv_color[1], hsv_color[2]

    # Skin tone categorization logic
    if val > 180:
        tone = "Fair"
        best_colors = ["Emerald Green", "Navy Blue", "Jewel Tones", "Pastels"]
        outfit_types = ["Long Abayas", "Full-sleeve flowy dresses", "Modest Tunics"]
    elif val > 120:
        tone = "Medium / Olive"
        best_colors = ["Earth Tones", "Olive Green", "Mustard Yellow", "Warm Reds"]
        outfit_types = ["Structured modest blazers", "Boho-chic long kurtis", "Wide-leg trousers"]
    else:
        tone = "Deep"
        best_colors = ["Bright White", "Cobalt Blue", "Ruby Red", "Bold Neons"]
        outfit_types = ["Monochromatic modest suits", "High-contrast silk sarees", "Full-coverage gowns"]

    color_map = {
        "Emerald Green": "#50C878", "Navy Blue": "#000080", "Jewel Tones": "#800080", "Pastels": "#F3E5AB",
        "Earth Tones": "#D2B48C", "Olive Green": "#808000", "Mustard Yellow": "#FFDB58", "Warm Reds": "#990000",
        "Bright White": "#FFFFFF", "Cobalt Blue": "#0047AB", "Ruby Red": "#E0115F", "Bold Neons": "#FF00FF"
    }
    best_colors_hex = [color_map.get(c, "#808080") for c in best_colors]

    return {
        "skin_tone": tone,
        "extracted_rgb": {"r": r, "g": g, "b": b},
        "recommendations": {
            "best_colors": best_colors,
            "best_colors_hex": best_colors_hex,
            "outfit_types": outfit_types
        }
    }

@app.post("/api/virtual-try-on")
async def virtual_try_on(person_image: UploadFile = File(...), dress_image: UploadFile = File(...)):
    """
    Phase 8: Virtual Try-On - Advanced Segmentation & Overlay (Simulation/Basic Implementation)
    In a true production env, you would pass these images to a SD/VITON model.
    Here we do a basic algorithmic overlay simulation using OpenCV.
    """
    person_bytes = await person_image.read()
    dress_bytes = await dress_image.read()

    person_arr = np.frombuffer(person_bytes, np.uint8)
    dress_arr = np.frombuffer(dress_bytes, np.uint8)

    p_img = cv2.imdecode(person_arr, cv2.IMREAD_COLOR)
    d_img = cv2.imdecode(dress_arr, cv2.IMREAD_UNCHANGED) # Might have alpha

    if p_img is None or d_img is None:
        return {"error": "Invalid images"}

    # Simulate segmentation by resizing the dress and placing it on the person's torso
    # In reality, you'd use Mediapipe/DensePose to find the torso.
    # We will use face detection to approximate the torso location.
    gray = cv2.cvtColor(p_img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)

    output_img = p_img.copy()

    if len(faces) > 0:
        x, y, w, h = faces[0]
        # Approximate torso area relative to face
        torso_w = int(w * 2.5)
        torso_h = int(h * 3.5)
        torso_x = x - int((torso_w - w) / 2)
        torso_y = y + h + int(h * 0.2)

        # Make sure it stays within bounds
        torso_x = max(0, torso_x)
        torso_y = max(0, torso_y)
        torso_w = min(output_img.shape[1] - torso_x, torso_w)
        torso_h = min(output_img.shape[0] - torso_y, torso_h)

        if torso_w > 0 and torso_h > 0:
            # Resize dress
            d_resized = cv2.resize(d_img, (torso_w, torso_h))

            # If dress has no alpha channel, make a crude mask (remove white background)
            if d_resized.shape[2] == 3:
                gray_d = cv2.cvtColor(d_resized, cv2.COLOR_BGR2GRAY)
                _, mask = cv2.threshold(gray_d, 240, 255, cv2.THRESH_BINARY_INV)
                mask_inv = cv2.bitwise_not(mask)
                roi = output_img[torso_y:torso_y+torso_h, torso_x:torso_x+torso_w]
                img1_bg = cv2.bitwise_and(roi, roi, mask=mask_inv)
                img2_fg = cv2.bitwise_and(d_resized, d_resized, mask=mask)
                dst = cv2.add(img1_bg, img2_fg)
                output_img[torso_y:torso_y+torso_h, torso_x:torso_x+torso_w] = dst
            else:
                # Use alpha channel
                alpha = d_resized[:, :, 3] / 255.0
                for c in range(0, 3):
                    output_img[torso_y:torso_y+torso_h, torso_x:torso_x+torso_w, c] = (
                        alpha * d_resized[:, :, c] +
                        (1 - alpha) * output_img[torso_y:torso_y+torso_h, torso_x:torso_x+torso_w, c]
                    )

    # Encode to base64 to return
    _, buffer = cv2.imencode('.jpg', output_img)
    img_base64 = base64.b64encode(buffer).decode('utf-8')

    return {
        "success": True,
        "message": "Virtual try-on generated successfully using composite overlay simulation.",
        "image_data": f"data:image/jpeg;base64,{img_base64}"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

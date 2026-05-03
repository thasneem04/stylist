import Product from "../models/Product.js";

const publicProductFilter = {};

const setProductCache = (res) => {
  res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
};

const toBoolean = (value) =>
  value === true || value === "true" || value === "1" || value === "on";

const hasBodyField = (body, field) =>
  Object.prototype.hasOwnProperty.call(body, field);

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find(publicProductFilter);
    setProductCache(res);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({
      ...publicProductFilter,
      isFeatured: true,
    })
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(6);
    setProductCache(res);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getNewProducts = async (req, res) => {
  try {
    const products = await Product.find(publicProductFilter)
      .sort({ createdAt: -1 })
      .limit(8);
    setProductCache(res);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTrendingProducts = async (req, res) => {
  try {
    const products = await Product.find(publicProductFilter)
      .sort({ sales: -1, views: -1, rating: -1, numReviews: -1, createdAt: -1 })
      .limit(8);
    setProductCache(res);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRandomProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      { $match: publicProductFilter },
      { $sample: { size: 8 } },
    ]);
    setProductCache(res);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) res.json(product);
    else res.status(404).json({ message: "Product not found" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const sizePrices = Array.isArray(req.body.sizePrices)
      ? req.body.sizePrices
      : [];
    const productData = {
      ...req.body,
      sizes: sizePrices.length
        ? sizePrices.map((item) => item.size)
        : req.body.sizes,
      price: sizePrices.length
        ? Math.min(...sizePrices.map((item) => Number(item.price)))
        : req.body.price,
      countInStock: sizePrices.length
        ? sizePrices.reduce((sum, item) => sum + Number(item.stock || 0), 0)
        : req.body.countInStock,
      colors: req.body.colors || (req.body.color ? [req.body.color] : []),
      isFeatured: toBoolean(req.body.isFeatured),
      createdBy: req.user?._id,
    };
    const product = new Product(productData);
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      const sizePrices = Array.isArray(req.body.sizePrices)
        ? req.body.sizePrices
        : null;
      const productData = {
        ...req.body,
        ...(sizePrices
          ? {
              sizes: sizePrices.map((item) => item.size),
              price: Math.min(...sizePrices.map((item) => Number(item.price))),
              countInStock: sizePrices.reduce(
                (sum, item) => sum + Number(item.stock || 0),
                0,
              ),
            }
          : {}),
        colors:
          req.body.colors ||
          (req.body.color ? [req.body.color] : product.colors),
      };

      if (hasBodyField(req.body, "isFeatured"))
        productData.isFeatured = toBoolean(req.body.isFeatured);

      Object.assign(product, productData);
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: "Product removed" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

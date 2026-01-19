const Product = require('../models/Product');
const ProductImage = require('../models/ProductImage');
const ProductTag = require('../models/ProductTag');
const ProductAttribute = require('../models/ProductAttribute');
const Review = require('../models/Review');

async function getAllProducts(req, res, next) {
  try {
    const { page = 1, limit = 50, categoryId, status, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const options = {
      limit: parseInt(limit),
      offset,
      categoryId,
      status,
      search,
    };

    const products = await Product.findAll(options);
    const total = await Product.count(options);

    // Get images, tags, and attributes for each product
    for (let product of products) {
      try {
        product.images = await ProductImage.findByProductId(product.id);
      } catch (error) {
        console.error(`Error fetching images for product ${product.id}:`, error.message);
        product.images = [];
      }
      
      try {
        product.tags = await ProductTag.findByProductId(product.id);
      } catch (error) {
        console.error(`Error fetching tags for product ${product.id}:`, error.message);
        product.tags = [];
      }
      
      try {
        product.attributes = await ProductAttribute.findByProductId(product.id);
      } catch (error) {
        // Table might not exist if migrations haven't been run yet
        console.warn(`Error fetching attributes for product ${product.id}:`, error.message);
        product.attributes = [];
      }
    }

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getProductById(req, res, next) {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get images, tags, attributes, and reviews
    try {
      product.images = await ProductImage.findByProductId(product.id);
    } catch (error) {
      console.error(`Error fetching images for product ${product.id}:`, error.message);
      product.images = [];
    }
    
    try {
      product.tags = await ProductTag.findByProductId(product.id);
    } catch (error) {
      console.error(`Error fetching tags for product ${product.id}:`, error.message);
      product.tags = [];
    }
    
    try {
      product.attributes = await ProductAttribute.findByProductId(product.id);
    } catch (error) {
      // Table might not exist if migrations haven't been run yet
      console.warn(`Error fetching attributes for product ${product.id}:`, error.message);
      product.attributes = [];
    }
    
    try {
      // Get approved reviews for the product
      product.reviews = await Review.findByProductId(product.id, { approvedOnly: true, limit: 50 });
    } catch (error) {
      console.error(`Error fetching reviews for product ${product.id}:`, error.message);
      product.reviews = [];
    }

    res.json({ product });
  } catch (error) {
    next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    const productData = req.body;
    
    // Determine primary image from images array if provided
    let primaryImage = productData.primaryImage || '';
    if (req.body.images && Array.isArray(req.body.images) && req.body.images.length > 0) {
      // Find primary image or use first image
      const primaryImg = req.body.images.find(img => img.isPrimary) || req.body.images[0];
      primaryImage = primaryImg.url || primaryImage;
    }
    
    // Set primary image in product data
    productData.primaryImage = primaryImage;
    const product = await Product.create(productData);

    // Add images if provided
    if (req.body.images && Array.isArray(req.body.images) && req.body.images.length > 0) {
      for (let i = 0; i < req.body.images.length; i++) {
        const image = req.body.images[i];
        await ProductImage.create({
          productId: product.id,
          imageUrl: image.imagePath || image.url || image.imageUrl,
          isPrimary: image.isPrimary || (i === 0 && !primaryImage), // First image is primary if no primary specified
          displayOrder: image.displayOrder !== undefined ? image.displayOrder : i,
        });
      }
      
      // Update primary_image in products table if not already set
      if (!product.primary_image && primaryImage) {
        await Product.update(product.id, { primaryImage: primaryImage });
        product.primary_image = primaryImage;
      }
    }

    // Add attributes if provided (e.g., weights with prices)
    if (req.body.attributes && Array.isArray(req.body.attributes) && req.body.attributes.length > 0) {
      for (let i = 0; i < req.body.attributes.length; i++) {
        const attr = req.body.attributes[i];
        await ProductAttribute.create({
          productId: product.id,
          attributeType: attr.attributeType || 'weight',
          attributeValue: attr.attributeValue || attr.value,
          price: attr.price,
          oldPrice: attr.oldPrice || attr.old_price,
          stockQuantity: attr.stockQuantity || attr.stock_quantity || 0,
          skuSuffix: attr.skuSuffix || attr.sku_suffix,
          isDefault: attr.isDefault || attr.is_default || (i === 0),
          displayOrder: attr.displayOrder !== undefined ? attr.displayOrder : i,
        });
      }
    }

    // Add tags if provided
    if (req.body.tags && Array.isArray(req.body.tags)) {
      for (const tag of req.body.tags) {
        await ProductTag.create({
          productId: product.id,
          tag,
        });
      }
    }

    // Get images, tags, and attributes for response
    try {
      product.images = await ProductImage.findByProductId(product.id);
    } catch (error) {
      console.error(`Error fetching images for product ${product.id}:`, error.message);
      product.images = [];
    }
    
    try {
      product.tags = await ProductTag.findByProductId(product.id);
    } catch (error) {
      console.error(`Error fetching tags for product ${product.id}:`, error.message);
      product.tags = [];
    }
    
    try {
      product.attributes = await ProductAttribute.findByProductId(product.id);
    } catch (error) {
      console.warn(`Error fetching attributes for product ${product.id}:`, error.message);
      product.attributes = [];
    }

    res.status(201).json({
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const productData = req.body;

    // Determine primary image from images array if provided
    let primaryImage = productData.primaryImage;
    if (req.body.images && Array.isArray(req.body.images) && req.body.images.length > 0) {
      // Find primary image or use first image
      const primaryImg = req.body.images.find(img => img.isPrimary) || req.body.images[0];
      primaryImage = primaryImg.imagePath || primaryImg.url || primaryImage;
    }
    
    // Set primary image in product data if we have one
    if (primaryImage) {
      productData.primaryImage = primaryImage;
    }

    const product = await Product.update(id, productData);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update images if provided (only update if images array is explicitly provided)
    if (req.body.images !== undefined && Array.isArray(req.body.images)) {
      // Delete existing images
      await ProductImage.deleteByProductId(id);
      
      // Add new images if any
      if (req.body.images.length > 0) {
        for (let i = 0; i < req.body.images.length; i++) {
          const image = req.body.images[i];
          await ProductImage.create({
            productId: id,
            imageUrl: image.imagePath || image.url || image.imageUrl,
            isPrimary: image.isPrimary || (i === 0 && !primaryImage), // First image is primary if no primary specified
            displayOrder: image.displayOrder !== undefined ? image.displayOrder : i,
          });
        }
        
        // Update primary_image in products table if we determined a new one
        if (primaryImage && product.primary_image !== primaryImage) {
          await Product.update(id, { primaryImage: primaryImage });
          product.primary_image = primaryImage;
        }
      } else {
        // If images array is empty, clear primary_image as well
        if (product.primary_image) {
          await Product.update(id, { primaryImage: null });
          product.primary_image = null;
        }
      }
    } else if (primaryImage && product.primary_image !== primaryImage) {
      // If only primaryImage is provided (but no images array), just update primary_image field
      await Product.update(id, { primaryImage: primaryImage });
      product.primary_image = primaryImage;
    }

    // Update attributes if provided (only update if attributes array is explicitly provided)
    if (req.body.attributes !== undefined && Array.isArray(req.body.attributes)) {
      try {
        // Delete existing attributes
        await ProductAttribute.deleteByProductId(id);
        
        // Add new attributes if any
        if (req.body.attributes.length > 0) {
          for (let i = 0; i < req.body.attributes.length; i++) {
            const attr = req.body.attributes[i];
            await ProductAttribute.create({
              productId: id,
              attributeType: attr.attributeType || 'weight',
              attributeValue: attr.attributeValue || attr.value,
              price: attr.price,
              oldPrice: attr.oldPrice || attr.old_price,
              stockQuantity: attr.stockQuantity || attr.stock_quantity || 0,
              skuSuffix: attr.skuSuffix || attr.sku_suffix,
              isDefault: attr.isDefault || attr.is_default || (i === 0),
              displayOrder: attr.displayOrder !== undefined ? attr.displayOrder : i,
            });
          }
        }
      } catch (error) {
        // Table might not exist if migrations haven't been run yet
        console.warn('Error updating product attributes (table might not exist):', error.message);
        // Don't fail the entire request, just log the warning
      }
    }

    // Update tags if provided
    if (req.body.tags && Array.isArray(req.body.tags)) {
      await ProductTag.deleteByProductId(id);
      for (const tag of req.body.tags) {
        await ProductTag.create({
          productId: id,
          tag,
        });
      }
    }

    // Get updated images, tags, and attributes for response
    try {
      product.images = await ProductImage.findByProductId(product.id);
    } catch (error) {
      console.error(`Error fetching images for product ${product.id}:`, error.message);
      product.images = [];
    }
    
    try {
      product.tags = await ProductTag.findByProductId(product.id);
    } catch (error) {
      console.error(`Error fetching tags for product ${product.id}:`, error.message);
      product.tags = [];
    }
    
    try {
      product.attributes = await ProductAttribute.findByProductId(product.id);
    } catch (error) {
      console.warn(`Error fetching attributes for product ${product.id}:`, error.message);
      product.attributes = [];
    }

    res.json({
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    await Product.delete(id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
}

async function getProductsByCategory(req, res, next) {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const options = {
      limit: parseInt(limit),
      offset,
      categoryId,
    };

    const products = await Product.findAll(options);
    const total = await Product.count(options);

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
}

async function searchProducts(req, res, next) {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const { page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const options = {
      limit: parseInt(limit),
      offset,
      search: q,
    };

    const products = await Product.findAll(options);
    const total = await Product.count(options);

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getBestSellingProducts(req, res, next) {
  try {
    const { limit = 50 } = req.query;
    
    // Check if Product model has findBestSelling method (it might not if server hasn't been restarted/file not reloaded)
    // But since I updated it, it should be fine upon restart
    
    const products = await Product.findBestSelling(parseInt(limit));
    
    // Get images, tags, attributes for each product
    for (let product of products) {
      try {
        product.images = await ProductImage.findByProductId(product.id);
      } catch (error) {
        console.error(`Error fetching images for product ${product.id}:`, error.message);
        product.images = [];
      }
      
      try {
        product.tags = await ProductTag.findByProductId(product.id);
      } catch (error) {
        console.error(`Error fetching tags for product ${product.id}:`, error.message);
        product.tags = [];
      }
      
      try {
        product.attributes = await ProductAttribute.findByProductId(product.id);
      } catch (error) {
        console.warn(`Error fetching attributes for product ${product.id}:`, error.message);
        product.attributes = [];
      }
    }

    res.json({
      products,
      count: products.length
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  searchProducts,
  getBestSellingProducts,
};


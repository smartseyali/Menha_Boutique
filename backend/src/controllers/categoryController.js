const Category = require('../models/Category');
const Product = require('../models/Product');

async function getAllCategories(req, res, next) {
  try {
    const categories = await Category.findAll();
    
    // Handle empty categories array gracefully
    if (!categories || categories.length === 0) {
      return res.json({ categories: [] });
    }
    
    // Get product count for each category
    // Use Promise.allSettled to handle individual errors gracefully
    const categoriesWithCount = await Promise.allSettled(
      categories.map(async (category) => {
        try {
          const count = await Category.getProductCount(category.id);
          return { ...category, productCount: count || 0 };
        } catch (error) {
          console.error(`Error getting product count for category ${category.id}:`, error);
          // Return category with 0 count if product count fails
          return { ...category, productCount: 0 };
        }
      })
    );

    // Extract successful results, default to 0 count for failed ones
    const result = categoriesWithCount.map((item, index) => {
      if (item.status === 'fulfilled') {
        return item.value;
      } else {
        console.error(`Error processing category ${categories[index]?.id}:`, item.reason);
        return { ...categories[index], productCount: 0 };
      }
    });

    res.json({ categories: result });
  } catch (error) {
    console.error('Error in getAllCategories:', error);
    // Return empty array instead of throwing error
    res.json({ categories: [] });
  }
}

async function getCategoryById(req, res, next) {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const productCount = await Category.getProductCount(id);
    category.productCount = productCount;

    res.json({ category });
  } catch (error) {
    next(error);
  }
}

async function getCategoryProducts(req, res, next) {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const options = {
      limit: parseInt(limit),
      offset,
      categoryId: id,
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

async function createCategory(req, res, next) {
  try {
    const categoryData = req.body;
    const category = await Category.create(categoryData);

    res.status(201).json({
      message: 'Category created successfully',
      category,
    });
  } catch (error) {
    next(error);
  }
}

async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const categoryData = req.body;

    const category = await Category.update(id, categoryData);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({
      message: 'Category updated successfully',
      category,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;
    
    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category has products
    const productCount = await Category.getProductCount(id);
    if (productCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. It has ${productCount} product(s) associated with it. Please remove or reassign products first.` 
      });
    }

    // Check if category has child categories
    const childCategories = await Category.findByParentId(id);
    if (childCategories && childCategories.length > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. It has ${childCategories.length} sub-category(ies). Please delete or reassign sub-categories first.` 
      });
    }

    // Delete the category
    await Category.delete(id);

    res.json({
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    
    // Handle foreign key constraint errors
    if (error.code === '23503') {
      return res.status(400).json({ 
        message: 'Cannot delete category. It is referenced by other records (products or sub-categories).' 
      });
    }
    
    next(error);
  }
}

module.exports = {
  getAllCategories,
  getCategoryById,
  getCategoryProducts,
  createCategory,
  updateCategory,
  deleteCategory,
};


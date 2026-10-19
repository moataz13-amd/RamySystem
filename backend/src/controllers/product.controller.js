import Product from '../models/Product.js';
import '../models/Category.js';

// @desc    Fetch all products
// @route   GET /api/v1/products
// @access  Public
export const getProducts = async (req, res) => {
    try {
        const keyword = req.query.keyword ? {
            $or: [
                { nameEn: { $regex: req.query.keyword, $options: 'i' } },
                { nameAr: { $regex: req.query.keyword, $options: 'i' } }
            ]
        } : {};

        const products = await Product.find({ ...keyword }).populate('category');
        res.json({ success: true, count: products.length, data: products });
    } catch (error) {
        console.error('getProducts failed', error);
        res.status(500).json({
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        });
    }
};

// @desc    Fetch single product
// @route   GET /api/v1/products/:id
// @access  Public
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category');
        if (product) {
            res.json({ success: true, data: product });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('getProductById failed', error);
        res.status(500).json({
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        });
    }
};

// @desc    Create a product
// @route   POST /api/v1/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
    try {
        const {
            nameEn,
            nameAr,
            price,
            descriptionEn,
            descriptionAr,
            brand,
            category,
            stock,
            images,
            warrantyAr,
            warrantyEn,
        } = req.body;

        // Ensure category is a valid ObjectId or null
        const validCategory = category && category.match(/^[0-9a-fA-F]{24}$/) ? category : null;

        const product = new Product({
            nameEn: nameEn || 'Sample name',
            nameAr: nameAr || 'اسم تجريبي',
            price: price || 0,
            user: req.user._id,
            descriptionEn: descriptionEn || 'Sample description',
            descriptionAr: descriptionAr || 'وصف تجريبي',
            brand: brand || 'Sample brand',
            category: validCategory,
            stock: stock || 0,
            images: images || [{ url: 'https://via.placeholder.com/800', alt: 'Placeholder image' }],
            warrantyAr: warrantyAr || '',
            warrantyEn: warrantyEn || ''
        });

        const createdProduct = await product.save();
        res.status(201).json({ success: true, data: createdProduct });
    } catch (error) {
        console.error('createProduct failed', error);
        res.status(500).json({
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        });
    }
};

// @desc    Update a product
// @route   PUT /api/v1/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
    try {
        const {
            nameEn,
            nameAr,
            price,
            descriptionEn,
            descriptionAr,
            brand,
            category,
            stock,
            images,
            warrantyAr,
            warrantyEn,
        } = req.body;

        const product = await Product.findById(req.params.id);

        if (product) {
            // Ensure category is a valid ObjectId or keep existing
            const validCategory = category && category.match(/^[0-9a-fA-F]{24}$/) ? category : product.category;

            product.nameEn = nameEn || product.nameEn;
            product.nameAr = nameAr || product.nameAr;
            product.price = price || product.price;
            product.descriptionEn = descriptionEn || product.descriptionEn;
            product.descriptionAr = descriptionAr || product.descriptionAr;
            product.brand = brand || product.brand;
            product.category = validCategory;
            product.stock = stock || product.stock;
            product.images = images || product.images;
            if (warrantyAr !== undefined) product.warrantyAr = warrantyAr;
            if (warrantyEn !== undefined) product.warrantyEn = warrantyEn;
            if (req.body.freeShipping !== undefined) product.freeShipping = req.body.freeShipping;

            const updatedProduct = await product.save();
            res.json({ success: true, data: updatedProduct });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('updateProduct failed', error);
        res.status(500).json({
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        });
    }
};

// @desc    Delete a product
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            await Product.deleteOne({ _id: req.params.id });
            res.json({ success: true, message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('deleteProduct failed', error);
        res.status(500).json({
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        });
    }
};

// @desc    Create new review
// @route   POST /api/v1/products/:id/reviews
// @access  Private
export const createProductReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            const alreadyReviewed = product.reviews.find(
                (r) => r.user.toString() === req.user._id.toString()
            );

            if (alreadyReviewed) {
                return res.status(400).json({ message: 'Product already reviewed' });
            }

            const review = {
                name: req.user.name,
                rating: Number(rating),
                comment,
                user: req.user._id,
            };

            product.reviews.push(review);
            product.ratings.count = product.reviews.length;
            product.ratings.average =
                product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

            await product.save();
            res.status(201).json({ success: true, message: 'Review added' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('createProductReview failed', error);
        res.status(500).json({ message: error.message });
    }
};
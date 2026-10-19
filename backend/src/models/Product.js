import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    nameEn: { type: String, required: true },
    nameAr: { type: String, required: true },
    descriptionEn: { type: String, required: true },
    descriptionAr: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    images: [{ url: String, alt: String }],
    brand: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    colors: [{ name: String, hexCode: String }],
    sizes: [{ type: String }],
    featured: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },
    freeShipping: { type: Boolean, default: false },
    warrantyAr: { type: String, default: '' },
    warrantyEn: { type: String, default: '' },
    ratings: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    reviews: [reviewSchema],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;

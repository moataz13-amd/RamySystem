import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    nameEn: { type: String, required: true, unique: true },
    nameAr: { type: String, required: true, unique: true },
    image: { type: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);
export default Category;

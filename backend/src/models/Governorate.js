import mongoose from 'mongoose';

const governorateSchema = new mongoose.Schema({
    nameAr: { type: String, required: true },
    nameEn: { type: String, required: true },
    shippingCost: { type: Number, required: true, default: 50 },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

const Governorate = mongoose.model('Governorate', governorateSchema);

export default Governorate;

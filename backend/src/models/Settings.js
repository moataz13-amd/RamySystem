import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
    freeShippingThreshold: { type: Number, default: 5000 },
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;

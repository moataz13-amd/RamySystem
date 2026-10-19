import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    orderItems: [
        {
            nameEn: { type: String, required: true },
            nameAr: { type: String, required: true },
            quantity: { type: Number, required: true },
            image: { type: String, required: true },
            price: { type: Number, required: true },
            product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
            selectedColor: { type: String }
        }
    ],
    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        phone: { type: String, required: true },
        notes: { type: String }
    },
    paymentMethod: { type: String, default: 'Cash On Delivery' },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
    deliveryAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    statusHistory: [{
        status: { type: String, required: true },
        date: { type: Date, default: Date.now },
        notes: { type: String }
    }],
    status: { type: String, enum: ['Pending', 'Confirmed', 'Preparing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'], default: 'Pending' }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;

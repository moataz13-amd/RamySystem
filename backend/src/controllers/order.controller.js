import Order from '../models/Order.js';
import Product from '../models/Product.js';

// @desc    Get all orders
// @route   GET /api/v1/orders
// @access  Private/Admin
export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'id name email').populate('deliveryAgent', 'id name email');
        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get orders assigned to logged in delivery agent
// @route   GET /api/v1/orders/delivery
// @access  Private/Delivery
export const getMyDeliveryOrders = async (req, res) => {
    try {
        const orders = await Order.find({ deliveryAgent: req.user._id }).populate('user', 'id name email').populate('deliveryAgent', 'id name email');
        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Assign delivery agent to order
// @route   PUT /api/v1/orders/:id/assign
// @access  Private/Admin
export const assignDelivery = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.deliveryAgent = req.body.deliveryAgentId;
            order.status = 'Shipped';
            order.statusHistory.push({
                status: 'Shipped',
                notes: `Assigned to delivery agent`
            });

            const updatedOrder = await order.save();
            res.json({ success: true, data: updatedOrder });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/v1/orders/:id/status
// @access  Private/Admin or Delivery
export const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            if (req.user.role === 'delivery' && order.deliveryAgent?.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to update this order' });
            }

            order.status = req.body.status;
            order.statusHistory.push({
                status: req.body.status,
                notes: req.body.notes || ''
            });

            if (req.body.status === 'Delivered') {
                order.isDelivered = true;
                order.deliveredAt = Date.now();
            }

            const updatedOrder = await order.save();
            res.json({ success: true, data: updatedOrder });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private
export const addOrderItems = async (req, res) => {
    try {
        const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        const order = new Order({
            orderItems,
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            taxPrice,
            shippingPrice,
            totalPrice,
            statusHistory: [{ status: 'Pending', notes: 'Order placed by user' }]
        });

        const createdOrder = await order.save();

        // Decrease stock
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                product.stock = Math.max(0, product.stock - item.quantity);
                await product.save();
            }
        }

        res.status(201).json({ success: true, data: createdOrder });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/v1/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/v1/orders/:id
// @access  Public
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (order) {
            res.json({ success: true, data: order });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get order by phone number
// @route   GET /api/v1/orders/phone/:phone
// @access  Public
export const getOrderByPhone = async (req, res) => {
    try {
        const order = await Order.findOne({ 'shippingAddress.phone': req.params.phone })
            .sort({ createdAt: -1 })
            .populate('user', 'name email');

        if (order) {
            res.json({ success: true, data: order });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

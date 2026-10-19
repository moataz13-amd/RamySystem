import User from '../models/User.js';

export const getAdmins = async (req, res) => {
    try {
        const admins = await User.find({ role: 'admin' }).select('-password');
        res.json({ success: true, data: admins });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createAdmin = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });
        const admin = await User.create({ name, email, password, role: 'admin' });
        res.status(201).json({ success: true, data: { _id: admin._id, name: admin.name, email: admin.email } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateUserPassword = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.password = req.body.password;
        await user.save();
        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all delivery agents
// @route   GET /api/v1/users/delivery
// @access  Private/Admin
export const getDeliveryAgents = async (req, res) => {
    try {
        const agents = await User.find({ role: 'delivery' }).select('-password');
        res.json({ success: true, data: agents });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a delivery agent
// @route   POST /api/v1/users/delivery
// @access  Private/Admin
export const createDeliveryAgent = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const agent = await User.create({ name, email, password, role: 'delivery' });
        res.status(201).json({ success: true, data: { _id: agent._id, name: agent.name, email: agent.email } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAssistants = async (req, res) => {
    try {
        const assistants = await User.find({ role: 'assistant' }).select('-password');
        res.json({ success: true, data: assistants });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createAssistant = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const agent = await User.create({ name, email, password, role: 'assistant' });
        res.status(201).json({ success: true, data: { _id: agent._id, name: agent.name, email: agent.email } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (req.user._id.toString() === user._id.toString()) {
            return res.status(400).json({ message: 'لا يمكنك حذف حسابك الشخصي' });
        }

        await User.deleteOne({ _id: user._id });
        res.json({ success: true, message: 'User removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

import Settings from '../models/Settings.js';

export const getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({ freeShippingThreshold: 5000 });
        }
        res.json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSettings = async (req, res) => {
    try {
        const { freeShippingThreshold } = req.body;
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({ freeShippingThreshold: 5000 });
        }

        if (freeShippingThreshold !== undefined) {
            settings.freeShippingThreshold = Number(freeShippingThreshold);
        }

        await settings.save();
        res.json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

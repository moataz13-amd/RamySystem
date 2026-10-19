import Governorate from '../models/Governorate.js';

const defaultGovernorates = [
    { nameEn: 'Cairo', nameAr: 'القاهرة' },
    { nameEn: 'Giza', nameAr: 'الجيزة' },
    { nameEn: 'Alexandria', nameAr: 'الإسكندرية' },
    { nameEn: 'Port Said', nameAr: 'بورسعيد' },
    { nameEn: 'Suez', nameAr: 'السويس' },
    { nameEn: 'Ismailia', nameAr: 'الإسماعيلية' },
    { nameEn: 'Damietta', nameAr: 'دمياط' },
    { nameEn: 'Dakahlia', nameAr: 'الدقهلية' },
    { nameEn: 'Sharqia', nameAr: 'الشرقية' },
    { nameEn: 'Qalyubia', nameAr: 'القليوبية' },
    { nameEn: 'Kafr El Sheikh', nameAr: 'كفر الشيخ' },
    { nameEn: 'Gharbia', nameAr: 'الغربية' },
    { nameEn: 'Menofia', nameAr: 'المنوفية' },
    { nameEn: 'Beheira', nameAr: 'البحيرة' },
    { nameEn: 'Fayoum', nameAr: 'الفيوم' },
    { nameEn: 'Beni Suef', nameAr: 'بني سويف' },
    { nameEn: 'Minya', nameAr: 'المنيا' },
    { nameEn: 'Assiut', nameAr: 'أسيوط' },
    { nameEn: 'Sohag', nameAr: 'سوهاج' },
    { nameEn: 'Qena', nameAr: 'قنا' },
    { nameEn: 'Luxor', nameAr: 'الأقصر' },
    { nameEn: 'Aswan', nameAr: 'أسوان' },
    { nameEn: 'Red Sea', nameAr: 'البحر الأحمر' },
    { nameEn: 'New Valley', nameAr: 'الوادي الجديد' },
    { nameEn: 'Matrouh', nameAr: 'مطروح' },
    { nameEn: 'North Sinai', nameAr: 'شمال سيناء' },
    { nameEn: 'South Sinai', nameAr: 'جنوب سيناء' }
];

// @desc    Get all governorates
// @route   GET /api/governorates
// @access  Public
export const getGovernorates = async (req, res) => {
    try {
        let governorates = await Governorate.find({}).sort({ nameEn: 1 });

        // Seed default if empty
        if (governorates.length === 0) {
            governorates = await Governorate.insertMany(defaultGovernorates);
            // sort manually after insert
            governorates.sort((a, b) => a.nameEn.localeCompare(b.nameEn));
        }

        res.json({ success: true, count: governorates.length, data: governorates });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Update governorate shipping cost/status
// @route   PUT /api/governorates/:id
// @access  Private/Admin
export const updateGovernorate = async (req, res) => {
    try {
        const { shippingCost, isActive } = req.body;

        const governorate = await Governorate.findById(req.params.id);

        if (!governorate) {
            return res.status(404).json({ success: false, message: 'Governorate not found' });
        }

        if (shippingCost !== undefined) governorate.shippingCost = shippingCost;
        if (isActive !== undefined) governorate.isActive = isActive;

        const updatedGovernorate = await governorate.save();

        res.json({ success: true, data: updatedGovernorate });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

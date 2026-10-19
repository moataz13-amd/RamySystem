import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';

import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import userRoutes from './routes/user.routes.js';
import governorateRoutes from './routes/governorate.routes.js';
import categoryRoutes from './routes/category.routes.js';
import couponRoutes from './routes/coupon.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import upload from './config/cloudinary.js';
import User from './models/User.js';
import path from 'path';

dotenv.config();

// Debug logs (Safe: only shows presence, not values)
console.log('Environment Variables Loaded:', {
    adminPassword: !!process.env.ADMIN_PASSWORD,
    adminName: !!process.env.ADMIN_NAME,
    adminForceReset: !!process.env.ADMIN_FORCE_RESET
});

const createAdminIfMissing = async () => {
    const adminEmail = 'admin@opticstore.com';
    const adminPassword = process.env.ADMIN_PASSWORD || '123456';
    const adminName = process.env.ADMIN_NAME || 'أدمن المتجر';
    const forceReset = process.env.ADMIN_FORCE_RESET === 'true';

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
        await User.create({
            name: adminName,
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
        });
        return;
    }

    let shouldSave = false;

    if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        shouldSave = true;
    }

    if (existingAdmin.name !== adminName) {
        existingAdmin.name = adminName;
        shouldSave = true;
    }

    if (forceReset) {
        existingAdmin.password = adminPassword;
        shouldSave = true;
    }

    if (shouldSave) {
        await existingAdmin.save();
    }
};

const startServer = async () => {
    await connectDB();
    await createAdminIfMissing();

    const app = express();

    app.use(helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" }
    }));
    app.use(cors());
    app.use(express.json());

    app.use('/api/v1/auth', authRoutes);
    app.use('/api/v1/products', productRoutes);
    app.use('/api/v1/orders', orderRoutes);
    app.use('/api/v1/users', userRoutes);
    app.use('/api/v1/governorates', governorateRoutes);
    app.use('/api/v1/categories', categoryRoutes);
    app.use('/api/v1/coupons', couponRoutes);
    app.use('/api/v1/settings', settingsRoutes);

    // Serve local uploaded files (when UPLOAD_PROVIDER=local)
    app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

    // Multiple image upload route
    app.post('/api/v1/upload-multiple', upload.array('images', 5), (req, res) => {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const urls = req.files.map(file => {
            const isHttpUrl = typeof file.path === 'string' && /^https?:\/\//i.test(file.path);
            return isHttpUrl ?
                file.path :
                `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
        });

        res.json({ urls });
    });

    // Single image upload route (legacy support)
    app.post('/api/v1/upload', (req, res) => {
        upload.single('image')(req, res, (err) => {
            if (err) {
                console.error('Multer/Cloudinary Upload Error:', err);
                return res.status(500).json({
                    message: 'Upload failed',
                    error: err.message,
                    details: err
                });
            }
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            // Cloudinary: req.file.path is a URL
            // Local disk: req.file.path is a filesystem path, and req.file.filename exists
            const isHttpUrl = typeof req.file.path === 'string' && /^https?:\/\//i.test(req.file.path);
            const url = isHttpUrl ?
                req.file.path :
                `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

            res.json({ url });
        });
    });

    app.get('/', (req, res) => {
        res.send('Optical Store API is running...');
    });

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
};

startServer();
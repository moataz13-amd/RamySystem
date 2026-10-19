import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const sanitizeEnv = (value) => {
    const trimmed = (value || '').trim();
    return trimmed.replace(/^['"]/, '').replace(/['"]$/, '');
};

const cloudName = sanitizeEnv(process.env.CLOUDINARY_CLOUD_NAME);
const apiKey = sanitizeEnv(process.env.CLOUDINARY_API_KEY);
const apiSecret = sanitizeEnv(process.env.CLOUDINARY_API_SECRET);

const uploadProvider = 'local';
const canUseCloudinary = false;

if (uploadProvider === 'cloudinary' && (!cloudName || !apiKey || !apiSecret)) {
    console.error('CRITICAL: Cloudinary environment variables are missing but UPLOAD_PROVIDER is set to cloudinary!');
}

let storage;

if (canUseCloudinary) {
    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true
    });

    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'opticstore_products',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
            transformation: [{ width: 800, height: 800, crop: 'limit' }],
        },
    });
} else {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    storage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadsDir),
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname || '');
            const safeExt = ext || '.jpg';
            cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
        },
    });
}

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

export { cloudinary };
export default upload;
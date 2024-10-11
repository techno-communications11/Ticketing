import multer from 'multer';

const imageStorage = multer.diskStorage({
    destination: (req, file, callback)=> {
        callback(null, 'public/images');
    },
    filename:  (req, file, callback)=> {
        callback(null, `${Date.now()}_${file.originalname}`);
    }
});

const imageUpload = multer({
    storage: imageStorage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    }
});

export default imageUpload;

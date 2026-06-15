const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Setting = require('../models/Setting');

// ─── Multer Setup ─────────────────────────────────────────────────────────────

const uploadDir = path.join(__dirname, '../public/uploads/settings');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|ico|svg/;
  const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase()) &&
                  allowedTypes.test(file.mimetype);
  if (isValid) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

// Export the multer middleware for multiple fields
exports.uploadSettingsImages = upload.fields([
  { name: 'siteLogo', maxCount: 1 },
  { name: 'favicon', maxCount: 1 }
]);

// ─── Helper ──────────────────────────────────────────────────────────────────

const resolveImageUrl = (req, imageUrl) => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http')) return imageUrl;
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${imageUrl}`;
};

// ─── Controllers ─────────────────────────────────────────────────────────────

// @desc    Get website settings (creates default if none exists)
// @route   GET /api/v1/settings
// @access  Public
exports.getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    
    if (!settings) {
      settings = await Setting.create({});
    }

    const settingsObj = settings.toObject();
    settingsObj.siteLogo = resolveImageUrl(req, settingsObj.siteLogo);
    settingsObj.favicon = resolveImageUrl(req, settingsObj.favicon);

    res.status(200).json({ success: true, data: settingsObj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update website settings
// @route   PUT /api/v1/settings
// @access  Private/Admin
exports.updateSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }

    // Parse nested objects if they are sent as strings via FormData
    ['socialLinks', 'homepageSections', 'legalPages'].forEach(field => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        try {
          req.body[field] = JSON.parse(req.body[field]);
        } catch (e) {
          console.error(`Error parsing ${field}`);
        }
      }
    });

    const updateData = { ...req.body };

    // Handle files
    if (req.files) {
      if (req.files.siteLogo) {
        if (settings.siteLogo && !settings.siteLogo.startsWith('http')) {
          const oldFile = path.join(__dirname, '../public/uploads', settings.siteLogo);
          if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
        }
        updateData.siteLogo = `settings/${req.files.siteLogo[0].filename}`;
      }
      
      if (req.files.favicon) {
        if (settings.favicon && !settings.favicon.startsWith('http')) {
          const oldFile = path.join(__dirname, '../public/uploads', settings.favicon);
          if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
        }
        updateData.favicon = `settings/${req.files.favicon[0].filename}`;
      }
    }

    settings = await Setting.findByIdAndUpdate(settings._id, updateData, {
      new: true,
      runValidators: true
    });

    const settingsObj = settings.toObject();
    settingsObj.siteLogo = resolveImageUrl(req, settingsObj.siteLogo);
    settingsObj.favicon = resolveImageUrl(req, settingsObj.favicon);

    res.status(200).json({ success: true, data: settingsObj });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

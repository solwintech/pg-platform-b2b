const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Advertisement = require('../models/Advertisement');

// ─── Multer Setup ─────────────────────────────────────────────────────────────

const uploadDir = path.join(__dirname, '../public/uploads/advertisements');

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
    cb(null, `ad-${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase()) &&
                  allowedTypes.test(file.mimetype);
  if (isValid) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

// Export the multer middleware so routes can use it
exports.uploadAdImage = upload.single('adImage');

// ─── Helper ──────────────────────────────────────────────────────────────────

/**
 * Build the public URL for an ad image.
 * If imageUrl starts with "http" it is an external URL — return as-is.
 * Otherwise it is a relative path like "advertisements/ad-xxx.jpg" stored under public/uploads.
 */
const resolveImageUrl = (req, imageUrl) => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http')) return imageUrl;
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${imageUrl}`;
};

// ─── Controllers ─────────────────────────────────────────────────────────────

// @desc    Get all advertisements
// @route   GET /api/v1/advertisements
// @access  Public
exports.getAds = async (req, res) => {
  try {
    const ads = await Advertisement.find({ status: 'active' }).sort('-priority');

    const adsWithUrls = ads.map(ad => ({
      ...ad.toObject(),
      imageUrl: resolveImageUrl(req, ad.imageUrl)
    }));

    res.status(200).json({ success: true, count: adsWithUrls.length, advertisements: adsWithUrls });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get advertisements by placement location
// @route   GET /api/v1/advertisements/location/:location
// @access  Public
exports.getAdsByLocation = async (req, res) => {
  try {
    const ads = await Advertisement.find({
      location: req.params.location,
      status: 'active'
    }).sort('-priority');

    const adsWithUrls = ads.map(ad => ({
      ...ad.toObject(),
      imageUrl: resolveImageUrl(req, ad.imageUrl)
    }));

    res.status(200).json({ success: true, count: adsWithUrls.length, advertisements: adsWithUrls });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create a new advertisement (with optional image upload)
// @route   POST /api/v1/advertisements
// @access  Private/Admin
exports.createAd = async (req, res) => {
  try {
    const { title, subtitle, link, location, status, priority } = req.body;

    // Determine imageUrl: uploaded file takes priority, else use provided URL
    let imageUrl = req.body.imageUrl || '';
    if (req.file) {
      imageUrl = `advertisements/${req.file.filename}`;
    }

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Please provide an image (upload or URL)' });
    }

    const ad = await Advertisement.create({
      title,
      subtitle,
      imageUrl,
      link,
      location,
      status,
      priority: priority ? Number(priority) : 1
    });

    res.status(201).json({
      success: true,
      data: {
        ...ad.toObject(),
        imageUrl: resolveImageUrl(req, ad.imageUrl)
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update an advertisement
// @route   PUT /api/v1/advertisements/:id
// @access  Private/Admin
exports.updateAd = async (req, res) => {
  try {
    let ad = await Advertisement.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ success: false, message: 'Advertisement not found' });
    }

    const updateData = { ...req.body };

    // If a new image was uploaded, replace old file and update path
    if (req.file) {
      // Delete old uploaded file if it exists (not external URLs)
      if (ad.imageUrl && !ad.imageUrl.startsWith('http')) {
        const oldFilePath = path.join(__dirname, '../public/uploads', ad.imageUrl);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      updateData.imageUrl = `advertisements/${req.file.filename}`;
    }

    if (updateData.priority) {
      updateData.priority = Number(updateData.priority);
    }

    ad = await Advertisement.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: {
        ...ad.toObject(),
        imageUrl: resolveImageUrl(req, ad.imageUrl)
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete an advertisement
// @route   DELETE /api/v1/advertisements/:id
// @access  Private/Admin
exports.deleteAd = async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ success: false, message: 'Advertisement not found' });
    }

    // Delete the uploaded file if it's a local file
    if (ad.imageUrl && !ad.imageUrl.startsWith('http')) {
      const filePath = path.join(__dirname, '../public/uploads', ad.imageUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await ad.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Record a click on an advertisement
// @route   PUT /api/v1/advertisements/:id/click
// @access  Public
exports.recordClick = async (req, res) => {
  try {
    const ad = await Advertisement.findByIdAndUpdate(
      req.params.id,
      { $inc: { clicks: 1 } },
      { new: true }
    );

    if (!ad) {
      return res.status(404).json({ success: false, message: 'Advertisement not found' });
    }

    res.status(200).json({ success: true, clicks: ad.clicks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

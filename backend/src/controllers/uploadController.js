const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage
// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      // Save to public/assets/img/product folder or public/assets/videos
      const backendDir = path.resolve(__dirname, '../..'); // backend/src/controllers -> backend/
      
      // Determine subdirectory based on file type
      let subDir = 'img/product';
      if (file.mimetype.startsWith('video/')) {
        subDir = 'videos';
      }
      
      const uploadPath = path.resolve(backendDir, `../public/assets/${subDir}`);
      
      console.log('=== UPLOAD DESTINATION ===');
      console.log('__dirname (uploadController):', __dirname);
      console.log('Backend directory:', backendDir);
      console.log('Upload destination path:', uploadPath);
      console.log('Directory exists:', fs.existsSync(uploadPath));
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadPath)) {
        console.log('Creating upload directory...');
        try {
          fs.mkdirSync(uploadPath, { recursive: true });
          console.log('✓ Created upload directory:', uploadPath);
        } catch (error) {
          console.error('✗ Error creating upload directory:', error);
          console.error('Error details:', error.message, error.stack);
          return cb(new Error(`Failed to create upload directory: ${error.message}`));
        }
      }
      
      // Verify directory exists and is writable
      if (!fs.existsSync(uploadPath)) {
        console.error('✗ Upload directory does not exist after creation attempt');
        return cb(new Error('Upload directory does not exist and could not be created'));
      }
      
      try {
        fs.accessSync(uploadPath, fs.constants.W_OK);
        console.log('✓ Upload directory is writable');
      } catch (error) {
        console.error('✗ Upload directory is not writable:', error);
        return cb(new Error(`Upload directory is not writable: ${error.message}`));
      }
      
      console.log('✓ Upload destination configured successfully');
      cb(null, uploadPath);
    } catch (error) {
      console.error('✗ Error in destination function:', error);
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    // Sanitize filename: remove spaces and special characters, keep only alphanumeric, hyphens, and underscores
    const name = path.basename(file.originalname, ext)
      .replace(/\s+/g, '-')  // Replace spaces with hyphens
      .replace(/[^a-zA-Z0-9-_]/g, '')  // Remove special characters
      .toLowerCase();  // Convert to lowercase
    const filename = `${name}-${uniqueSuffix}${ext.toLowerCase()}`;
    cb(null, filename);
  }
});

// File filter - allow images and videos
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|webm|mov|quicktime/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.startsWith('video/');

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: fileFilter
});

// Upload single image
const uploadImage = (req, res, next) => {
  console.log('=== UPLOAD IMAGE REQUEST ===');
  console.log('Request method:', req.method);
  console.log('Request headers:', {
    'content-type': req.headers['content-type'],
    'content-length': req.headers['content-length'],
    'authorization': req.headers['authorization'] ? 'Present' : 'Missing'
  });
  console.log('Request body keys:', req.body ? Object.keys(req.body) : 'undefined');
  console.log('Request files:', req.files);
  console.log('Request file (before multer):', req.file);
  
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('=== UPLOAD ERROR ===');
      console.error('Error type:', err.constructor.name);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      
      if (err instanceof multer.MulterError) {
        console.error('Multer error code:', err.code);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File size too large. Maximum size is 5MB.' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ message: 'Unexpected file field. Use "image" as the field name.' });
        }
        return res.status(400).json({ message: err.message });
      }
      return res.status(400).json({ message: err.message });
    }

    console.log('=== AFTER MULTER PROCESSING ===');
    console.log('req.file:', req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      encoding: req.file.encoding,
      mimetype: req.file.mimetype,
      destination: req.file.destination,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size
    } : 'null');

    if (!req.file) {
      console.error('=== NO FILE ERROR ===');
      console.error('req.file is null or undefined');
      console.error('req.body:', req.body);
      console.error('req.files:', req.files);
      return res.status(400).json({ message: 'No file uploaded. Make sure the form field is named "image".' });
    }

    // Verify file was actually saved
    const filePath = path.join(req.file.destination, req.file.filename);
    const absoluteFilePath = path.resolve(filePath);
    
    console.log('=== FILE VERIFICATION ===');
    console.log('File destination:', req.file.destination);
    console.log('File filename:', req.file.filename);
    console.log('Expected file path:', filePath);
    console.log('Absolute file path:', absoluteFilePath);
    console.log('File exists:', fs.existsSync(absoluteFilePath));
    
    if (!fs.existsSync(absoluteFilePath)) {
      console.error('=== FILE NOT SAVED ERROR ===');
      console.error('File was not saved to disk');
      console.error('Expected path:', absoluteFilePath);
      console.error('Directory exists:', fs.existsSync(req.file.destination));
      console.error('Directory is writable:', (() => {
        try {
          fs.accessSync(req.file.destination, fs.constants.W_OK);
          return true;
        } catch {
          return false;
        }
      })());
      return res.status(500).json({ 
        message: 'File upload failed - file was not saved to disk',
        details: {
          expectedPath: absoluteFilePath,
          destination: req.file.destination,
          filename: req.file.filename
        }
      });
    }

    // Get file stats to verify
    const stats = fs.statSync(absoluteFilePath);
    console.log('=== FILE UPLOAD SUCCESS ===');
    console.log('File uploaded successfully:', {
      originalname: req.file.originalname,
      filename: req.file.filename,
      destination: req.file.destination,
      path: absoluteFilePath,
      size: req.file.size,
      actualSize: stats.size,
      created: stats.birthtime,
      modified: stats.mtime
    });

    // Return the path relative to public folder
    let relativePath = '/assets/img/product/';
    if (req.file.destination.includes('videos')) {
      relativePath = '/assets/videos/';
    } else if (req.file.destination.includes('assets') && req.file.destination.includes('img') && req.file.destination.includes('product')) {
       relativePath = '/assets/img/product/';
    }
    
    // Normalize path separators to forward slashes
    const imagePath = `${relativePath}${req.file.filename}`;
    
    res.json({
      message: 'Image uploaded successfully',
      imagePath: imagePath,
      filename: req.file.filename,
      size: stats.size
    });
  });
};

// Upload multiple images
const uploadMultipleImages = (req, res, next) => {
  console.log('=== UPLOAD MULTIPLE IMAGES REQUEST ===');
  console.log('Request method:', req.method);
  console.log('Request headers:', {
    'content-type': req.headers['content-type'],
    'content-length': req.headers['content-length']
  });
  
  upload.array('images', 10)(req, res, (err) => {
    if (err) {
      console.error('=== MULTIPLE UPLOAD ERROR ===');
      console.error('Error type:', err.constructor.name);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      
      if (err instanceof multer.MulterError) {
        console.error('Multer error code:', err.code);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File size too large. Maximum size is 5MB per file.' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ message: 'Unexpected file field. Use "images" as the field name.' });
        }
        return res.status(400).json({ message: err.message });
      }
      return res.status(400).json({ message: err.message });
    }

    console.log('=== AFTER MULTER PROCESSING (MULTIPLE) ===');
    console.log('req.files count:', req.files ? req.files.length : 0);
    console.log('req.files:', req.files ? req.files.map(f => ({
      fieldname: f.fieldname,
      originalname: f.originalname,
      filename: f.filename,
      destination: f.destination,
      size: f.size
    })) : 'null');

    if (!req.files || req.files.length === 0) {
      console.error('=== NO FILES ERROR ===');
      console.error('req.files is null or empty');
      console.error('req.body:', req.body);
      return res.status(400).json({ message: 'No files uploaded. Make sure the form field is named "images".' });
    }

    // Verify all files were actually saved
    const uploadedFiles = [];
    for (const file of req.files) {
      const filePath = path.join(file.destination, file.filename);
      const absoluteFilePath = path.resolve(filePath);
      
      console.log('Verifying file:', {
        originalname: file.originalname,
        filename: file.filename,
        expectedPath: absoluteFilePath,
        exists: fs.existsSync(absoluteFilePath)
      });
      
      if (!fs.existsSync(absoluteFilePath)) {
        console.error('=== FILE NOT SAVED ERROR ===');
        console.error('File was not saved to disk:', absoluteFilePath);
        console.error('Directory exists:', fs.existsSync(file.destination));
        return res.status(500).json({ 
          message: `File upload failed - ${file.originalname} was not saved`,
          details: {
            expectedPath: absoluteFilePath,
            destination: file.destination,
            filename: file.filename
          }
        });
      }
      
      const stats = fs.statSync(absoluteFilePath);
      uploadedFiles.push({
        imagePath: `/assets/img/product/${file.filename}`,
        filename: file.filename
      });
      console.log('File uploaded successfully:', {
        originalname: file.originalname,
        filename: file.filename,
        destination: file.destination,
        path: absoluteFilePath,
        size: file.size,
        actualSize: stats.size
      });
    }
    
    res.json({
      message: 'Images uploaded successfully',
      images: uploadedFiles
    });
  });
};

module.exports = {
  uploadImage,
  uploadMultipleImages,
  upload // Export multer instance for use in routes if needed
};


const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3003;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const nameWithoutExt = path.basename(file.originalname, ext);
        cb(null, nameWithoutExt + '-' + uniqueSuffix + ext);
    }
});

// File filter function to validate file types
const fileFilter = (req, file, cb) => {
    console.log('File received:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
    });

    // Allowed MIME types
    const allowedMimeTypes = [
        'application/pdf',
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
    ];

    // Allowed file extensions
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    // Check MIME type and file extension
    if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
        cb(null, true);
    } else {
        const error = new Error('Invalid file type. Only PDF and Word documents are allowed.');
        error.code = 'INVALID_FILE_TYPE';
        cb(error, false);
    }
};

// Configure multer with size limits and file validation
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB limit
        files: 1 // Only one file at a time
    }
});

// Helper function to format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper function to get file type description
function getFileTypeDescription(filename) {
    const ext = path.extname(filename).toLowerCase();
    switch (ext) {
        case '.pdf':
            return 'PDF Document';
        case '.doc':
            return 'Word Document (.doc)';
        case '.docx':
            return 'Word Document (.docx)';
        default:
            return 'Unknown Document';
    }
}

// Route to serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to handle resume uploads
app.post('/upload-resume', (req, res) => {
    const uploadSingle = upload.single('resume');
    
    uploadSingle(req, res, function (err) {
        console.log('Upload attempt:', {
            hasFile: !!req.file,
            error: err ? err.message : null
        });

        if (err) {
            console.error('Upload error:', err);

            // Handle specific multer errors
            if (err instanceof multer.MulterError) {
                switch (err.code) {
                    case 'LIMIT_FILE_SIZE':
                        return res.status(400).json({
                            error: 'File size exceeds the 2MB limit. Please choose a smaller file.',
                            code: 'FILE_TOO_LARGE'
                        });
                    case 'LIMIT_FILE_COUNT':
                        return res.status(400).json({
                            error: 'Only one file can be uploaded at a time.',
                            code: 'TOO_MANY_FILES'
                        });
                    case 'LIMIT_UNEXPECTED_FILE':
                        return res.status(400).json({
                            error: 'Unexpected file field. Please use the correct form.',
                            code: 'UNEXPECTED_FIELD'
                        });
                    default:
                        return res.status(400).json({
                            error: 'File upload error: ' + err.message,
                            code: 'UPLOAD_ERROR'
                        });
                }
            }

            // Handle custom file type errors
            if (err.code === 'INVALID_FILE_TYPE') {
                return res.status(400).json({
                    error: err.message,
                    code: 'INVALID_FILE_TYPE'
                });
            }

            // Generic error
            return res.status(500).json({
                error: 'An unexpected error occurred during file upload.',
                code: 'SERVER_ERROR'
            });
        }

        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                error: 'No file uploaded. Please select a resume file.',
                code: 'NO_FILE'
            });
        }

        // Additional server-side validation
        const fileSize = req.file.size;
        const fileName = req.file.originalname;
        const fileExtension = path.extname(fileName).toLowerCase();

        // Double-check file size
        if (fileSize > 2 * 1024 * 1024) {
            // Remove the uploaded file
            fs.unlink(req.file.path, (unlinkErr) => {
                if (unlinkErr) console.error('Error removing oversized file:', unlinkErr);
            });

            return res.status(400).json({
                error: 'File size exceeds 2MB limit.',
                code: 'FILE_TOO_LARGE'
            });
        }

        // Validate file extension again
        if (!['.pdf', '.doc', '.docx'].includes(fileExtension)) {
            // Remove the uploaded file
            fs.unlink(req.file.path, (unlinkErr) => {
                if (unlinkErr) console.error('Error removing invalid file:', unlinkErr);
            });

            return res.status(400).json({
                error: 'Invalid file type. Only PDF and Word documents are allowed.',
                code: 'INVALID_FILE_TYPE'
            });
        }

        // Log successful upload
        console.log('File uploaded successfully:', {
            originalName: req.file.originalname,
            filename: req.file.filename,
            size: formatFileSize(req.file.size),
            path: req.file.path
        });

        // Return success response
        res.json({
            message: 'Resume uploaded successfully!',
            file: {
                originalName: req.file.originalname,
                filename: req.file.filename,
                size: formatFileSize(req.file.size),
                type: getFileTypeDescription(req.file.originalname),
                uploadDate: new Date().toISOString()
            }
        });
    });
});

// Route to list uploaded files (for admin/debugging)
app.get('/uploads', (req, res) => {
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            return res.status(500).json({
                error: 'Error reading uploads directory',
                code: 'READ_ERROR'
            });
        }

        const fileList = files.map(filename => {
            const filePath = path.join(uploadsDir, filename);
            const stats = fs.statSync(filePath);
            
            return {
                filename: filename,
                originalName: filename.split('-').slice(0, -2).join('-'), // Approximate original name
                size: formatFileSize(stats.size),
                type: getFileTypeDescription(filename),
                uploadDate: stats.birthtime.toISOString()
            };
        });

        res.json({
            message: `Found ${fileList.length} uploaded files`,
            files: fileList
        });
    });
});

// Route to download uploaded files (optional feature)
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            error: 'File not found',
            code: 'FILE_NOT_FOUND'
        });
    }

    // Validate filename to prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).json({
            error: 'Invalid filename',
            code: 'INVALID_FILENAME'
        });
    }

    // Set appropriate headers
    res.download(filePath, (err) => {
        if (err) {
            console.error('Download error:', err);
            res.status(500).json({
                error: 'Error downloading file',
                code: 'DOWNLOAD_ERROR'
            });
        }
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'JobConnect Resume Upload',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    
    res.status(500).json({
        error: 'An unexpected server error occurred',
        code: 'SERVER_ERROR'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        code: 'NOT_FOUND'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`💼 JobConnect Resume Upload Portal is running on http://localhost:${PORT}`);
    console.log('📁 Upload directory:', uploadsDir);
    console.log(`
🔧 Configuration:
- Max file size: 2MB
- Allowed types: PDF, DOC, DOCX
- Upload endpoint: POST /upload-resume
- File list: GET /uploads
- Health check: GET /health

🚀 Ready to receive resume uploads!
    `);
});

module.exports = app;
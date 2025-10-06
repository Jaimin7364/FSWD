const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const path = require('path');
require('dotenv').config();

// Import models
const Student = require('./models/Student');

const app = express();
const PORT = 3000;

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static('public'));

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://yoranzatech_db_user:qymykr6NOkW5PM62@yoranza.8jnrxaj.mongodb.net/student_management';

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB successfully');
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    });

// Routes

// Dashboard - View all students with statistics
app.get('/', async (req, res) => {
    try {
        const { search, grade, status, page = 1 } = req.query;
        const limit = 10;
        const skip = (page - 1) * limit;

        // Build query
        let query = {};
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { studentId: { $regex: search, $options: 'i' } }
            ];
        }
        if (grade) query.grade = grade;
        if (status) query.status = status;

        // Get students with pagination
        const students = await Student.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalStudents = await Student.countDocuments(query);
        const totalPages = Math.ceil(totalStudents / limit);

        // Get statistics
        const stats = await Student.getStatistics();

        res.render('index', {
            students,
            stats,
            searchQuery: search,
            gradeFilter: grade,
            statusFilter: status,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalStudents
            },
            message: req.query.message,
            messageType: req.query.type
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).render('index', {
            students: [],
            stats: {},
            error: 'Error loading dashboard data',
            message: 'Error loading dashboard data',
            messageType: 'error'
        });
    }
});

// API Routes

// Get all students (API)
app.get('/api/students', async (req, res) => {
    try {
        const { search, grade, status, limit = 50, page = 1 } = req.query;
        const skip = (page - 1) * parseInt(limit);

        let query = {};
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { studentId: { $regex: search, $options: 'i' } }
            ];
        }
        if (grade) query.grade = grade;
        if (status) query.status = status;

        const students = await Student.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Student.countDocuments(query);

        res.json({
            success: true,
            students,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalStudents: total,
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get single student (API)
app.get('/api/students/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Student not found'
            });
        }
        res.json({
            success: true,
            student
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create new student (API)
app.post('/api/students', async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.status(201).json({
            success: true,
            message: 'Student created successfully',
            student
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Update student (API)
app.put('/api/students/:id', async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Student not found'
            });
        }
        res.json({
            success: true,
            message: 'Student updated successfully',
            student
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Delete student (API)
app.delete('/api/students/:id', async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Student not found'
            });
        }
        res.json({
            success: true,
            message: 'Student deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Web Routes for UI

// Show add student form
app.get('/students/add', (req, res) => {
    res.render('add-student', {
        title: 'Add New Student',
        student: {},
        error: null
    });
});

// Handle add student form submission
app.post('/students', async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.redirect('/?message=Student added successfully&type=success');
    } catch (error) {
        console.error('Error creating student:', error);
        res.render('add-student', {
            title: 'Add New Student',
            student: req.body,
            error: error.message
        });
    }
});

// Show edit student form
app.get('/students/:id/edit', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.redirect('/?message=Student not found&type=error');
        }
        res.render('edit-student', {
            title: 'Edit Student',
            student,
            error: null
        });
    } catch (error) {
        console.error('Error fetching student:', error);
        res.redirect('/?message=Error loading student data&type=error');
    }
});

// Handle edit student form submission
app.put('/students/:id', async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!student) {
            return res.redirect('/?message=Student not found&type=error');
        }
        res.redirect('/?message=Student updated successfully&type=success');
    } catch (error) {
        console.error('Error updating student:', error);
        const student = await Student.findById(req.params.id);
        res.render('edit-student', {
            title: 'Edit Student',
            student: student || req.body,
            error: error.message
        });
    }
});

// Show single student details
app.get('/students/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.redirect('/?message=Student not found&type=error');
        }
        res.render('student-detail', {
            title: 'Student Details',
            student
        });
    } catch (error) {
        console.error('Error fetching student:', error);
        res.redirect('/?message=Error loading student data&type=error');
    }
});

// Delete student (Web)
app.delete('/students/:id', async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Student not found'
            });
        }
        res.json({
            success: true,
            message: 'Student deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get statistics (API)
app.get('/api/statistics', async (req, res) => {
    try {
        const stats = await Student.getStatistics();
        res.json({
            success: true,
            statistics: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Student Management Admin Panel',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Something went wrong!'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(` Student Management Admin Panel is running on http://localhost:${PORT}`);
    console.log(`
🔧 Configuration:
- Database: ${MONGODB_URI}
- Environment: ${process.env.NODE_ENV || 'development'}

 Features:
- Complete CRUD operations for student records
- Advanced search and filtering
- Fee management and tracking
- Statistics dashboard
- RESTful API endpoints

🚀 Ready to manage student records!
    `);
});

module.exports = app;
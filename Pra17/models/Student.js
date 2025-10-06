const mongoose = require('mongoose');

// Define the student schema
const studentSchema = new mongoose.Schema({
    studentId: {
        type: String,
        unique: true,
        trim: true
    },
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        minlength: [2, 'First name must be at least 2 characters long'],
        maxlength: [30, 'First name cannot exceed 30 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        minlength: [2, 'Last name must be at least 2 characters long'],
        maxlength: [30, 'Last name cannot exceed 30 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
    },
    phone: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                return !v || /^[\+]?[1-9][\d\s\-\(\)]{8,15}$/.test(v);
            },
            message: 'Please enter a valid phone number'
        }
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required']
    },
    grade: {
        type: String,
        required: [true, 'Grade is required'],
        enum: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
    },
    subjects: {
        type: [String],
        default: []
    },
    address: {
        type: String,
        trim: true,
        maxlength: [500, 'Address cannot exceed 500 characters']
    },
    feeAmount: {
        type: Number,
        min: [0, 'Fee amount cannot be negative'],
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'graduated', 'dropped'],
        default: 'active'
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [1000, 'Notes cannot exceed 1000 characters']
    }
}, {
    timestamps: true
});

// Virtual for full name
studentSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual for age calculation
studentSchema.virtual('age').get(function() {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
});

// Virtual for enrollment duration
studentSchema.virtual('enrollmentDuration').get(function() {
    if (!this.createdAt) return 'Unknown';
    const now = new Date();
    const enrollment = new Date(this.createdAt);
    const diffTime = Math.abs(now - enrollment);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
        return `${diffDays} days`;
    } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} month${months > 1 ? 's' : ''}`;
    } else {
        const years = Math.floor(diffDays / 365);
        const remainingMonths = Math.floor((diffDays % 365) / 30);
        let duration = `${years} year${years > 1 ? 's' : ''}`;
        if (remainingMonths > 0) {
            duration += ` ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
        }
        return duration;
    }
});

// Virtual for fee status
studentSchema.virtual('feeStatus').get(function() {
    if (this.feeAmount > 0) {
        return 'Set';
    } else {
        return 'Not Set';
    }
});

// Pre-save middleware to generate student ID
studentSchema.pre('save', async function(next) {
    if (this.isNew && !this.studentId) {
        const year = new Date().getFullYear();
        const initials = (this.firstName.charAt(0) + this.lastName.charAt(0)).toUpperCase();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        this.studentId = `${year}${this.grade.padStart(2, '0')}${initials}${random}`;
    }
    next();
});

// Static method to get statistics
studentSchema.statics.getStatistics = async function() {
    try {
        const totalStudents = await this.countDocuments();
        const activeStudents = await this.countDocuments({ status: 'active' });
        const inactiveStudents = await this.countDocuments({ status: 'inactive' });
        const graduatedStudents = await this.countDocuments({ status: 'graduated' });
        
        // Grade distribution
        const gradeDistribution = await this.aggregate([
            { $group: { _id: '$grade', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);
        
        // Recent enrollments (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentEnrollments = await this.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });
        
        // Fee statistics
        const feeStats = await this.aggregate([
            {
                $group: {
                    _id: null,
                    totalFees: { $sum: '$feeAmount' },
                    averageFee: { $avg: '$feeAmount' },
                    maxFee: { $max: '$feeAmount' },
                    minFee: { $min: '$feeAmount' }
                }
            }
        ]);
        
        return {
            overview: {
                totalStudents,
                activeStudents,
                inactiveStudents,
                graduatedStudents,
                recentEnrollments
            },
            gradeDistribution,
            feeStatistics: feeStats[0] || {
                totalFees: 0,
                averageFee: 0,
                maxFee: 0,
                minFee: 0,
                totalPaid: 0
            }
        };
    } catch (error) {
        throw new Error('Error calculating statistics: ' + error.message);
    }
};

// Configure toJSON to include virtuals
studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
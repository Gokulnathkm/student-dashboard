// src/models/Mark.js
const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  code: String,
  name: String,
  subject: String,          // alias for name (frontend compat)
  marksObtained: Number,
  maxMarks: { type: Number, default: 100 },
  score: Number             // alias for marksObtained (frontend compat)
}, { _id: false });

const MarkSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  exam: {
    name: String,
    date: Date
  },
  subjects: [SubjectSchema],
  totalObtained: Number,
  totalMax: Number,
  percentage: Number,
  createdAt: { type: Date, default: Date.now }
});

MarkSchema.pre('save', function(next) {
  // Normalize subject fields
  this.subjects.forEach(sub => {
    if (sub.subject && !sub.name) sub.name = sub.subject;
    if (sub.name && !sub.subject) sub.subject = sub.name;
    if (sub.score != null && sub.marksObtained == null) sub.marksObtained = sub.score;
    if (sub.marksObtained != null && sub.score == null) sub.score = sub.marksObtained;
    if (!sub.maxMarks) sub.maxMarks = 100;
  });

  const totalObtained = this.subjects.reduce((s, sub) => s + (Number(sub.marksObtained) || 0), 0);
  const totalMax = this.subjects.reduce((s, sub) => s + (Number(sub.maxMarks) || 0), 0);
  this.totalObtained = totalObtained;
  this.totalMax = totalMax;
  this.percentage = totalMax ? (totalObtained / totalMax) * 100 : 0;
  next();
});

module.exports = mongoose.model('Mark', MarkSchema);

// src/routes/marks.js
const express = require('express');
const Mark = require('../models/Mark');
const Student = require('../models/Student');
const Class = require('../models/Class');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

const router = express.Router();

// Create mark record
router.post('/', auth, async (req, res) => {
  try {
    const { studentId, classId, exam, subjects } = req.body;

    // Normalize subjects from frontend format
    const normalizedSubjects = (subjects || []).map(s => ({
      code: s.code || '',
      name: s.name || s.subject || 'Subject',
      subject: s.subject || s.name || 'Subject',
      marksObtained: s.marksObtained ?? s.score ?? 0,
      score: s.score ?? s.marksObtained ?? 0,
      maxMarks: s.maxMarks || 100
    }));

    const mark = new Mark({
      studentId,
      classId: classId || undefined,
      exam: {
        name: exam?.name || 'Exam',
        date: exam?.date ? new Date(exam.date) : new Date()
      },
      subjects: normalizedSubjects
    });
    await mark.save();
    res.status(201).json(mark);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get marks by student
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    const marks = await Mark.find({ studentId }).sort({ 'exam.date': -1 });
    res.json(marks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete mark
router.delete('/:id', auth, async (req, res) => {
  try {
    const m = await Mark.findByIdAndDelete(req.params.id);
    if (!m) return res.status(404).json({ error: 'Mark not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Dashboard analytics overview
router.get('/analytics/overview', auth, async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalClasses = await Class.countDocuments();
    const totalMarks = await Mark.countDocuments();

    // Average percentage across all marks
    const avgResult = await Mark.aggregate([
      { $group: { _id: null, avgPercentage: { $avg: '$percentage' } } }
    ]);
    const avgPercentage = avgResult.length ? Math.round(avgResult[0].avgPercentage * 10) / 10 : 0;

    // Pass rate (percentage >= 40)
    const passCount = await Mark.countDocuments({ percentage: { $gte: 40 } });
    const passRate = totalMarks > 0 ? Math.round((passCount / totalMarks) * 100) : 0;

    // Top performers: students with highest average percentage
    const topPerformers = await Mark.aggregate([
      { $group: { _id: '$studentId', avgPct: { $avg: '$percentage' }, examCount: { $sum: 1 } } },
      { $sort: { avgPct: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'students', localField: '_id', foreignField: '_id', as: 'student' } },
      { $unwind: { path: '$student', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 1, avgPct: 1, examCount: 1, name: '$student.name', registerNumber: '$student.registerNumber' } }
    ]);

    // Attention needed: students with avg percentage < 40
    const attentionNeeded = await Mark.aggregate([
      { $group: { _id: '$studentId', avgPct: { $avg: '$percentage' } } },
      { $match: { avgPct: { $lt: 40 } } },
      { $sort: { avgPct: 1 } },
      { $limit: 5 },
      { $lookup: { from: 'students', localField: '_id', foreignField: '_id', as: 'student' } },
      { $unwind: { path: '$student', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 1, avgPct: 1, name: '$student.name', registerNumber: '$student.registerNumber' } }
    ]);

    // Class comparison: average % per class
    const classComparison = await Mark.aggregate([
      { $group: { _id: '$classId', avgPct: { $avg: '$percentage' } } },
      { $lookup: { from: 'classes', localField: '_id', foreignField: '_id', as: 'class' } },
      { $unwind: { path: '$class', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 1, avgPct: 1, name: { $ifNull: ['$class.name', 'Unknown'] }, section: '$class.section' } },
      { $sort: { avgPct: -1 } }
    ]);

    // Recent exams trend
    const examTrend = await Mark.aggregate([
      { $group: {
        _id: { name: '$exam.name', date: '$exam.date' },
        avgPct: { $avg: '$percentage' },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.date': 1 } },
      { $limit: 10 },
      { $project: { exam: '$_id.name', date: '$_id.date', avgPct: 1, count: 1, _id: 0 } }
    ]);

    res.json({
      totalStudents,
      totalClasses,
      totalMarks,
      avgPercentage,
      passRate,
      topPerformers,
      attentionNeeded,
      classComparison,
      examTrend
    });
  } catch (err) {
    console.error('Analytics overview error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Class-level trend aggregation
router.get('/analytics/class/:classId/trends', auth, async (req, res) => {
  try {
    const { classId } = req.params;
    const results = await Mark.aggregate([
      { $match: { classId: new mongoose.Types.ObjectId(classId) } },
      { $group: {
        _id: { examName: '$exam.name', examDate: '$exam.date' },
        avgPercent: { $avg: '$percentage' },
        minPercent: { $min: '$percentage' },
        maxPercent: { $max: '$percentage' },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.examDate': 1 } }
    ]);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

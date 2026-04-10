// src/routes/classes.js
const express = require('express');
const mongoose = require('mongoose');
const Class = require('../models/Class');
const Student = require('../models/Student');
const auth = require('../middleware/auth');

const router = express.Router();

// Create class
router.post('/', auth, async (req, res) => {
  try {
    const c = new Class(req.body);
    await c.save();
    res.status(201).json(c);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// List all classes (with student count)
router.get('/', auth, async (req, res) => {
  try {
    const classes = await Class.find().lean();
    // Attach student count to each class
    const classIds = classes.map(c => c._id);
    const counts = await Student.aggregate([
      { $match: { classId: { $in: classIds } } },
      { $group: { _id: '$classId', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    counts.forEach(c => { countMap[c._id.toString()] = c.count; });
    const result = classes.map(c => ({
      ...c,
      studentCount: countMap[c._id.toString()] || 0
    }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET single class with students
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid class id' });
    const klass = await Class.findById(id).lean();
    if (!klass) return res.status(404).json({ error: 'Class not found' });

    const students = await Student.find({ classId: id }).select('name registerNumber _id').limit(1000).lean();
    klass.students = students;
    klass.studentCount = students.length;
    res.json(klass);
  } catch (err) {
    console.error('Get class error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update class
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid class id' });
    const updated = await Class.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Class not found' });
    res.json(updated);
  } catch (err) {
    console.error('Update class error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete class
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid class id' });
    const deleted = await Class.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Class not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete class error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

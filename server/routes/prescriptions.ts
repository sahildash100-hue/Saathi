import express from 'express';
import Prescription from '../models/Prescription';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Get all prescriptions
router.get('/', async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ 
      userId: (req as any).userId,
      completed: false 
    }).sort({ time: 1 });
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching prescriptions', error });
  }
});

// Create a prescription
router.post('/', async (req, res) => {
  try {
    const { medicationName, dosage, time } = req.body;
    const prescription = new Prescription({
      userId: (req as any).userId,
      medicationName,
      dosage,
      time,
    });
    await prescription.save();
    res.status(201).json(prescription);
  } catch (error) {
    res.status(500).json({ message: 'Error creating prescription', error });
  }
});

// Mark prescription as completed
router.patch('/:id/complete', async (req, res) => {
  try {
    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      { completed: true },
      { new: true }
    );
    res.json(prescription);
  } catch (error) {
    res.status(500).json({ message: 'Error completing prescription', error });
  }
});

// Delete a prescription
router.delete('/:id', async (req, res) => {
  try {
    await Prescription.findByIdAndDelete(req.params.id);
    res.json({ message: 'Prescription deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting prescription', error });
  }
});

export default router;

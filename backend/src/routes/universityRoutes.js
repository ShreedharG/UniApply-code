import express from 'express';
import { getAllUniversities, getUniversityById, getAllPrograms } from '../controllers/universityController.js';


const router = express.Router();

router.get('/', getAllUniversities);
router.get('/:id', getUniversityById);

export default router;

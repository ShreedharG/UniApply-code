import express from 'express';
import { getAllPrograms } from '../controllers/universityController.js';


const router = express.Router();

router.get('/', getAllPrograms);

export default router;

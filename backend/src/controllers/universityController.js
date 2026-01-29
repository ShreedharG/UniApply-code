import { University, Program } from '../models/index.js';

// @desc    Get all universities with programs
// @route   GET /api/universities
// @access  Public
export const getAllUniversities = async (req, res) => {
    try {
        const universities = await University.find()
            .populate({
                path: 'programs',
                select: 'name degree duration fee'
            })
            .sort({ ranking: 1 });
        res.json(universities);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get university by ID
// @route   GET /api/universities/:id
// @access  Public
export const getUniversityById = async (req, res) => {
    try {
        const university = await University.findById(req.params.id)
            .populate('programs');

        if (!university) {
            return res.status(404).json({ message: 'University not found' });
        }

        res.json(university);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all programs
// @route   GET /api/programs
// @access  Public
export const getAllPrograms = async (req, res) => {
    try {
        const { universityId } = req.query;
        const filter = universityId ? { universityId } : {};

        const programs = await Program.find(filter)
            .populate('universityId', 'name location');
        res.json(programs);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

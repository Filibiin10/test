import pool from '../db/db.js';

export const getAllEventCategories = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM event_categories');
        res.json(rows);
        
        console.log(rows)
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving categories', error });
    }
};

import pool from '../db/db.js';
import { randomUUID } from 'crypto';

export async function FundraiserController (req, res) {
    // Fundraiser data
    const uuid = randomUUID();
    const title = "A Small Contribution Can Create Big Opportunities";
    const description = "Your donation helps support our community outreach programs.";
    const goalAmount = 50000; // GHS 50,000
    const fundraisingCategoryId = 1; // For example, 1 for 'Education'
    const imageUrl = "path/to/image.jpg";
    const endDate = '2024-12-31';

    // SQL query
    const sql = `INSERT INTO fundraisers (uuid, title, description, goal_amount, fundraising_category_id, image_url, end_date)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;

    try {
        // Insert into the database
        const [result] = await pool.execute(sql, [
            uuid,
            title,
            description,
            goalAmount,
            fundraisingCategoryId,
            imageUrl,
            endDate
        ]);

        // Success response
        res.json({ message: "New fundraiser added successfully!", id: result.insertId });
    } catch (error) {
        // Error handling
        console.error("Error inserting fundraiser:", error);
        res.status(500).json({ error: "Failed to add fundraiser" });
    }
}

export async function getAllFundraisers(req, res) {
    try {
        const [rows] = await pool.query('SELECT * FROM fundraisers');
        res.json(rows);
        
        console.log(rows)
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving fundraisers', error });
    }
}


export const getFundraiserById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM fundraisers WHERE uuid = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Event not found' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving event', error });
    }
};
import pool from '../db/db.js';

// Get all donations
export const getAllTickets = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM tickets');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving donations', error });
    }
};

// Get a specific donation by ID
export const getDonationById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM tickets WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Donation not found' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving donation', error });
    }
};

// Create a new donation
export const createDonation = async (req, res) => {
    const { fundraiser_id, donor_name, donor_email, donor_phone, amount ,channel } = req.body;

    // Ensure all required fields are provided
    if (!fundraiser_id || !donor_email || !donor_phone || !amount) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO tickets (fundraiser_id, donor_name, donor_email, donor_phone, amount, channel) VALUES (?, ?, ?, ?, ?, ?)',
            [fundraiser_id, donor_name, donor_email, donor_phone, amount,channel]
        );
        res.status(201).json({
            id: result.insertId,
            fundraiser_id,
            donor_name,
            donor_email,
            donor_phone,
            amount,
            channel
        });
        console.log("Donation created successfully");
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating donation', error });
    }
};

// Update a donation
export const updateDonation = async (req, res) => {
    const { id } = req.params;
    const { fundraiser_id, donor_name, donor_email, donor_phone, amount } = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE tiskets SET fundraiser_id = ?, donor_name = ?, donor_email = ?, donor_phone = ?, amount = ? WHERE id = ?',
            [fundraiser_id, donor_name, donor_email, donor_phone, amount, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Donation not found' });
        res.json({ message: 'Donation updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating donation', error });
    }
};

// Delete a donation
export const deleteDonation = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM tickets WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Donation not found' });
        res.json({ message: 'Donation deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting donation', error });
    }
};

// Get total amount donated
export const getTotalDonations = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT SUM(amount) AS totalDonations FROM donations');
        const totalDonations = rows[0].totalDonations || 0;
        const formattedTotal = Number(totalDonations).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        res.json({ totalDonations: formattedTotal });
    } catch (error) {
        console.error("Error retrieving total donations:", error);
        res.status(500).json({ message: 'Error retrieving total donations', error });
    }
};

// Get today's donations
export const getTodaysDonations = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT SUM(amount) AS todaysDonations FROM donations WHERE DATE(created_at) = CURDATE()');
        const todaysDonations = rows[0].todaysDonations || 0;
        const formattedDonations = Number(todaysDonations).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        res.json({ todaysDonations: formattedDonations });
    } catch (error) {
        console.error("Error retrieving today's donations:", error);
        res.status(500).json({ message: "Error retrieving today's donations", error });
    }
};

// Get weekly donations
export const getWeeklyDonations = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                DATE(created_at) AS date, 
                SUM(amount) AS dailyDonations 
            FROM 
                donations 
            WHERE 
                created_at >= CURDATE() - INTERVAL (WEEKDAY(CURDATE())) DAY 
            GROUP BY 
                DATE(created_at)
            ORDER BY 
                DATE(created_at)
        `);

        const weeklyDonations = Array(7).fill(0);
        rows.forEach(row => {
            const dayIndex = new Date(row.date).getDay(); // 0 (Sun) to 6 (Sat)
            weeklyDonations[dayIndex] = row.dailyDonations || 0;
        });

        res.json({ weeklyDonations });
    } catch (error) {
        console.error("Error retrieving weekly donations:", error);
        res.status(500).json({ message: "Error retrieving weekly donations", error });
    }
};

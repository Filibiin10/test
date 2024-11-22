// controllers/ticketingeventsController.js
import pool from '../db/db.js';

// Get all events
export const getAllEvents = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM ticketing_events');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller function to fetch events with type info
export const fetchTicketingEvents = async (req, res) => {
    try {
        const query = `
            SELECT 
                ticketing_events.id, 
                ticketing_events.name, 
                ticketing_events.description, 
                ticketing_events.date, 
                ticketing_events.time, 
                ticketing_events.location, 
                ticketing_events.image_url, 
                ticketing_events.is_premium,
                event_types.name AS event_type_name,
                event_types.description AS event_type_description
            FROM 
                ticketing_events
            JOIN 
                event_types 
            ON 
                ticketing_events.type_id = event_types.id;
        `;

        // Use async/await to fetch data with promise-based query
        const [results] = await pool.query(query);
        res.json(results); // Send the data to the client
    } catch (error) {
        console.error("Unexpected error:", error);
        res.status(500).json({ error: "An unexpected error occurred" });
    }
}

// 
export const fetchTicketingEvent = async (req, res) => {
  try {
      const query = `
          SELECT 
              ticketing_events.id AS event_id, 
              ticketing_events.uuid AS event_uuid, 
              ticketing_events.name AS event_name, 
              ticketing_events.description AS event_description, 
              ticketing_events.start_date  AS start_date, 
              ticketing_events.end_date   AS end_date , 
              ticketing_events.start_time  AS start_time , 
              ticketing_events.end_time   AS end_time  , 
              ticketing_events.location AS event_location, 
              ticketing_events.about_event AS about_event,
              ticketing_events.image_url AS event_image_url, 
              ticketing_events.is_premium AS event_is_premium, 
              event_types.name AS event_type_name, 
              event_types.description AS event_type_description,
              event_categories.name AS event_category_name,
              event_categories.id AS event_category_id
          FROM 
              ticketing_events
          JOIN 
              event_types ON ticketing_events.type_id = event_types.id
          JOIN 
              event_categories ON ticketing_events.category_id = event_categories.id;
      `;

      // Execute the query
      const [results] = await pool.query(query);
      res.json(results); // Send the results to the client
  } catch (error) {
      console.error("Unexpected error:", error);
      res.status(500).json({ error: "An unexpected error occurred" });
  }
}

//

export const fetchTicketingEventsById = async (req, res) => {
  try {
    // Get the event_id (from the 'id' parameter)
    const { id } = req.params;

    // Check if id is provided
    if (!id) {
      return res.status(400).json({ error: "Event ID is required" });
    }

    // Modify the query to filter by event_id (using 'id' in the query)
    const query = `
      SELECT 
        ticketing_events.id AS event_id, 
        ticketing_events.name AS event_name, 
        ticketing_events.description AS event_description, 
        ticketing_events.start_date  AS start_date, 
        ticketing_events.end_date   AS end_date , 
        ticketing_events.start_time  AS start_time , 
        ticketing_events.end_time   AS end_time  , 
        ticketing_events.location AS event_location, 
        ticketing_events.about_event AS about_event,
        ticketing_events.image_url AS event_image_url, 
        ticketing_events.is_premium AS event_is_premium, 
        event_types.name AS event_type_name, 
        event_types.description AS event_type_description,
        event_categories.name AS event_category_name
      FROM 
        ticketing_events
      JOIN 
        event_types ON ticketing_events.type_id = event_types.id
      JOIN 
        event_categories ON ticketing_events.category_id = event_categories.id
      WHERE 
        ticketing_events.id = ?;  -- Filter by event_id
    `;

    // Execute the query with the id as a parameter
    const [results] = await pool.query(query, [id]);

    // Check if event is found
    if (results.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Send the results to the client
    res.json(results[0]);  // Return the first matching event
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
}


export const fetchTicketingEventsByUuid = async (req, res) => {
  try {
    // Get the UUID from the 'uuid' parameter
    const { uuid } = req.params;

    // Check if UUID is provided
    if (!uuid) {
      return res.status(400).json({ error: "UUID is required" });
    }

    // Modify the query to filter by UUID
    const query = `
      SELECT 
        ticketing_events.id AS event_id, 
        ticketing_events.uuid AS event_uuid, 
        ticketing_events.name AS event_name, 
        ticketing_events.description AS event_description, 
        ticketing_events.start_date  AS start_date, 
        ticketing_events.end_date   AS end_date , 
        ticketing_events.start_time  AS start_time , 
        ticketing_events.end_time   AS end_time  , 
        ticketing_events.location AS event_location, 
        ticketing_events.about_event AS about_event,
        ticketing_events.image_url AS event_image_url, 
        ticketing_events.is_premium AS event_is_premium, 
        event_types.name AS event_type_name, 
        event_types.description AS event_type_description,
        event_categories.name AS event_category_name
      FROM 
        ticketing_events
      JOIN 
        event_types ON ticketing_events.type_id = event_types.id
      JOIN 
        event_categories ON ticketing_events.category_id = event_categories.id
      WHERE 
        ticketing_events.uuid = ?;  -- Filter by UUID
    `;

    // Execute the query with the UUID as a parameter
    const [results] = await pool.query(query, [uuid]);

    // Check if the event is found
    if (results.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Send the results to the client
    res.json(results[0]); // Return the first matching event
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};


// Get event by ID
export const getEventById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM ticketing_events WHERE id = ?', [id]);
    if (rows.length === 0) {
      res.status(404).json({ message: 'Event not found' });
    } else {
      res.json(rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new event
export const createEvent = async (req, res) => {
  const { name, description, date, time, location, category_id, type_id, status, image_url, is_premium } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO ticketing_events (name, description, date, time, location, category_id, type_id, status, image_url, is_premium) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description, date, time, location, category_id, type_id, status, image_url, is_premium]
    );
    res.json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an event
export const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { name, description, date, time, location, category_id, type_id, status, image_url, is_premium } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE ticketing_events SET name = ?, description = ?, date = ?, time = ?, location = ?, category_id = ?, type_id = ?, status = ?, image_url = ?, is_premium = ? WHERE id = ?',
      [name, description, date, time, location, category_id, type_id, status, image_url, is_premium, id]
    );
    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an event
export const deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM ticketing_events WHERE id = ?', [id]);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

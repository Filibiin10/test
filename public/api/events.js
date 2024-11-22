// src/api/eventsApi.js
export const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      return response.json();
    } catch (error) {
      console.error("Failed to fetch events:", error);
      return [];
    }
  };
  
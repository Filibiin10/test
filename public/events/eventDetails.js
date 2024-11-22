// Function to extract UUID from the URL when navigating to the categories page
function getUUIDFromUrlParams() {
    const path = window.location.pathname; // Get the current URL path
    const matches = path.match(/\/events\/([a-f0-9\-]+)\/event-details\.html/); // Regex to match UUID pattern
  
    
    if (matches) {
      return matches[1]; // Return the UUID part from the path
    }
    return null; // Return null if the UUID is not found
  }
  

document.addEventListener("DOMContentLoaded", () => {
    // Get the eventId from the URL
    const eventId = getUUIDFromUrlParams();

    console.log(eventId)

    // Check if the event_id exists in the URL
    if (!eventId) {
        console.error('Event ID is missing from the URL');
        // Handle the error, maybe redirect back to the events page
        return;
    }

    // Fetch event details using the event_id
    fetch(`/api/ticketingevents/events/${eventId}`)
        .then(response => response.json())
        .then(event => {
            // Convert start_date and end_date to JavaScript Date objects
            const startDate = new Date(event.start_date);
            const endDate = new Date(event.end_date);

            // Function to format date as 'YYYY-MM-DD HH:mm:ss'
            const formatDate = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                
                return `${year}-${month}-${day}`;
            };

            // Update the page with event details
            document.getElementById('titleNominee').textContent = event.event_name;
            document.getElementById('eventImage').src = event.event_image_url || "/assets/img/default-image.jpg";
            document.getElementById('eventDescription').textContent = event.about_event || "Description not available";
            document.getElementById('month').textContent = `${formatDate(startDate)}` || "Description not available";
            document.getElementById('eventStartTime').textContent = `Start: ${formatDate(startDate)} ${event.start_time}` || "Description not available";
            document.getElementById('eventEndTime').textContent = `End: ${formatDate(endDate)} ${event.end_time}` || "Description not available";
            document.getElementById('eventFees').textContent = event.event_type_name;
            document.getElementById('eventCategory').textContent = event.event_category_name || "Category Not Specified";

            // Dynamically set the href attribute for the "Buy Ticket" button
            const ticketButton = document.getElementById('ticket');

            // Check if the ticket button exists before updating the href
            if (ticketButton) {
                ticketButton.href = `/events/${event.event_uuid}/Ticket/ticket.html?id=${event.event_uuid}`;  // Set the correct URL for the event
                
            } else {
                console.error('Ticket button not found');
            }
        })
        .catch(error => {
            console.error('Error fetching event details:', error);
            // Handle the error, maybe display an error message to the user
        });
});

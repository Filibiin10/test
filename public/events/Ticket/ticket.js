function getUUIDFromQueryParams() {
    const urlParams = new URLSearchParams(window.location.search); // Parse the query string
    return urlParams.get('id'); // Get the 'id' parameter
}

// Example usage
const uuid = getUUIDFromQueryParams();
console.log(uuid);

// Format the event date and time
function formatEventDate(startDate, startTime, endDate, endTime) {
    if (!startDate || !startTime || !endDate || !endTime) {
        return "Date not available";
    }

    try {
        // Combine date and time into valid Date objects
        const startDateTime = new Date(`${startDate.slice(0, 10)}T${startTime}`);
        const endDateTime = new Date(`${endDate.slice(0, 10)}T${endTime}`);

        // Check if date objects are valid
        if (isNaN(startDateTime) || isNaN(endDateTime)) {
            throw new Error("Invalid date components");
        }

        // Formatting options
        const options = {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            timeZone: 'GMT',
            timeZoneName: 'short',
        };

        const formatter = new Intl.DateTimeFormat('en-GB', options);
        const formattedStartDate = formatter.format(startDateTime);
        const formattedStartTime = startDateTime.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });

        const formattedEndTime = endDateTime.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });

        return `${formattedStartDate} ${formattedStartTime} - ${formattedEndTime} GMT`;
    } catch (error) {
        console.error("Error formatting date:", error);
        return "Invalid date format";
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const apiUrlEvent = "/api/ticketingevents/events";
    const apiUrlTicket = "/api/ticket";
    const eventUuid = getUUIDFromQueryParams();

    // Fetch event details
    async function fetchEventDetails(uuid) {
        try {
            const response = await fetch(`${apiUrlEvent}/${uuid}`);
            if (!response.ok) {
                throw new Error("Failed to fetch event details");
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching event details:", error);
        }
    }

    // Fetch ticket details
    async function fetchTicketDetails(eventUuid) {
        try {
            const response = await fetch(`${apiUrlTicket}?event_id=${eventUuid}`);
            if (!response.ok) {
                throw new Error("Failed to fetch ticket details");
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching ticket details:", error);
        }
    }

    // Fetch data from both APIs
    const eventDetails = await fetchEventDetails(eventUuid);
    const ticketDetails = await fetchTicketDetails(eventUuid);

    if (eventDetails && ticketDetails && Array.isArray(ticketDetails)) {
        const { event_name, event_image_url, start_date, start_time, end_date, end_time, details } = eventDetails;

        // Populate event details
        document.getElementById("eventName").textContent = event_name || "N/A";
        document.getElementById("eventImage").src = event_image_url || "default-image.jpg";

        // Format and display event date
        document.getElementById("eventDate").textContent = formatEventDate(start_date, start_time, end_date, end_time) || "Date not available";
        // document.getElementById("salesEndDate").textContent = `Sales end on ${new Date(end_date).toLocaleDateString()}`;

        // Select the container where the ticket cards will be inserted
        const ticketCardsContainer = document.getElementById("ticketCardsContainer");

        // For each ticket, create a new .qnty-card and populate it
        ticketDetails.forEach(ticket => {
            const { quantity_available, discount, note, ticket_type, details, price, end_date } = ticket;

            // Create a new ticket card
            const newTicketCard = document.createElement("div");
            newTicketCard.classList.add("qnty-card");

            // Populate ticket information
            const validPrice = typeof price === 'number' && !isNaN(price) ? price : 0;

            newTicketCard.innerHTML = `
                <div class="qnty-num">
                    <h2 id="ticketType">${ticket_type} Ticket</h2>
                    <div class="quantity">
                        <button class="decrement" id="decrementBtn">-</button>
                        <input type="number" id="quantityInput" value="1" min="1">
                        <button class="increment" id="incrementBtn">+</button>
                    </div>
                </div>
                <div class="qnty-price">
                    <span id="nofee">$${validPrice.toFixed(2)}</span>
                    <span id="fee">+${(validPrice * 0.1).toFixed(2)} Fee</span>
                    <p id="salesEndDate" class="end-date">Sales end on ${new Date(end_date).toLocaleDateString()}</p>
                    <p id="detail" class="detail">${details || "No additional details available"}</p>
                    <p id="note" class="note">${note || "No special notes."}</p>
                </div>
            `;

            // Append the new ticket card to the container
            ticketCardsContainer.appendChild(newTicketCard);
        });
        
    } else {
        alert("Event or ticket details not found");
    }
});

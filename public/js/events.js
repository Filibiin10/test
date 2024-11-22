async function fetchCategories() {
  try {
    const response = await fetch("http://localhost:7000/api/event/categories");
    if (!response.ok)
      throw new Error(`Network response was not ok: ${response.statusText}`);

    const categories = await response.json();
    console.log("Fetched categories:", categories); // Debug log

    if (Array.isArray(categories)) {
      populateCategorySelect(categories);
    } else {
      console.error("Invalid category data format:", categories);
    }
  } catch (error) {
    console.error("Failed to fetch categories:", error);
  }
}

function populateCategorySelect(categories) {
  console.log("Populating categories:", categories); // Debug log

  const categorySelect = document.getElementById("category");

  // Clear existing options except the "All" option
  categorySelect.innerHTML = '<option value="All">All</option>';

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id; // Ensure category.id exists and is the correct field
    option.textContent = category.name || "Unnamed Category"; // Ensure category.name exists
    categorySelect.appendChild(option);
  });
}


// Fetch events and display them (same as before)
async function fetchEvents() {
  try {
    const response = await fetch(
      "http://localhost:7000/api/ticketingevents/typeevnt"
    );
    if (!response.ok) throw new Error("Network response was not ok");
    const events = await response.json();
    console.log(events);
    displayEvents(events); // Display all events initially
  } catch (error) {
    console.error("Failed to fetch events:", error);
  }
}

function encodeId(id) {
  const base64Id = btoa(id.toString()); // Encode ID to base64
  const randomSuffix = Math.random().toString(36).substring(2, 60); // Generate random 6-character suffix
  const encodedId = `${base64Id}-${randomSuffix}`; // Combine base64 and random suffix
  return encodedId;
}
function displayEvents(events) {
  const eventListContainer = document.getElementById("eventList");
  eventListContainer.innerHTML = ""; // Clear previous content

  events.forEach((event) => {
   

    // Destructure event data
    const {
      event_image_url,
      event_name,
      event_description,
      event_location,
      start_date,
      start_time,
      event_category_name,
      is_premium,
      event_type_name,
      event_id,
      event_uuid
    } = event;

 // Encode event_id for use in URLs
    const encodedEventId = encodeId( event_id );

    // Format the date
    const beginDate = new Date(start_date).toLocaleDateString();

    // Remove spaces from event_name (or use another method if needed, e.g., replace with underscores)
    const formattedEventName = event_name.replace(/\s+/g, "");

    // Build the event HTML
    const eventHtml = `
      <div class="eventGrid col-3 ${is_premium ? "premium-event" : ""}">
        <div class="eventThumb">
          <img src="${
            event_image_url || "assets/img/default-image.jpg"
          }" alt="${event_image_url}">
          <div class="eventType">${event_type_name || "TBA"}</div>
          <!-- Add the event_category_name at the bottom of the image -->
          <div class="eventCategory">${
            event_category_name || "Category Not Specified"
          }</div>
        </div>
        <div class="eventDetail">
          <h4>${event_name}</h4>
          <p>${event_description || "No Description Available"}</p>
          <p class="eventInfo date-info">
            <span class="event-date"><i class="fas fa-calendar-alt"></i> From: ${beginDate}</span>
            <span class="event-time"><i class="fas fa-clock"></i> ${
              start_time || "Time Not Specified"
            }</span>
          </p>
          <p class="eventInfo" style="color: red;">
            <i class="fas fa-map-marker-alt"></i> ${
              event_location || "Location Not Specified"
            }
          </p>
          <!-- Pass the formatted event_name and event_id in the URL -->
          <a href="/events/${event_uuid}/event-details.html" class="btn view-event-btn">Interested</a>

          <button class="btn share-btn">Share</button>
        </div>
      </div>
    `;

    // Append the HTML to the event list container
    eventListContainer.insertAdjacentHTML("beforeend", eventHtml);
  });
}

async function filterEvents() {
  const category = document.getElementById("category").value;
  const dateFrom = document.getElementById("dateFrom").value;
  const dateTo = document.getElementById("dateTo").value;

  console.log("Selected Category:", category); // Debug log for selected category

  try {
    const response = await fetch(
      "http://localhost:7000/api/ticketingevents/typeevnt"
    );
    if (!response.ok) throw new Error("Network response was not ok");
    const events = await response.json();

    let filteredEvents = events;

    // Ensure category is compared correctly
    if (category && category !== "All") {
      console.log("Filtering by category:", category); // Debug log for filtering by category
      filteredEvents = filteredEvents.filter((event) => {
        console.log(
          "Event Category ID:",
          event.event_category_id,
          typeof event.event_category_id
        ); // Log event category ID type and value
        return String(event.event_category_id) === String(category); // Compare as strings
      });
    }

    // Filter by date range
    if (dateFrom) {
      filteredEvents = filteredEvents.filter(
        (event) => new Date(event.start_date) >= new Date(dateFrom)
      );
    }

    if (dateTo) {
      filteredEvents = filteredEvents.filter(
        (event) => new Date(event.start_date) <= new Date(dateTo)
      );
    }

    displayEvents(filteredEvents); // Display filtered events
    console.log("Filtered events:", filteredEvents); // Debug log for filtered events
  } catch (error) {
    console.error("Failed to filter events:", error);
  }
}


// Event listeners (same as before)
document.getElementById("filterBtn").addEventListener("click", filterEvents);

// Initial fetch on page load to display all events and categories
document.addEventListener("DOMContentLoaded", () => {
  fetchEvents(); // Fetch events
  fetchCategories(); // Fetch categories
});

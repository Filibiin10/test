 const url = new URL(window.location.href);

// Extract the 'id' parameter
const id = url.searchParams.get("id");

console.log("id url",id);



// Function to show skeleton loaders while fetching data
function showSkeletons() {
    const container = document.getElementById('nomineesContainer');
    container.innerHTML = ""; // Clear any existing content
    
    // Display skeleton loaders (create 6 skeleton placeholders)
    for (let i = 0; i < 6; i++) {
        const skeletonHTML = `
        <div class="col-xl-3 col-lg-4 col-md-6 mt-4">
            <div class="skeleton-category shadow-sm">
                <div class="skeleton-image"></div>
                <div class="skeleton-title"></div>
                <div class="skeleton-nominee-count"></div>
                <div class="skeleton-button"></div>
            </div>
        </div>
        `;
        container.insertAdjacentHTML("beforeend", skeletonHTML);
    }
}

// Fetch nominees from the API based on category ID
async function fetchNominees(categoryId) {
    showSkeletons();
    try {
        const response = await fetch(`/api/nominee/${categoryId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const nominees = await response.json(); // JSON array of nominees
        return nominees; 
    } catch (error) {
        console.error('Error fetching nominees:', error);
        return [];
    }
}

let category_event_uuid =''; 

// Fetch events from the API
async function fetchEvents() {
    showSkeletons();
    try {
        const response = await fetch('/api/events');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json(); // JSON array of events
    } catch (error) {
        console.error('Error fetching events:', error);
        return [];
    }
}

// Fetch category data from the API
async function fetchCategory(categoryId) {
    showSkeletons();
    try {
        const response = await fetch(`/api/categories/nominee/${categoryId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const category = await response.json(); // Single category object
        return category
    } catch (error) {
        console.error('Error fetching category:', error);
        return null;
    }
}



// Render nominees in the DOM
function renderNominees(nominees, events, category) {
    const nomineesContainer = document.getElementById('nomineesContainer');
    const titleNominee = document.getElementById('titleNominee');
    nomineesContainer.innerHTML = ''; // Clear previous content

    if (nominees.length === 0) {
        nomineesContainer.innerHTML = `<p>No nominees found for this category.</p>`;
        return;
    }

    nominees.forEach(nominee => {

        const event = events.find(event => event.id === nominee.event_id); // Match event for nominee
        const nomineeHTML = createNomineeCard(nominee, category);
        nomineesContainer.insertAdjacentHTML('beforeend', nomineeHTML);
    });

    if (category) {
        titleNominee.textContent = `${category.name} - Nominees`; // Update title with category name
    }
}

// Create HTML structure for a nominee card
function createNomineeCard(nominee, category) {
    return `
    <div class="col-xl-3 col-lg-3 col-md-5">
        <div class="votingGrid shadow-sm">
            <div class="votingThumb">
                <img src="${nominee.image_url}" class="img-fluid" alt="${nominee.name}" />
            </div>
            <div class="votingDetail">
                <div class="detailHead">
                    <h6 class="votingTitle" style="font-size: 18px; text-align: center;">${nominee.name}</h6>
                </div>
                <div style="display: flex; justify-content: center">
                    <h6>${nominee.nominee_code}</h6>
                </div>
                <div class="votingButton">
                    <a href="/competitions/${category.event_uuid}/vote.html?Nom=${nominee.nominee_code}" class="btn voting-btn">Vote</a>
                </div>
            </div>
        </div>
    </div>
    `;
}

// Filter nominees by search input
function filterNominees(searchTerm, nominees, events, category) {
    const filteredNominees = nominees.filter(nominee =>
        nominee.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    renderNominees(filteredNominees, events, category);
}

// Initialize nominees display and search functionality
async function initNominees() {
    const categoryId = id;
    console.log(categoryId)


    if (!categoryId) {
        console.error("No category ID available.");
        return;
    }

    const [nominees, events, category] = await Promise.all([
        fetchNominees(categoryId),
        fetchEvents(),
        fetchCategory(categoryId)
    ]);

    if (!category) {
        console.error('Category not found.');
        return;
    }

    renderNominees(nominees, events, category);

    let debounceTimer;
    const searchInput = document.getElementById('searchInput'); // Ensure the input field is correctly selected
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                filterNominees(searchInput.value, nominees, events, category);
            }, 300); // Adjust delay as needed
        });
    } else {
        console.error('Search input not found.');
    }
}

// Execute when the page loads
document.addEventListener('DOMContentLoaded', initNominees);

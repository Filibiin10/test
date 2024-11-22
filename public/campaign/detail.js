function getUUIDFromUrlParams() {
    const path = window.location.pathname; // Get the current URL path
    const matches = path.match(/\/campaign\/([a-f0-9\-]+)\/details\.html/); // Regex to match UUID pattern
    return matches ? matches[1] : null; // Return the UUID part or null
}

//log uuid
console.log(getUUIDFromUrlParams());


document.addEventListener('DOMContentLoaded', async () => {
    const fundraiserId = getUUIDFromUrlParams(); // Extract UUID from URL
    if (!fundraiserId) {
        console.error("No UUID found in the URL.");
        return;
    }

    try {
        // Fetch fundraiser data using the extracted fundraiserId
        const response = await fetch(`/api/fundraiser/${fundraiserId}`);
        if (!response.ok) throw new Error("Failed to fetch fundraiser data.");

        const data = await response.json();

        // Update main details
        document.querySelector('.campaign-image img').src = data.image_url;
        document.querySelector('.campaign-details h2').textContent = data.title;
        document.querySelector('.campaign-details p').textContent = data.description;

        // Update donation stats
        document.querySelector('.donation-stats h2').textContent = `GH₵ ${data.raised_amount.toFixed(2)} Raised`;
        document.querySelector('.progress').style.width = `${(data.raised_amount / data.goal_amount) * 100}%`;
        document.querySelector('.progresss').style.width = `${(data.raised_amount / data.goal_amount) * 100}%`;
        document.querySelector('.stats-details').innerHTML = `
            <span>GH₵ ${data.goal_amount.toFixed(2)} goal</span>
            <span>670 donations</span>
        `;

        // Update organizer details
        document.querySelector('.organizer-avatar img').src = data.organizer_image_url;
        document.querySelector('.organizer-name p').textContent = data.organizer_name;

        // Update dynamic Donate button based on campaign status
        const donateBtn = document.getElementById('dynamic-donate-btn');
        if (!data.is_active) {
            donateBtn.href = `/campaign/${fundraiserId}/D/donate-page.html?id=${fundraiserId}`;
            donateBtn.textContent = "Donate Now";
            donateBtn.classList.remove('disabled'); // Remove disabled class if active
        } else {
            donateBtn.href = "#";
            donateBtn.textContent = "Campaign Ended";
            donateBtn.classList.add('disabled'); // Add a disabled class for styling
            donateBtn.addEventListener('click', function (e) {
                e.preventDefault(); // Prevent default action if the campaign is ended
            });
        }

        // Update comments
        const commentsContainer = document.querySelector('.comments-container');
        const commentCount = document.getElementById('comment-count');
        if (data.comments && data.comments.length > 0) {
            commentCount.textContent = data.comments.length;
            data.comments.forEach(comment => {
                const commentBox = `
                    <div class="comment-box">
                        <img src="${comment.avatar_url}" alt="Commenter avatar"/>
                        <div class="comment-des">
                            <h3>${comment.name}</h3>
                            <p>${comment.amount} - ${comment.time}</p>
                            <span>${comment.message}</span>
                        </div>
                    </div>
                `;
                commentsContainer.innerHTML += commentBox;
            });
        }

    } catch (error) {
        console.error("Error fetching fundraiser data:", error);
    }
});

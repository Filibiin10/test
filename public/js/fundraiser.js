document.addEventListener("DOMContentLoaded", () => {
    const apiEndpoint = "/api/fundraiser"; // Replace with your actual API URL
    const fundraiserContainer = document.getElementById("fundraiser-cards");

    // Fetch data from the API
    fetch(apiEndpoint)
        .then((response) => {
            if (!response.ok) {
                console.log("eror")
                throw new Error("Failed to fetch data");
            }
            console.log("fethced")
            return response.json();
        })
        .then((data) => {
            // Generate HTML for each fundraiser
            data.forEach((fundraiser) => {
                const date = new Date(fundraiser.end_date);

// Format the date as YYYY-MM-DD
                const formattedDate = date.toISOString().split('T')[0];
                const card = `
                    <div class="col-xl-4 col-lg-4 col-md-6">
                        <div class="donationGrid shadow-sm">
                            <div class="donationThumb">
                                <img src="${fundraiser.image_url}" class="img-fluid" alt="${fundraiser.title}">
                                <div class="publishedDate"><span class="date">${formattedDate}</span></div>
                            </div>
                            <div class="donationDetail">
                                <div class="detailHead">
                                    <h4 class="donationTitle">${fundraiser.title}</h4>
                                </div>
                                <div class="donationRaised">
                                    <div class="progress" role="progressbar" aria-valuenow="${fundraiser.description}" aria-valuemin="0" aria-valuemax="100">
                                        <div class="progress-bar" style="width: ${fundraiser.raised_amount / fundraiser.goal_amount * 100}%"></div>
                                    </div>
                                    <div class="raisedInfo">
                                        <div class="raisedwrap">Raised:<span class="raised">${fundraiser.raised_amount	}</span></div>
                                        <div class="goalwrap">Goal:<span class="goal">${fundraiser.goal_amount}</span></div>
                                    </div>
                                </div>
                                <div class="donateButton">
                                    <a href="/campaign/${fundraiser.uuid}/details.html" class="btn donate-btn">Donate Now</a>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                // Append the card to the container
                fundraiserContainer.innerHTML += card;
            });
        })
        .catch((error) => {
            console.error("Error fetching fundraiser data:", error);
        });
});

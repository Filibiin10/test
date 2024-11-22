document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch fundraiser data
        const response = await fetch('/api/fundraiser');
        if (!response.ok) throw new Error("Failed to fetch fundraiser data.");

        const data = await response.json(); // The response is an array of objects

        // Check if the array has any items, then access the first object
        if (data.length > 0) {
            const fundraiser = data[0]; // Access the first object in the array

            // Find the <span> element where you want to display the title and description
            const titleSpan = document.getElementById('title');
            const descriptionSpan = document.getElementById('description');
            const imageElement = document.getElementById('campaign-image'); // Make sure this element exists
            const fundraiserId = document.getElementById('fundraiserId')  // Set the text content of the <h6> element


            if (titleSpan) {
                titleSpan.textContent = fundraiser.title || 'Title not available'; // Fallback if title is not present
                fundraiserId.textContent = fundraiser.uuid	; // Set the text content of the <h6> element
            }

            if (descriptionSpan) {
                descriptionSpan.textContent = fundraiser.description || 'Description not available';
            }

            if (imageElement) {
                imageElement.src = fundraiser.image_url || '/default-image.jpg'; // Fallback image
            }
        } else {
            console.error("No fundraiser data found.");
        }
    } catch (error) {
        console.error("Error fetching fundraiser data:", error);
    }
});

// Add event listeners to donation buttons
const donationButtons = document.querySelectorAll('.amount-btn');
const amountInput = document.querySelector('.amount-input');
const donationValue = document.querySelector('.donation-value');
const tipValue = document.querySelector('.tip-value');
const totalValue = document.querySelector('.total-value');

// Define a tip percentage
const tipPercentage = 0.06;

donationButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove '¢' and commas, then parse the number
        const donationAmount = parseFloat(button.textContent.replace('¢', '').replace(/,/g, '').trim()) || 0;

        // Update the input field and donation value
        amountInput.value = donationAmount.toFixed(2);
        donationValue.textContent = `¢${donationAmount.toLocaleString()}`; // Format with commas

        // Calculate the tip and total donation
        const tipAmount = donationAmount * tipPercentage;
        const totalDonation = donationAmount + tipAmount;

        // Update the tip and total values with commas
        tipValue.textContent = `¢${tipAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
        totalValue.textContent = `¢${totalDonation.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    });
});

const generateTransactionReference = () => {
    return `txn_${new Date().getTime()}_${Math.floor(Math.random() * 1000)}`;
};

// Payment Function
async function initializePaystackPayment(email, amount, phoneNumber, message, fundraiserId,donarName,title) {
    try {
        // Send request to initialize the payment
        const response = await fetch('/api/paystack/initialize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                amount,
                fundraiser_id: fundraiserId,
                phone_number: phoneNumber,
                message: message
            })
        });

        const data = await response.json();

        // Check if the Paystack initialization was successful
        if (data.status === 'success' && data.data.authorization_url) {
            // Initialize PaystackPop and pass the necessary parameters for the transaction
            const paystack = new PaystackPop();
            const transactionReference = generateTransactionReference();

            paystack.newTransaction({
                key: 'pk_live_00ee5f93736c7dfb2361ce3c8a7e84fc4b49bf6b', // Replace with your Paystack public key
                email: email,
                amount: amount * 0.01, // Convert to kobo (1 GHS = 100 kobo)
                currency: 'GHS', // Adjust based on your currency (e.g., 'NGN', 'USD')
                ref: transactionReference, // The transaction reference returned by the backend
                callback: async function(response) {
                    console.log("Payment successful:", response);

                    // After successful payment, store the transaction details and handle any required follow-up actions
                    createDonation(
                        donarName,
                        email,
                        phoneNumber,
                        message,
                        amount,
                        fundraiserId
                    )
                    await sendConfirmation(
                        phoneNumber,
                        amount,
                        title
                    )

                    // Show SweetAlert for success
                    Swal.fire({
                        title: 'Payment Successful!',
                        text: `Thank you for supporting the fundraiser.`,
                        icon: 'success',
                        confirmButtonText: 'Close'
                    });
                },
                onClose: function() {
                    console.log("Payment modal was closed");
                    // Show SweetAlert for cancellation
                    Swal.fire({
                        title: 'Payment Cancelled',
                        text: 'You have cancelled the payment.',
                        icon: 'info',
                        confirmButtonText: 'Close'
                    });
                }
            });
        } else {
            sendFailed(
                phoneNumber,
                title
            )
            // Show SweetAlert for failure in initialization
            Swal.fire({
                title: 'Payment Initialization Failed',
                text: 'Something went wrong while initializing the payment.',
                icon: 'error',
                confirmButtonText: 'Close'
            });
        }
    } catch (error) {
        console.error('Error initializing Paystack payment:', error);
        sendFailed(
            phoneNumber,
            title
        )
        // Show SweetAlert for error
        Swal.fire({
            title: 'Payment Error',
            text: 'There was an error initializing the payment process. Please try again.',
            icon: 'error',
            confirmButtonText: 'Close'
        });
    }
}

const createDonation = async (email,donarName,phoneNumber,message,amount,fundraiserId) => {
    console.log(fundraiserId)
    // Prepare the transaction data dynamically
    const DonationData = {
        fundraiser_id: fundraiserId,           // Dynamic event ID
        donor_email: email,       // Dynamic nominee ID
        donor_name: donarName,
        amount : amount,              // Dynamic amount
        channel: 'Mobile Money',  // Static for now, you can adjust if needed
        message: message,              // Dynamic status (success or failure)
        donor_phone  : phoneNumber    // Dynamic transaction reference
    };

    try {
        // Make a request to create the transaction in the database
        const response = await fetch('http://localhost:7000/api/donations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(DonationData) // Send the transaction data dynamically
        });

        const data = await response.json();  // Parse the response into JSON
        if (response.status === 201) {
            console.log('Donation created:', data);
        } else {
            console.error('Error creating Donation:', data);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}



const sendSMS = async (phoneNumber, message) => {
    try {
        const response = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': 'ZlZzZ1Z6UmROZ0dDVWpHaUdMck0' // Replace with your API key
            },
            body: JSON.stringify({
                sender: 'Xtocast',
                message: message,
                recipients: [phoneNumber]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'SMS sending failed');
        }

        const data = await response.json();
        console.log('SMS Sent:', data); // For debugging, remove in production
        return data;
    } catch (error) {
        console.error('SMS Error:', error.message);
        throw new Error('SMS sending failed');
    }
};


const sendConfirmation = async (phoneNumber, amount, fundraiserName) => {
    // Construct the message using only the amount and fundraiser name
    const message = `Congratulations! You have successfully donated ${amount}  to the fundraiser: ${fundraiserName}. Thank you for your support!`;

    // Log the message for debugging
    console.log(message);

    // Send the SMS using the sendSMS function (assuming it's defined elsewhere)
    return sendSMS(phoneNumber, message);
};

// Send failure SMS if payment fails or is canceled
const sendFailed = async (phoneNumber, fundraiserName) => {
    const message = `We're sorry, your vote attempt for ${fundraiserName} was unsuccessful. Please try again.`;
    console.log(message);
    return sendSMS(phoneNumber, message);
};


// Handle the "Pay" button click
document.querySelector('.pay-btn').addEventListener('click', () => {
    const title = document.querySelector('#title').value;
    const donarName = document.querySelector('#name').value;
    const email = document.querySelector('#email').value;
    const phoneNumber = document.querySelector('#phone').value;
    const amount = parseFloat(document.querySelector('.amount-input').value.replace(/,/g, ''));
    const message = document.querySelector('#message').value || 'Thank you for your donation';
    const fundraiserId = document.getElementById('fundraiserId').textContent.trim();

    // Initialize the payment with Paystack
    initializePaystackPayment(email, amount, phoneNumber, message, fundraiserId,donarName,title);
  

});

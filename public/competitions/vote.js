async function initializePaystackPayment(email, amount, phoneNumber, numberOfVotes, nomineeName, eventId, nomineeId) {
    try {
        // Send request to initialize the payment
        const response = await fetch('/api/paystack/initialize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, amount })
        });

        const data = await response.json();
        
        // Check if the Paystack initialization was successful
        if (data.status === 'success' && data.data.authorization_url) {
            // Initialize PaystackPop and pass the necessary parameters for the transaction
            const paystack = new PaystackPop();

            paystack.newTransaction({
                key: 'pk_live_a5024fab51c24752d4e25245b7e6099a8ee359cb',
                // key: 'pk_live_00ee5f93736c7dfb2361ce3c8a7e84fc4b49bf6b', // Replace with your Paystack public key
                 // Replace with your Paystack public key
                email: email,
                amount: amount * 100, // Convert to kobo (1 GHS = 100 kobo)
                currency: 'GHS', // Adjust based on your currency (e.g., 'NGN', 'USD')
                ref: data.data.reference, // The transaction reference returned by the backend
                callback: async function(response) {
                    console.log("Payment successful:", response);
                    console.log("data " , data);
                    // Send confirmation SMS after successful payment
                    await sendConfirmation(phoneNumber, numberOfVotes, nomineeName, eventId);

                    // After a successful payment, pass the payment response to create the transaction
                    await createTransaction(eventId, nomineeId, amount, 'success', response.trxref);
                    createVote()

                    // Show SweetAlert for success
                    Swal.fire({
                        title: 'Payment Successful!',
                        text: `Thank you for voting for ${nomineeName}`,
                        icon: 'success',
                        confirmButtonText: 'Close'
                    });
                },
                onClose: function() {
                    console.log("Payment modal was closed");
                    // Send failure SMS if payment is canceled
                    sendFailed(phoneNumber, nomineeName, eventId);

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
            // Send failure SMS if Paystack initialization fails
            sendFailed(phoneNumber, nomineeName, eventId);

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
        // Send failure SMS if there is an error during payment initialization
        sendFailed(phoneNumber, nomineeName, eventId);

        // Show SweetAlert for error
        Swal.fire({
            title: 'Payment Error',
            text: 'There was an error initializing the payment process. Please try again.',
            icon: 'error',
            confirmButtonText: 'Close'
        });
    }
}

function payWithPaystack(email, amount, phoneNumber, numberOfVotes, nomineeName, eventId, nomineeId) {
    var handler = PaystackPop.setup({
        key: 'pk_live_a5024fab51c24752d4e25245b7e6099a8ee359cb', // Replace with your Paystack public key
        email: email,
        amount: amount * 100, // Convert to kobo
        currency: "GHS",
        ref: 'TS' + Math.floor((Math.random() * 1000000000) + 1), // Generate unique reference
        metadata: {
            custom_fields: [
                {
                    display_name: "Phone Number",
                    variable_name: "phone",
                    value: phoneNumber
                },
                {
                    display_name: "Message",
                    variable_name: "message",
                    value: document.getElementById('message').value
                }
            ]
        },
        callback: function(response) {
            alert('Success. Transaction ref is ' + response.reference);
            
            // Send Thank You SMS after successful payment
            // sendThankYouSMS(, document.getElementById('name').value);
            
            // Perform any success operations here
        },
        onClose: function() {
            alert('Donation cancelled.');
        }
    });
    handler.openIframe();
}


window.onload = function() {
    if (typeof paypal !== 'undefined') {
      paypal.Buttons({
        createOrder: function(data, actions) {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: '10.00' // Replace with your dynamic value
              }
            }]
          });
        },
        onApprove: function(data, actions) {
          return actions.order.capture().then(function(details) {
            alert('Transaction completed by ' + details.payer.name.given_name);
          });
        }
      }).render('#paypal-button-container');
    } else {
      console.log("PayPal SDK is not loaded correctly.");
    }
  };

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


// Function to create a transaction dynamically
const createTransaction = async (eventId, nomineeId, amount, status, transactionRef) => {
    // Prepare the transaction data dynamically
    const transactionData = {
        event_id: eventId,           // Dynamic event ID
        nominee_id: nomineeId,       // Dynamic nominee ID
        transaction_date: new Date().toISOString(),  // Current date and time
        amount: amount,              // Dynamic amount
        channel: 'Mobile Money',  // Static for now, you can adjust if needed
        status: status,              // Dynamic status (success or failure)
        Reference  : transactionRef    // Dynamic transaction reference
    };

    try {
        // Make a request to create the transaction in the database
        const response = await fetch('http://localhost:7000/api/transaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transactionData) // Send the transaction data dynamically
        });

        const data = await response.json();  // Parse the response into JSON
        if (response.status === 201) {
            console.log('Transaction created:', data);
        } else {
            console.error('Error creating transaction:', data);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}




// Send confirmation SMS after successful payment
const sendConfirmation = async (phoneNumber, numberOfVotes, nomineeName, eventName) => {
    const message = `Congratulations! You have successfully casted ${numberOfVotes} vote(s) for ${nomineeName} in the ${eventName}. Thanks for voting.`;
    console.log(message);
    return sendSMS(phoneNumber, message);
};

// Send failure SMS if payment fails or is canceled
const sendFailed = async (phoneNumber, nomineeName, eventName) => {
    const message = `We're sorry, your vote attempt for ${nomineeName} in the ${eventName} was unsuccessful. Please try again.`;
    console.log(message);
    return sendSMS(phoneNumber, message);
};

// Event listener to initialize Paystack payment on button click

document.getElementById('submitButton').addEventListener('click', async () => {
    const submitButton = document.getElementById('submitButton');
    submitButton.disabled = true; // Disable button to prevent multiple submissions

    const email = document.getElementById('emailAddress').value;
    const amount = parseFloat(document.getElementById('amountToPay').textContent.replace('GHS', '').trim());
    const phoneNumber = document.getElementById('phoneNumberInput').value.trim();
    const numberOfVotes = parseInt(document.getElementById('voteCount').value) || 0;
    const nomineeName = document.getElementById('nomineeName').textContent.trim();
    const eventId = document.getElementById('eventId').textContent.trim();
    const nomineeId = document.getElementById('nomineeId').textContent.trim();

    // Basic validation
    if (!email || isNaN(amount) || !phoneNumber || amount <= 0 || !nomineeName || !eventId) {
        alert('Please complete all required fields.');
        submitButton.disabled = false; // Re-enable button on error
        return;
    }

    try {
        // await initializePaystackPayment(email, amount, phoneNumber, numberOfVotes, nomineeName, eventId, nomineeId);
        payWithPaystack(email, amount, phoneNumber)
    } catch (error) {
        console.error('Error during payment initialization:', error);
    } finally {
        submitButton.disabled = false; // Re-enable button after process completes
    }
});



// Function to set a message in the UI
function setMessage(message) {
    const messageElement = document.getElementById('message');
    if (messageElement) {
        messageElement.textContent = message;
    }
}

// Fetch nominee data from the API
async function fetchNomineeData(nomineeId) {
    try {
        const response = await fetch(`/api/nominees/${nomineeId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch nominee data: ${response.status}`);
        }
        const nominee = await response.json();

        // Fetch the category name based on the nominee's category ID
        const categoryName = await fetchCategoryName(nominee.category_uuid);

        // Update nominee details with the category name
        updateNomineeDetails(nominee, categoryName);
    } catch (error) {
        console.error(error);
    }
}

// Fetch category name by ID
async function fetchCategoryName(categoryId) {
    try {
        const response = await fetch(`/api/categories/vote/${categoryId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch category data: ${response.status}`);
        }
        const category = await response.json();
        return category;  // Return the category object
    } catch (error) {
        console.error(error);
        return null; // Return null in case of error
    }
}

// Frontend function to create a vote
async function createVote() {
    const nomineeId = document.getElementById('nomineeId').textContent; 
    const phoneNumber = document.getElementById('phoneNumberInput').value;
    const eventId = document.getElementById('eventId').textContent;
    const voteCount = parseInt(document.getElementById('voteCount').value); // Get votes count from an input field

    if ( !phoneNumber || !voteCount) {
        console.error('Required fields are missing');
        return;
    }
    console.log(phoneNumber)
    try {
        const response = await fetch(`/api/votes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nomineeId: nomineeId,
                phoneNumber: phoneNumber,
                numberOfVotes: voteCount,
                amountPaid: voteCount * 1, // Assuming each vote costs 100 units
                eventId: eventId
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create vote');
        }

        const data = await response.json();
        console.log('Vote created:', data);

    } catch (error) {
        console.error('Error submitting vote:', error);
    }
}


// createVote()



// Update nominee details in the DOM
function updateNomineeDetails(nominee, category) {
    if (!nominee || !category) return;  // Handle null or undefined nominee and category

    document.getElementById('nomineeImage').src = nominee.image_url;
    document.getElementById('nomineeName').textContent = nominee.name;
    document.getElementById('nomineeCategory').textContent = category.name;  // Use category name
    document.getElementById('nomineeCode').textContent = nominee.nominee_code;
    document.getElementById('nomineeNameLabel').textContent = nominee.name;
    document.getElementById('eventId').textContent = category.event_id;  // Set the text content of the <h6> element
document.getElementById('nomineeId').textContent = nominee.id;  // Set the text content of the <span> inside <h6>

}

// Calculate the amount to pay based on vote count
function updateAmountToPay() {
    const voteCount = parseInt(document.getElementById('voteCount').value) || 0;
    const amount = voteCount * 1; // Assuming GHS 1 per vote
    document.getElementById('amountToPay').textContent = `GHS ${amount}`;
}

document.getElementById('voteCount').addEventListener('input', updateAmountToPay);

// const url = new URL(window.location.href);

// // Extract the 'id' parameter
// const id = url.searchParams.get("Nom");

// console.log("id url",id);

const url = new URL(window.location.href);

// Extract the 'Nom' query parameter from the URL
const nomineeCode = url.searchParams.get('Nom');

console.log(nomineeCode);


// const eventId = getDecodedIdFromUrl()
//   console.log(eventId)
// Execute when the page loads
window.onload = function() {
    if (nomineeCode) {
            fetchNomineeData(nomineeCode); // Fetch nominee data using the decoded ID
    }
};

const categorySelect = document.getElementById('category');


categorySelect.innerHTML = '<option value="All">All</option>';

async function fetchcategory () {
         fetch(`/api/categories`)
        .then(response => response.json())
        .then(data => {
            console.log("Fetched:", data);
            data.forEach(category => {
                console.log(category.name)
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name // Use cleaned name or fallback
                categorySelect.appendChild(option);
            });
        })

        
        }


        window.onload = fetchcategory;
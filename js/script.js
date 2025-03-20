document.getElementById('scrapeButton').addEventListener('click', async () => {
    const maxRetries = 5; // Maximum number of retries
    const retryDelay = 2000; // Delay between retries in milliseconds


    const urlInput = document.getElementById('urlInput').value;
    const urls = urlInput.split('\n').map(url => url.trim()).filter(url => url);
    const emailSet = new Set();

    for (const url of urls) {
        try {
            const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
            let response;
            let attempts = 0;

            while (attempts < maxRetries) {
                try {
                    response = await fetch(proxyUrl + url);
                    if (response.ok) break; // Exit loop if fetch is successful
                } catch (error) {
                    console.error(`Attempt ${attempts + 1} failed:`, error.message);
                }
                attempts++;
                await new Promise(resolve => setTimeout(resolve, retryDelay * attempts)); // Exponential backoff

            }


            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}`);
                alert(`Failed to fetch ${url}. Status: ${response.status}`);
                continue; // Skip to the next URL
            }
            const text = await response.text();

            console.log(text); // Log the response text for debugging

            const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/g;

            const emails = text.match(emailRegex) || []; // Ensure emails is always an array

            if (emails) {
                emails.forEach(email => emailSet.add(email));
            }
        } catch (error) {
            console.error(`Error fetching ${url}:`, error.message); // Log only the error message

            alert(`Failed to fetch ${url}. This may be due to CORS restrictions or an invalid URL. Please check and try again.`);
        }
    }

    const emailArray = Array.from(emailSet);
    if (emailArray.length > 0) {
        const csvContent = "data:text/csv;charset=utf-8," + emailArray.join("\n");
        const encodedUri = encodeURI(csvContent);
        const downloadButton = document.getElementById('downloadButton');
        downloadButton.setAttribute("href", encodedUri);
        downloadButton.setAttribute("download", "emails.csv");
        downloadButton.style.display = "block";
    } else {
        alert("No valid emails found.");
    }
});

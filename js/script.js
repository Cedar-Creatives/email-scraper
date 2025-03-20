document.getElementById('scrapeButton').addEventListener('click', async () => {
    const maxRetries = 5; // Maximum number of retries
    const initialRetryDelay = 2000; // Initial delay between retries in milliseconds

    const urlInput = document.getElementById('urlInput').value;
    const urls = urlInput.split('\n').map(url => url.trim()).filter(url => url);
    const emailSet = new Set();
    const statusDisplay = document.getElementById('statusMessage'); // Status display element

    for (const url of urls) {
        let attempts = 0;

        while (attempts < maxRetries) {
            try {
                const proxyUrl = 'https://your-new-cors-proxy.com/'; // Update to a new CORS proxy
                const response = await fetch(proxyUrl + url);

                if (!response.ok) {
                    console.error(`HTTP error! status: ${response.status}`);
                    alert(`Failed to fetch ${url}. Status: ${response.status}`);
                    break; // Exit the retry loop
                }

                const text = await response.text();
                console.log(text); // Log the response text for debugging

                const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/g;

                const emails = text.match(emailRegex) || []; // Ensure emails is always an array

                if (emails) {
                    emails.forEach(email => emailSet.add(email));
                }
                break; // Exit the retry loop if successful
            } catch (error) {
                attempts++;
                console.error(`Error fetching ${url} (attempt ${attempts}):`, error.message); // Log only the error message

                if (attempts >= maxRetries) {
                    alert(`Failed to fetch ${url} after ${maxRetries} attempts. This may be due to CORS restrictions or an invalid URL. Please check and try again.`);
                } else {
                    const retryDelay = initialRetryDelay * Math.pow(2, attempts); // Exponential backoff
                    statusDisplay.innerText = `Retrying ${url} in ${retryDelay / 1000} seconds... (Attempt ${attempts})`;
                    statusDisplay.style.display = 'block'; // Show the status message
                    await new Promise(resolve => setTimeout(resolve, retryDelay)); // Wait before retrying
                }
            }
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

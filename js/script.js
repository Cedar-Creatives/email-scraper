document.getElementById('scrapeButton').addEventListener('click', async () => {
    const urlInput = document.getElementById('urlInput').value;
    const urls = urlInput.split('\n').map(url => url.trim()).filter(url => url);
    const emailSet = new Set();

    for (const url of urls) {
        try {
            const response = await fetch(url);
            const text = await response.text();
            const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
            const emails = text.match(emailRegex);
            if (emails) {
                emails.forEach(email => emailSet.add(email));
            }
        } catch (error) {
            console.error(`Error fetching ${url}:`, error);
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

document.getElementById('uploadForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const fileInput = document.getElementById('fileInput');
    const repoPath = document.getElementById('repoPath').value;
    const commitMessage = document.getElementById('commitMessage').value;
    const statusDiv = document.getElementById('status');
    
    // In a real application, you would get this from a secure server-side endpoint
    // NEVER hardcode or expose your GH_TOKEN in client-side JavaScript
    const GH_TOKEN = 'your_github_token_here'; // This should come from a secure source
    
    const repoOwner = 'deyaaelmasry1';
    const repoName = 'files'; // Your repository name
    
    const file = fileInput.files[0];
    
    if (!file) {
        showStatus('Please select a file', 'error');
        return;
    }
    
    try {
        showStatus('Uploading file...', 'info');
        
        // Read the file as base64
        const fileContent = await readFileAsBase64(file);
        
        // GitHub API URL
        const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${repoPath}`;
        
        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GH_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: commitMessage,
                content: fileContent.split(',')[1], // Remove the data URL prefix
            }),
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showStatus(`File uploaded successfully! <a href="${result.content.html_url}" target="_blank">View file</a>`, 'success');
        } else {
            throw new Error(result.message || 'Failed to upload file');
        }
    } catch (error) {
        showStatus(`Error: ${error.message}`, 'error');
        console.error('Upload error:', error);
    }
});

function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function showStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.innerHTML = message;
    statusDiv.className = type;
}

const express = require('express');
const multer = require('multer');
const axios = require('axios');
require('dotenv').config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Environment variables
const GH_TOKEN = process.env.GH_TOKEN;
const REPO_OWNER = 'deyaaelmasry1';
const REPO_NAME = 'files';

app.use(express.static('public'));

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const { path, commitMessage } = req.body;
        const file = req.file;
        
        if (!file) {
            return res.status(400).json({ error: 'No file provided' });
        }
        
        const fileContent = file.buffer.toString('base64');
        
        const response = await axios.put(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`,
            {
                message: commitMessage,
                content: fileContent,
            },
            {
                headers: {
                    'Authorization': `token ${GH_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
            }
        );
        
        res.json({
            success: true,
            url: response.data.content.html_url,
        });
    } catch (error) {
        console.error('Upload error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

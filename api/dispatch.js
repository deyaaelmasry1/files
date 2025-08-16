// dispatch.js
require("dotenv").config();
const { Octokit } = require("@octokit/rest");
const fs = require("fs");
const path = require("path");

// GitHub settings
const owner = "YOUR_GITHUB_USERNAME";
const repo = "YOUR_REPO_NAME";
const branch = "main"; // branch to push files
const token = process.env.GITHUB_TOKEN; // from GitHub secrets

const octokit = new Octokit({ auth: token });

async function uploadFile(localFilePath, uploadPath) {
  try {
    const content = fs.readFileSync(localFilePath, { encoding: "base64" });

    // create/update file in repo
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: uploadPath, // file path inside repo
      message: `Upload file ${uploadPath}`,
      content,
      branch,
    });

    const fileUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${uploadPath}`;
    console.log("✅ File uploaded successfully:", fileUrl);
    return fileUrl;
  } catch (err) {
    console.error("❌ Error uploading file:", err);
  }
}

// Example usage
(async () => {
  const localFile = path.join(__dirname, "uploads", "example.txt"); // file uploaded from user
  const repoPath = `files/${Date.now()}-example.txt`; // destination path inside repo

  await uploadFile(localFile, repoPath);
})();


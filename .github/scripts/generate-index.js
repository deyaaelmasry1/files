const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
const github = require('@actions/github');
const matter = require('gray-matter');

async function run() {
  try {
    const repo = process.env.REPO;
    const token = process.env.GH_TOKEN;
    const octokit = github.getOctokit(token);

    const postsDir = path.join(process.cwd(), 'posts');
    const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

    let index = '# Blog Index\n\n';

    files.forEach(file => {
      const filePath = path.join(postsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(content);
      const title = data.title || file.replace('.md', '');
      index += `- [${title}](posts/${file})\n`;
    });

    fs.writeFileSync('INDEX.md', index);

    // commit the new index file
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: repo.split('/')[0],
      repo: repo.split('/')[1],
      path: 'INDEX.md',
      message: 'Update index',
      content: Buffer.from(index).toString('base64'),
      sha: await getSha(octokit, repo, 'INDEX.md')
    });

  } catch (error) {
    core.setFailed(error.message);
  }
}

async function getSha(octokit, repo, filePath) {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: repo.split('/')[0],
      repo: repo.split('/')[1],
      path: filePath
    });
    return data.sha;
  } catch (e) {
    return undefined;
  }
}

run();

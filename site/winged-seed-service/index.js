const axios = require("axios");
const { join } = require("path");
const { writeFileSync } = require("fs");

const sourceUrl = 'https://bitbucket.org/!api/2.0/repositories/Ironskin/test-2/src/master/';
const sidebarPath = 'sidebars.auto.js';
const siteDirectory = './';

const pullFromRepo = async () => {
    const repoData = await axios.get(sourceUrl);

    const fileNamesFromRepo = repoData.data.values.map(value => value.path);
    const filenamesNoExtension = fileNamesFromRepo.map(fileName => fileName.split('.')[0]);
    const splitUrl = sourceUrl.split('/');

    await generateDocsFiles(fileNamesFromRepo, splitUrl[6], splitUrl[7]);
    await generateSidebarFile(filenamesNoExtension);
};

const generateDocsFiles = async (fileNames, company, repo) => {
    for (let i = 0; i < fileNames.length; i++) {
        const fetchContentResponse = await axios.get(`https://bitbucket.org/${company}/${repo}/raw/HEAD/${fileNames[i]}`);

        writeFileSync(join(siteDirectory, 'docs', fileNames[i]), fetchContentResponse.data);
    }
};

const generateSidebarFile = async (sidebarItems) => {
    writeFileSync(
        join(siteDirectory, sidebarPath),
        `module.exports = {docs: ${JSON.stringify(sidebarItems, null, "    ")}};`,
        "utf8");
};

pullFromRepo();

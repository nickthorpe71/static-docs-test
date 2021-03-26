const axios = require("axios");
const { join } = require("path");
const { writeFileSync } = require("fs");

/**
 * Plugin Options:
 * sourceUrl: string
 * sidebarPath: string
 */

module.exports = (context, options) => {
    const { sourceUrl, sidebarPath } = options;

    if (!sourceUrl)
        throw new Error("Please specify a sourceUrl in plugin options");

    if (!sourceUrl.endsWith("/"))
        sourceUrl = `${sourceUrl}/`;

    /**
     * Retrives a list of file names from specified repo
     */
    const getFileNames = async (sourceBaseUrl) => {
        console.log('get names');
        const repoData = await axios.get(sourceBaseUrl);

        const fileNamesFromRepo = repoData.data.values.map(value => value.path);
        const filenamesNoExtension = fileNamesFromRepo.map(fileName => fileName.split('.')[0]);
        const splitUrl = sourceBaseUrl.split('/');

        // index 6 is the company name from a bitbucket api url
        // index 7 is the repo name from a bitbucket api url
        await generateUrlsForTargetFiles(fileNamesFromRepo, splitUrl[6], splitUrl[7]);
        await generateSidebarFile(context.siteDir, sidebarPath, filenamesNoExtension);
    };

    /**
     * Pulls all files from repo and writes them to docs folder
     */
    const generateUrlsForTargetFiles = async (fileNames, company, repo) => {
        console.log('gen files');
        for (let i = 0; i < fileNames.length; i++) {
            const path = join(context.siteDir, 'docs', fileNames[i]);
            const fetchContentResponse = await axios.get(`https://bitbucket.org/${company}/${repo}/raw/HEAD/${fileNames[i]}`);

            writeFileSync(path, fetchContentResponse.data);
        }
    };

    /**
     * Creates a sidebar file that contains all sitebarItems passed in
     */
    const generateSidebarFile = async (siteDir, sidebarPath, sidebarItems) => {
        console.log('get sidebar');
        const sidebarFileContents =
            `
        module.exports = {
            docs: 
            ${JSON.stringify(sidebarItems, null, "    ")}
        };
        `;

        const fullSidebarPath = join(siteDir, sidebarPath);

        writeFileSync(fullSidebarPath, sidebarFileContents, "utf8");
    };

    return {
        name: 'docusaurus-plugin-winged-seed',

        async loadContent() {
            console.log('load');
            return await getFileNames(sourceUrl);
        }
    };
};
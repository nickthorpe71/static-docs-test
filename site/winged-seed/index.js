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
     * Retrieves a list of file names from specified repo
     * Then triggers local file generation and sidebar generation
     */
    const pullFromRepo = async () => {
        const repoData = await axios.get(sourceUrl);

        const fileNamesFromRepo = repoData.data.values.map(value => value.path);
        const filenamesNoExtension = fileNamesFromRepo.map(fileName => fileName.split('.')[0]);
        const splitUrl = sourceUrl.split('/');

        // index 6 is the company name from a bitbucket api url
        // index 7 is the repo name from a bitbucket api url
        await generateDocsFiles(fileNamesFromRepo, splitUrl[6], splitUrl[7]);
        await generateSidebarFile(filenamesNoExtension);
    };

    /**
     * Pulls all files from repo and writes them to docs folder
     */
    const generateDocsFiles = async (fileNames, company, repo) => {
        for (let i = 0; i < fileNames.length; i++) {
            const path = join(context.siteDir, 'docs', fileNames[i]);
            const fetchContentResponse = await axios.get(`https://bitbucket.org/${company}/${repo}/raw/HEAD/${fileNames[i]}`);

            writeFileSync(path, fetchContentResponse.data);
        }
    };

    /**
     * Creates a sidebar file that contains all sitebarItems passed in
     */
    const generateSidebarFile = async (sidebarItems) => {
        const sidebarFileContents =
            `
        module.exports = {
            docs: 
            ${JSON.stringify(sidebarItems, null, "    ")}
        };
        `;

        const fullSidebarPath = join(context.siteDir, sidebarPath);

        writeFileSync(fullSidebarPath, sidebarFileContents, "utf8");
    };

    return {
        name: 'docusaurus-plugin-winged-seed',

        async loadContent() {
            return await pullFromRepo(sourceUrl);
        }
    };
};
const axios = require("axios");
const { join } = require("path");
const { writeFileSync } = require("fs");

/**
 * Plugin Options
 * sourceUrl: string
 * sidebarPath: string
 */

module.exports = (context, options) => {
    const { sourceUrl, sidebarPath } = options;

    if (!sourceUrl)
        throw new Error("Please specify a sourceUrl in plugin options");

    if (!sourceUrl.endsWith("/"))
        sourceUrl = `${sourceUrl}/`;

    // get all file names from repo
    const getFileNames = async (sourceBaseUrl) => {
        const repoData = await axios.get(sourceBaseUrl);

        const fileNamesFromRepo = repoData.data.values.map(value => value.path);
        const filenamesNoExtension = fileNamesFromRepo.map(fileName => fileName.split('.')[0]);
        const splitUrl = sourceBaseUrl.split('/');

        // index 6 is the company name from a bitbucket api url
        // index 7 is the repo name from a bitbucket api url
        generateUrlsForTargetFiles(fileNamesFromRepo, splitUrl[6], splitUrl[7]);
        generateSidebarFile(context.siteDir, sidebarPath, filenamesNoExtension);
    };

    // create files locally
    const generateUrlsForTargetFiles = (fileNames, company, repo) => {

        fileNames.forEach(async fileName => {
            if (!fileName.endsWith('md') && !fileName.endsWith('mdx'))
                return;

            const path = join(context.siteDir, 'docs', fileName);
            const fetchContentResponse = await axios.get(`https://bitbucket.org/${company}/${repo}/raw/HEAD/${fileName}`);

            writeFileSync(path, fetchContentResponse.data);
        });
    };

    /**
     * Creates a sidebar file that contains all sitebarItems passed in
     * @param {String} siteDir
     * @param {String} contentRelPath
     * @param {String} sidebarPath
     * @param {String[]} sidebarItems
     */
    const generateSidebarFile = (siteDir, sidebarPath, sidebarItems) => {
        const sidebarFileContents = `
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
            return await getFileNames(sourceUrl);
        }
    };
};
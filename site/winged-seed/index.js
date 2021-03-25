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
        const urlDataExtract = getCompanyAndRepoFromUrl(sourceBaseUrl);

        generateUrlsForTargetFiles(fileNamesFromRepo, urlDataExtract.company, urlDataExtract.repo);
        generateSidebarFile(context.siteDir, sidebarPath, filenamesNoExtension);
    };

    // create files locally
    const generateUrlsForTargetFiles = (fileNames, company, repo) => {
        const contentDataObjects = [];
        fileNames.forEach(fileName => {
            if (fileName.endsWith('md') || fileName.endsWith('mdx')) {
                contentDataObjects.push({
                    url: `https://bitbucket.org/${company}/${repo}/raw/HEAD/${fileName}`,
                    identifier: fileName
                });
            }
        });
        fetchContent(contentDataObjects);
    };

    const fetchContent = async (contentDataObjects) => {
        const targetDirectory = locateTargetLocalDirectory();

        await contentDataObjects.forEach(async contentDataObject => {
            writeFileSync(
                join(targetDirectory, contentDataObject.identifier),
                await (await axios({ url: contentDataObject.url })).data
            );
        });
    };

    const locateTargetLocalDirectory = () => {
        return join(context.siteDir, 'docs');
    };

    const getCompanyAndRepoFromUrl = (url) => {
        const splitUrl = url.split('/');
        return {
            company: splitUrl[6],
            repo: splitUrl[7]
        };
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
            docs: ${JSON.stringify(sidebarItems, null, "    ")}
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
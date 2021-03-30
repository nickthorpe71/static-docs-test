const axios = require("axios");
const { join } = require("path");
const { writeFileSync, rmdir, readdir } = require("fs");
const { exec } = require('child_process');

const sourceUrl = 'https://bitbucket.org/!api/2.0/repositories/Ironskin/test-2/src/master/';
const sidebarPath = 'sidebars.auto.js';
const siteDirectory = String(__dirname).split('/').slice(0, -1).join('/');

module.exports = async () => {
    const fileNames = await getFileNamesFromRepo();
    await generateDocsFiles(fileNames);
    await generateSidebarFile(fileNames);
    runNpmCommand('build', postBuild);
};

const getFileNamesFromRepo = async () => {
    const repoData = await axios.get(sourceUrl);
    return repoData.data.values.map(value => value.path);
};

const generateDocsFiles = async (fileNames) => {
    checkForRemoval(fileNames);
    const splitUrl = sourceUrl.split('/');
    for (let i = 0; i < fileNames.length; i++) {
        const fetchContentResponse = await axios.get(`https://bitbucket.org/${splitUrl[6]}/${splitUrl[7]}/raw/HEAD/${fileNames[i]}`);
        writeFileSync(join(siteDirectory, 'docs', fileNames[i]), fetchContentResponse.data);
    }
};

const checkForRemoval = (fileNames) => {
    const path = siteDirectory + '/docs';
    readdir(path, (error, files) => {
        if (error)
            console.warn(error);

        files.forEach(file => {
            if (!fileNames.includes(file))
                rmdir(path + '/' + file, { recursive: true }, () => { });
        });
    });
};

const generateSidebarFile = async (fileNames) => {
    const filenamesNoExtension = fileNames.map(fileName => fileName.split('.')[0]);
    writeFileSync(
        join(siteDirectory, sidebarPath),
        `module.exports = {docs: ${JSON.stringify(filenamesNoExtension, null, "    ")}};`,
        "utf8");
};

const postBuild = () => {
    runGitCommand('add .', () => {
        runGitCommand('commit -m "automated commit"', () => {
            runGitCommand('push');
        });
    });
};

const runNpmCommand = (command, callback = undefined) => {
    exec(`cd ${siteDirectory} & npm run-script ${command}`, (error, stdout, stderr) => {
        if (error) console.log(`error: ${error.message}`);
        if (stderr) console.log(`stderr: ${stderr}`);
        if (callback) callback();
    });
};

const runGitCommand = (command, callback = undefined) => {
    exec(`cd ${siteDirectory} & git ${command}`, (error, stdout, stderr) => {
        if (error) console.log(`error: ${error.message}`);
        if (stderr) console.log(`stderr: ${stderr}`);
        if (callback) callback();
    });
};
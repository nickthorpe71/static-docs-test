/** @type {import('@docusaurus/types').DocusaurusConfig} */

const path = require('path');

module.exports = {
    title: 'My Site',
    tagline: 'The tagline of my site',
    url: 'https://your-docusaurus-test-site.com',
    baseUrl: '/',
    onBrokenLinks: 'warn',
    onBrokenMarkdownLinks: 'warn',
    favicon: 'img/favicon.ico',
    organizationName: 'facebook', // Usually your GitHub org/user name.
    projectName: 'docusaurus', // Usually your repo name.
    themeConfig: {
        navbar: {
            title: 'My Site',
            logo: {
                alt: 'My Site Logo',
                src: 'img/logo.svg',
            },
            items: [
                {
                    to: 'docs/test',
                    activeBasePath: 'docs',
                    label: 'Docs',
                    position: 'left',
                }
            ],
        },
    },
    presets: [
        [
            '@docusaurus/preset-classic',
            {
                docs: {
                    path: 'docs',
                    routeBasePath: 'docs',
                    sidebarPath: require.resolve('./sidebars.auto.js'),
                },
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
            },
        ],
    ],
    plugins: [
        [
            path.resolve(__dirname, 'winged-seed'),
            {
                sourceUrl: 'https://bitbucket.org/!api/2.0/repositories/Ironskin/test-2/src/master/',
                sidebarPath: 'sidebars.auto.js'
            }
        ]
    ],
};

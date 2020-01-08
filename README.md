# cams-popup-extension

See the wiki: https://github.com/paul-kline/cams-popup-extension/wiki for technical details.
chrome extension available at: https://chrome.google.com/webstore/detail/cams-helper/nohnkhiaaclbbanceebnjbmchpmjgffn

## Development:
### One time set up:
1. After cloning project, run ``npm install`` from the command line to retrieve proper type dependencies. 
2. Have typescript installed globally: ``npm install -g typescript``
### Make changes and test 
1. run ``tsc`` or ``tsc -w`` from the command line which will compile the ts and manifest into js files in the dist directory.
2. With chrome developer options on, navigate to chrome://extensions, click 'load unpacked' extension, and navigate to the dist directory. 
3. Each time ts files change and you wish to test the new code, one must 
(a) compile to js if tsc is not in watch (-w) mode, 
(b) refresh the unpacked extension in chrome://extensions, 
(c) refresh the webpage pertaining to the changes.

# Misskey Web
[![][travis-badge]][travis-link]
[![][gemnasium-badge]][gemnasium-link]
[![][david-dev-badge]][david-dev-link]
[![][mit-badge]][mit]

Misskey-Web is *Misskey* official client for the Web. run on [Node.js](https://github.com/nodejs/node)!

## External dependencies
* Node.js
* npm
* MongoDB
* GraphicsMagick (for trimming, compress, etc etc)

## How to build
1. `git clone git://github.com/MissKernel/Misskey-Web.git`
2. `cd Misskey-Web`
3. `npm install`
4. `npm run dtsm`
4. `sudo ./node_modules/.bin/bower install --allow-root`
5. `npm run build`

## How to start Misskey Web server
`npm start`

## People

The original author of Misskey is [syuilo](https://github.com/syuilo)

The current lead maintainer is [syuilo](https://github.com/syuilo)

[List of all contributors](https://github.com/MissKernel/Misskey-Web/graphs/contributors)

## License
The MIT License. See [LICENSE](LICENSE).

[mit]:             http://opensource.org/licenses/MIT
[mit-badge]:       https://img.shields.io/badge/license-MIT-444444.svg?style=flat-square
[travis-link]:     https://travis-ci.org/MissKernel/Misskey-Web
[travis-badge]:    http://img.shields.io/travis/MissKernel/Misskey-Web.svg?style=flat-square
[david-dev-link]:  https://david-dm.org/MissKernel/Misskey-Web#info=devDependencies&view=table
[david-dev-badge]: https://img.shields.io/david/dev/MissKernel/Misskey-Web.svg?style=flat-square
[gemnasium-link]:  https://gemnasium.com/MissKernel/Misskey-Web
[gemnasium-badge]: https://gemnasium.com/MissKernel/Misskey-Web.svg

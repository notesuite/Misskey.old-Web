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

## How to display options
`npm start -- -h`

## Configuration

### Basic template
``` yaml
#================================================================
# Misskey Web Configuration
#================================================================

### サーバーの管理者情報
# ex) "Your Name <youremail@example.com>"
maintainer: <string>

### アクセスするときのドメイン
host: "misskey.xyz"

### アクセスするときのポート
# サーバー内部でlistenするポートではありません。ブラウザでアクセスするときの最終的なポートです。
# 内部でプロキシを使用していたりなどの理由で、リクエストを待ち受けるポートを指定する場合は bindPorts の項目を設定してください。
ports:
  http: 80
  https: 443
  streaming: 3000

### ユーザーのクライアントに関する設定をストアするDB(Mongo)の情報
mongo:
  uri: <string>
  options:
   user: <string>
   pass: <string>

# 2016年5月現在、APIがストリーミングを提供していないため直接APIサーバーのRedisに繋ぐ必要があるので、その情報
redis:
  host: <string>
  pass: <string>

### TLS設定
https:
  enable: <boolean>
  # 以下証明書設定。 enable が false の場合は省略
  keyPath: <string>
  certPath: <string>

### APIサーバー設定
api:
  host: <string>
  port: <string>
  secure: <boolean>
  pass: <string>

# よく分からない
cookiePass: <string>

# セッションIDを保存するCookieのキー
sessionKey: "hmsk"

# よく分からない
sessionSecret: <string>

### reCAPTCHA設定
# SEE: https://www.google.com/recaptcha/intro/index.html
recaptcha:
  # サイトキー
  siteKey: <string>
  # シークレット
  secretKey: <string>

### Search Console設定
# SEE: https://support.google.com/webmasters/answer/35179?hl=ja
googleSiteVerification: <string>

bindIp: null

### Web待ち受けポート
bindPorts:
  http: 80
  https: 443
  streaming: 3000

### テーマカラー
themeColor: "#ec6b43"
```

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

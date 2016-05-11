"use strict";
const fs = require('fs');
const yaml = require('js-yaml');
const home = process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];
const dirName = '.misskey-web';
const fileName = 'config.yml';
const dirPath = `${home}/${dirName}`;
const path = `${dirPath}/${fileName}`;
function loadConfig() {
    let conf;
    try {
        conf = yaml.safeLoad(fs.readFileSync(path, 'utf8'));
        console.log('Loaded config');
    }
    catch (e) {
        console.error('Failed to load config: ' + e);
        process.exit(1);
    }
    validateHost(conf.host);
    const host = conf.host;
    const domains = conf.domains;
    const scheme = conf.https.enable ? 'https' : 'http';
    const port = conf.https.enable
        ? conf.ports.https === 443 ? '' : ':' + conf.ports.https
        : conf.ports.http === 80 ? '' : ':' + conf.ports.http;
    conf.url = `${scheme}://${host}` + port;
    conf.api.url =
        (conf.api.secure ? 'https' : 'http') + '://'
            + conf.api.host
            + (conf.api.secure ? conf.api.port === 443 ? '' : ':' + conf.api.port : conf.api.port === 80 ? '' : ':' + conf.api.port);
    conf.streamingUrl =
        scheme + '://'
            + host
            + ':' + conf.ports.streaming;
    conf.hosts = {
        admin: `${domains.admin}.${host}`,
        i: `${domains.i}.${host}`,
        about: `${scheme}${domains.about}.${host}`,
        api: `${domains.api}.${host}`,
        resources: `${domains.resources}.${host}`,
        signup: `${domains.signup}.${host}`,
        signin: `${domains.signin}.${host}`,
        signout: `${domains.signout}.${host}`,
        share: `${domains.share}.${host}`,
        forum: `${domains.forum}.${host}`,
        search: `${domains.search}.${host}`,
        talk: `${domains.talk}.${host}`,
        help: `${domains.help}.${host}`,
        color: `${domains.color}.${host}`
    };
    conf.urls = {
        admin: `${scheme}://${domains.admin}.${host}`,
        i: `${scheme}://${domains.i}.${host}`,
        about: `${scheme}://${domains.about}.${host}`,
        api: `${scheme}://${domains.api}.${host}`,
        resources: `${scheme}://${domains.resources}.${host}`,
        signup: `${scheme}://${domains.signup}.${host}`,
        signin: `${scheme}://${domains.signin}.${host}`,
        signout: `${scheme}://${domains.signout}.${host}`,
        share: `${scheme}://${domains.share}.${host}`,
        forum: `${scheme}://${domains.forum}.${host}`,
        search: `${scheme}://${domains.search}.${host}`,
        talk: `${scheme}://${domains.talk}.${host}`,
        help: `${scheme}://${domains.help}.${host}`,
        color: `${scheme}://${domains.color}.${host}`
    };
    return conf;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = loadConfig();
function validateHost(host) {
    if (host.indexOf(':') !== -1) {
        console.error('host にはポート情報は含めないでください。必要であれば port にポート情報を記述してください。');
        process.exit();
    }
}

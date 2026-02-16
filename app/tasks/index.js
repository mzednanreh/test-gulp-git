/*
 * CONFIG
 */
const Project = require('../helpers/project.js');
const emails = require('../../emails.json');
const meta = require('../../project.json');
const project = new Project(emails, meta);

/*
 * TASKS
 */
const { html } = require('./html');
exports.html = html(project);

const { styles } = require('./styles');
exports.styles = styles();

const { scaffold } = require('./scaffold');
exports.scaffold = scaffold(project);

const { inline } = require('./inline');
exports.inline = inline(project);

const { build } = require('./build');
exports.build = build(project);

const { deploy } = require('./deploy');
exports.deploy = deploy(project);

const { server } = require('./server');
exports.server = server;
const fs = require('fs');
const Promise = require('bluebird');

const compile = require('./compile');
const parse = require('./parse');
const css = require('./css');
const write = require('./write-artifacts');
const bundle = require('./bundle-js');
const writeJS = require('./write-js');

let outputs;

const build = (opts, inputConfig, paths) => {
  // always store source in opts.inputString
  if (paths.IDYLL_INPUT_FILE) {
    opts.inputString = fs.readFileSync(paths.IDYLL_INPUT_FILE, 'utf8');
  }

  return Promise
    .resolve(compile(opts.inputString, opts.compilerOptions))
    .then((ast) => {
      return parse(ast, inputConfig, paths)
    })
    .then((artifacts) => {
      // assemble and add css
      outputs = Object.assign({}, artifacts, {css: css(opts)});
      return outputs;
    })
    .then((artifacts) => {
      // write everything but the JS bundle to disk
      return write(artifacts, paths);
    })
    .then(() => {
      return bundle(paths);
    })
    .then((src) => {
      // add and write JS bundle
      outputs.js = src;
      return writeJS(src, paths.JS_OUTPUT_FILE, opts.minify);
    })
    .then(() => {
      return outputs;
    });
}

module.exports = {
  build
}

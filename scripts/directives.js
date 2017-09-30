exports.metadata = function(context, lines) {
  lines.forEach(function(l) {
    var [key, val] = l.split(":");
    context[key] = val.trim();
  });
};

exports.ul = (_, lines) => `<ul>
${lines.map(l => `<li>${l}</li>`).join("\n")}
</ul>`;

exports.paragraph = (_, line) => `<p>${line}</p>`;

exports.subhead = (_, lines) => `<h2>${lines.join("\n").trim()}</h2>`;

var htmlify = s => s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");

exports.codeblock = function(_, lines) {
  var contents = lines.map(l => `<span class="line">${htmlify(l)}\n</span>`);
  return `<code><pre>${contents.join("")}</pre></code>`
};

exports.sidebar = (_, lines, process) => `<aside class="sidebar">
${process(lines).join("\n")}
</aside>`;

var fs = require("fs");
var path = require("path");
var src = path.resolve(__dirname, "../src");

exports.include = function(_, [filename]) {
  return fs.readFileSync(path.resolve(src, filename), "utf-8");
};
exports.metadata = function(context, lines) {
  lines.forEach(function(l) {
    var [key, val] = l.split(":");
    context[key] = val.trim();
  });
};

//paragraph is special-cased
exports.paragraph = (_, line) => `<p>${line}</p>`;

exports.html = (_, lines) => lines.join("\n");

exports.ul = (_, lines) => `<ul>
${lines.map(l => `<li>${l}</li>`).join("\n")}
</ul>`;

exports.subhead = (_, lines) => `<h2>${lines.join("\n").trim()}</h2>`;

var escapeHTML = s => s.replace(/&/g, "&amp;").replace(/\</g, "&lt;").replace(/\>/g, "&gt;");

exports.codeblock = function(_, lines) {
  var start = -1;
  var end = 0;
  //trim starting and ending blank lines
  for (var i = 0; i < lines.length; i++) {
    var l = lines[i].trim();
    if (l) end = i + 1;
    if (l && start == -1) start = i;
  }
  lines = lines.slice(start, end);
  var contents = lines.map(l => `<span class="line">${escapeHTML(l)}\n</span>`);
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
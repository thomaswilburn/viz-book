var hljs = require("highlight.js");

exports.metadata = function(context, { lines }) {
  lines.forEach(function(l) {
    var [key, val] = l.split(":");
    context[key] = val.trim();
  });
};

var escapeHTML = s => s.replace(/&/g, "&amp;").replace(/\</g, "&lt;").replace(/\>/g, "&gt;");

var inlines = function(text) {
  return text.replace(/`([^`]+)`/g, function(_, v) {
    return `<var>${escapeHTML(v)}</var>`
  });
}

//paragraph is special-cased
exports.paragraph = (_, line) => `<p>${inlines(line)}</p>`;

exports.html = (_, { lines }) => lines.join("\n");

exports.ul = (_, { lines }) => `<ul>
${lines.map(l => `<li>${inlines(l)}</li>`).join("\n")}
</ul>`;

exports.subhead = function(context, { lines, arg }) {
  var contents = lines.join("\n").trim();
  var id = arg || contents.replace(/[`"',?.]/g, "").replace(/\s+/g, "-").toLowerCase();
  contents = inlines(contents);
  if (!context.subheads) context.subheads = [];
  context.subheads.push({ id, contents });
  return `<h2 id="${id}">${contents}</h2>`
};

exports.subsubhead = (_, { lines }) => `<h3>${lines.map(inlines).join("\n").trim()}</h3>`;

exports.codeblock = function(context, def) {
  var start = -1;
  var end = 0;
  var { lines, arg: language } = def;
  //trim starting and ending blank lines
  for (var i = 0; i < lines.length; i++) {
    var l = lines[i].trim();
    if (l) end = i + 1;
    if (l && start == -1) start = i;
  }
  lines = lines.slice(start, end);
  var contents = lines.join("\n");
  // we ignore illegal parses but that's not great.
  var highlighted = hljs.highlight(contents, { language, ignoreIllegals: true });
  if (!language && highlighted.relevance == 0) {
    console.log(`No highlight for: ${context.filename}`);
    console.log(contents);
  }
  return `<code class="language-${language}"><pre>${highlighted.value}</pre></code>`
};

exports.sidebar = (_, { lines }, process) => `<aside class="sidebar">
${process(lines).join("\n")}
</aside>`;

var fs = require("fs");
var path = require("path");
var src = path.resolve(__dirname, "../src");

exports.include = function(_, def) {
  var filename = def.arg || def.lines[0];
  return fs.readFileSync(path.resolve(src, filename), "utf-8");
};

exports.includeCode = function(context, def) {
  var redef = {
    arg: def.lines[0]
  }
  var contents = exports.include(null, redef);
  def.lines = contents.split("\n");
  return exports.codeblock(context, def); 
};
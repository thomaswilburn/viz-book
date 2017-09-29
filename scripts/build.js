var directives = require("./directives");
var fs = require("fs");
var path = require("path");

var sourceDir = path.resolve(__dirname, "../src");
var docsDir = path.resolve(__dirname, "../docs");
var templateDir = path.resolve(__dirname, "../templates");

var isList = /^[*-]\s+/;
var isDirective = /^@([a-z]+)(\.{0,3})\s*(.*)$/i;

var toc = [
  "intro",
  "jquery"
];

var data = {};

var process = function(lines, context = {}) {
  var processed = [];
  var mode = null;
  var active = false;
  var buffer = [];
  for (var i = 0; i < lines.length; i++) {
    var l = lines[i].trim();
    switch (mode) {
        
      case "multiline":
        if (l == "..." + active) {
          if (!directives[active]) throw `No matching directive for @${active}`;
          var result = directives[active](context, buffer, process);
          if (result) processed.push(result);
          mode = null;
          active = false;
          buffer = [];
        } else {
          buffer.push(lines[i]);
        }
        break;
        
      case "list":
        if (l.match(isList)) {
          buffer.push(l.replace(isList, ""));
          break;
        } else {
          //end of list
          mode = null;
          processed.push(directives.ul(context, buffer));
          buffer = [];
          //fall through to process regular paragraph
        }
        
      default:
        if (l.match(isList)) {
          i--;
          mode = "list";
          break;
        }
        var d = l.match(isDirective);
        if (d) {
          var [all, directive, ellipsis, input] = d;
          if (ellipsis) {
            mode = "multiline";
            active = directive;
            buffer = [];
          } else {
            //immediate replace using arguments to end of line
            if (!directives[directive]) throw `No matching directive for @${directive}`;
            var result = directives[directive](context, [input], process);
            if (result) processed.push(result);
          }
        } else {
          if (l) processed.push(directives.paragraph(context, l));
        }
    }
  }
  return processed;
}

var files = fs.readdirSync(sourceDir).filter(f => f.match(/text$/));
files.forEach(function(filename) {
  var file = fs.readFileSync(path.resolve(sourceDir, filename), "utf-8");
  var slug = filename.replace(".text", "");
  var lines = file.split("\n");
  var context = { slug, filename: filename.replace(".text", ".html") };
  var content = process(lines, context);
  context.content = content.join("\n");
  data[slug] = context;
});

var pageTemplate = fs.readFileSync(path.resolve(templateDir, "page.html"), "utf-8");

for (var slug in data) {
  var context = data[slug];
  var index = toc.indexOf(slug);
  var nextSlug = toc[index + 1];
  var prevSlug = toc[index - 1];
  var next = data[nextSlug] || { title: "TOC", filename: "index.html" };
  var previous = data[prevSlug] || { title: "TOC", filename: "index.html" };
  context.nextURL = next.filename;
  context.nextTitle = next.title;
  context.prevURL = previous.filename;
  context.prevTitle = previous.title;
  var page = pageTemplate.replace(/\{\{([a-z]+)\}\}/ig, (_, key) => context[key]);
  var out = path.resolve(docsDir, slug + ".html");
  fs.writeFileSync(out, page);
};

var tocTemplate = fs.readFileSync(path.resolve(templateDir, "toc.html"), "utf-8");
var list = toc.map(function(item) {
  var p = data[item];
  return `<li> <a href="${p.filename}">${p.title}</a>`;
}).join("\n");
fs.writeFileSync(path.resolve(docsDir, "index.html"), tocTemplate.replace("{{content}}", list));
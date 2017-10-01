var fs = require("fs");
var path = require("path");

var process = require("./process");

var sourceDir = path.resolve(__dirname, "../src");
var docsDir = path.resolve(__dirname, "../docs");
var templateDir = path.resolve(__dirname, "../templates");

var toc = require("../toc.json");

var data = {
  toc: { filename: "index.html", title: "Table of Contents" }
};

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

var flattened = [];
toc.forEach(function(item) {
  if (item.section) {
    flattened.push(item.section, ...item.chapters);
  } else {
    flattened.push(item);
  }
});

for (var slug in data) {
  var context = data[slug];
  var index = flattened.indexOf(slug);
  var nextSlug = flattened[index + 1] || "toc";
  var prevSlug = flattened[index - 1] || "toc";
  var next = data[nextSlug] || { title: nextSlug, filename: "" };
  var previous = data[prevSlug] || { title: prevSlug, filename: "" };
  context.nextURL = next.filename;
  context.nextTitle = next.title;
  context.prevURL = previous.filename;
  context.prevTitle = previous.title;
  var page = pageTemplate.replace(/\{\{([a-z]+)\}\}/ig, (_, key) => context[key] || "");
  var out = path.resolve(docsDir, slug + ".html");
  fs.writeFileSync(out, page);
};

var tocTemplate = fs.readFileSync(path.resolve(templateDir, "toc.html"), "utf-8");

var listify = function(slug) {
  var p = data[slug] || { filename: "", title: slug };
  return `<li> <a href="${p.filename}">${p.title}</a>\n`;
};

var list = "";
toc.forEach(function(item) {
  if (item.section) {
    list += listify(item.section);
    list += `<ol>${item.chapters.map(listify).join("\n")}</ol>`
  } else {
    list += listify(item);
  }
});
fs.writeFileSync(path.resolve(docsDir, "index.html"), tocTemplate.replace("{{content}}", list));
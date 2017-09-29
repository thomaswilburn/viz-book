var directives = require("./directives");
var fs = require("fs");
var path = require("path");

var sourceDir = path.resolve(__dirname, "../src");
var docsDir = path.resolve(__dirname, "../docs");
var templateDir = path.resolve(__dirname, "../templates");
var pageTemplate = fs.readFileSync(path.resolve(templateDir, "page.html"), "utf-8");

var isList = /^[*-]\s+/;
var isDirective = /^@([a-z]+)(\.{0,3})\s*(.*)$/i;

var files = fs.readdirSync(sourceDir).filter(f => f.match(/text$/));
files.forEach(function(f) {
  var file = fs.readFileSync(path.resolve(sourceDir, f), "utf-8");
  var lines = file.split("\n");
  var processed = [];
  var active = false;
  var buffer = [];
  var context = {};
  var mode = null;
  for (var i = 0; i < lines.length; i++) {
    var l = lines[i].trim();
    if (!l) continue;
    switch (mode) {
        
      case "multiline":
        if (l == "..." + active) {
          if (!directives[active]) throw `No matching directive for @${active}`;
          var result = directives[active](context, buffer);
          if (result) processed.push(result);
          mode = null;
          active = false;
          buffer = [];
        } else {
          buffer.push(l);
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
            var result = directives[directive](context, [input]);
            if (result) processed.push(result);
          }
        } else {
          processed.push(directives.paragraph(context, l));
        }
        
    }
  }
  context.content = processed.join("\n");
  var page = pageTemplate.replace(/\{\{([a-z]+)\}\}/ig, (_, key) => context[key]);
  var out = path.resolve(docsDir, path.basename(f).replace(".text", ".html"));
  fs.writeFileSync(out, page);
});
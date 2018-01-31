var directives = require("./directives");

var isList = /^[*-]\s+/;
var isDirective = /^@([a-z]+)(\(([^)]+)\))?(\.{0,3})\s*(.*)$/i;

var process = function(lines, context = {}) {
  var processed = [];
  var mode = null;
  var active = false;
  for (var i = 0; i < lines.length; i++) {
    var l = lines[i].trim();
    switch (mode) {
        
      case "multiline":
        if (l == "..." + active.tag) {
          if (!directives[active.tag]) throw `No matching directive for @${active.tag}`;
          try {
            var result = directives[active.tag](context, active, process);
          } catch (err) {
            console.log(`Error in file: ${context.filename}`);
            throw err;
          }
          if (result) processed.push(result);
          mode = null;
          active = false;
        } else {
          active.lines.push(lines[i]);
        }
        break;
        
      case "list":
        if (l.match(isList)) {
          active.lines.push(l.replace(isList, ""));
          break;
        } else {
          //end of list
          mode = null;
          processed.push(directives.ul(context, active));
          active = false;
          //fall through to process regular paragraph
        }
        
      default:
        if (l.match(isList)) {
          i--;
          mode = "list";
          active = { lines: [] };
          break;
        }
        var d = l.match(isDirective);
        if (d) {
          var [all, directive, parens, arg, ellipsis, input] = d;
          if (ellipsis) {
            mode = "multiline";
            active = {
              tag: directive,
              lines: [],
              arg
            }
          } else {
            //immediate replace using arguments to end of line
            if (!directives[directive]) throw `No matching directive for @${directive}`;
            try {
              var result = directives[directive](context, { arg, lines: [input] }, process);
            } catch (err) {
              console.log(`Error in file: ${context.filename}`);
              throw err;
            }
            if (result) processed.push(result);
          }
        } else {
          if (l) processed.push(directives.paragraph(context, l));
        }
    }
  }
  return processed;
};

module.exports = process;
var directives = require("./directives");

var isList = /^[*-]\s+/;
var isDirective = /^@([a-z]+)(\.{0,3})\s*(.*)$/i;

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
};

module.exports = process;
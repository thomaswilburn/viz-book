exports.metadata = function(context, lines) {
  lines.forEach(function(l) {
    var [key, val] = l.split(":");
    context[key] = val;
  });
};

exports.ul = (context, lines) => `<ul>
${lines.map(l => `<li>${l}</li>`).join("\n")}
</ul>`;

exports.paragraph = (context, line) => `<p>${line}</p>`;

exports.subhead = (context, lines) => `<h2>${lines.join("\n")}</h2>`;
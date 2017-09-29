exports.metadata = function(context, lines) {
  lines.forEach(function(l) {
    var [key, val] = l.split(":");
    context[key] = val;
  });
};

exports.ul = function(context, lines) {
  console.log("ul", context, lines);
  return `<ul>
${lines.map(l => `<li>${l}</li>`).join("\n")}
</ul>`;
};

exports.paragraph = function(context, lines) {
  return `<p>${lines}</p>`;
};
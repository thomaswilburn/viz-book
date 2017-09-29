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

exports.codeblock = (_, lines) => `<code><pre>${lines.join("\n")}</pre></code>`;

exports.sidebar = (_, lines, process) => `<aside class="sidebar">
${process(lines).join("\n")}
</aside>`;
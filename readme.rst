The Elegant Selection (working title)
=====================================

A book about creating news graphics for the web, targeting modern browsers.

Building the book
-----------------

There aren't any dependencies, and hardly any infrastructure to speak of. Source files are in ``src/``, and output goes in ``docs/`` so that GitHub Pages can see it without maintaining a separate branch. Use ``npm run build`` to rebuild after making changes. There's a ``docs/static`` folder that's not touched, where you can keep images and stylesheets.

I recommend running a server in a second terminal or a tmux session from the output folder, so that you don't have to worry about the security sandbox, but pretty much everything should work from a file:// URL anyway.

The table of contents is generated from ``toc.json``, which contains an array of references to chapters and sections by filename. If you want to add a placeholder, you can just write in a string, and it'll echo that back out when it builds the TOC file.

The format
----------

Yeah, I made a new document format. Sorry. I like RST a lot, but there's no good Node libraries for it, and if I started writing a parser I'd never get the actual book done. I was inspired in part by `Pollen <http://docs.racket-lang.org/pollen/>`_, but of course I wasn't going to write the book in Racket. So I made something new, but at least I didn't dignify it with a goofy name.

For the most part, the inline format of a .text file is just HTML. It's a pretty good language. You don't have to wrap individual paragraphs in ``<p>`` tags, it will do that for you. It'll also automatically create lists for any block of lines starting with ``*`` or ``-``.

If you want to do something more special, you can use a ``@tag`` to trigger some special behavior. Tags can be a single line::

    @subhead Hello, this will produce a subhead

Or they can be multiple lines, surrounded by ellipses::

    @codeblock...
    <b>Outputs a block of code, with HTML characters escaped</b>
    ...codeblock

It's easy to extend the tag system, since the directives are just JavaScript functions stored in ``scripts/directives.js``. Each function is passed three arguments: a ``context`` object that contains shared data for the page, an array of ``lines``, and a ``process`` function that you can call to parse sub-tags recursively. The function should return a string, which will be substituted for the directive during templating. For example, here's the code for the ``@sidebar`` directive::

    exports.sidebar = (context, lines, process) => `<aside class="sidebar">
      ${process(lines).join("\n")}
    </aside>`;

Current tags (probably already out of date)
-------------------------------------------

* ``@metadata`` - Starts each page and sets up additional context values for templating. Each line is a new entry, formatted as "key:value".
* ``@paragraph`` - You don't need to call this, it'll be run for you whenever there's a top-level paragraph not in a block of some kind.
* ``@html`` - Lets you write multi-line raw HTML without triggering the automatic paragraph tags.
* ``@ul`` - You don't need to call this either, it triggers when the parser sees a list block.
* ``@subhead`` - Inserts a subhead, which is currently an ``<h2>`` but in the future *who knows*.
* ``@codeblock`` - You'll see a lot of these, they're used for code listings. HTML characters are escaped for display.
* ``@sidebar`` - Pretty self-explanatory.
* ``@include`` - Load a file into the page as raw content. Usually used to import interactive examples from ``src/snippets``.

Page templates
--------------

The content from the parsed .text files is loaded into template files from the (surprise!) ``templates/`` folder. These files aren't processed for directives, but they do have various values injected using {{mustache}} tags. If you set a value in the ``@metadata`` block for a page, like the title, it'll be used to replace "{{title}}" wherever it appears in the page template. Other values, like the next/previous links at the top and bottom of the page, are ad-hoc and defined in code for the ``scripts/build.js`` file. I'm sorry.
import markdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import markdownItAttrs from 'markdown-it-attrs';
import markdownItCodeWrap from 'markdown-it-codewrap';
import * as cheerio from 'cheerio';

let anchorifiedContentCache = {};

class TableOfContents {
	constructor(options = {}) {
		this.markup = options.markup;
		this.selectors = options.selectors || 'h2, h3, h4, h5';
		this.listClass = options.listClass || '';
		this.listLabelledBy = options.listLabelledBy;
		this.$ = cheerio.load(this.markup, null, false);
		this.headings = this.$(this.selectors); // Find semantic headings
		this.levels = this.selectors.split(',').map((h) => h.trim()); // Get an array of the heading selectors
		this.hierarchy = {};
	}

	/** Resolves the hierarchy a heading belongs to. */
	getHierarchy(h) {
		let tree = [];

		const tag = h.prop('tagName').toLowerCase();
		const level = this.levels.findIndex((level) => level === tag);
		const parentHeading = level > 0 ? h.prevAll(this.levels[level - 1]).first() : false;

		if (!parentHeading) {
			return false;
		}

		const parentAnchor = parentHeading.find('a[href^="#"]').attr('href');
		tree.push(parentAnchor);
		const ancestors = this.getHierarchy(parentHeading);
		if (ancestors) {
			tree = tree.concat(ancestors.tree); // Add the ancestors after the parent (forms a low-to-high hierarchy)
		}

		return { level, tree };
	}

	parseHeading(h, parent) {
		const anchor = h.find('a[href^="#"]').attr('href');
		const title = h.text().trim();
		const hierarchy = this.getHierarchy(h);
		const item = {
			title: title,
			sub: {},
		};

		if (hierarchy) {
			// The tree is returned from lowest to highest level, so we reverse the list to start from the top
			let tree = hierarchy.tree.slice().reverse();
			while (tree.length > 0) {
				const ancestorAnchor = tree.shift(); // Removes the first item in the list and returns it
				parent = parent[ancestorAnchor].sub; // Go one level deeper
			}
		}
		parent[anchor] = item; // Assign the item to the hierarchy
	}

	/** Creates a list with all the hierarchy represented. */
	populateList(levelItems) {
		const list = this.$('<ol>');

		for (let heading in levelItems) {
			const headingData = levelItems[heading];
			const item = this.$('<li>');
			const link = this.$(`<a href="${heading}">`).text(headingData.title);
			item.append(link);
			list.append(item);

			if (headingData.sub && Object.keys(headingData.sub).length > 0) {
				const sublist = this.populateList(headingData.sub);
				item.append(sublist);
			}
		}

		return list;
	}

	render() {
		// If there are no headings, that's an error
		if (this.headings.length === 0) {
			return '<p>(This may be broken, please let me know on Mastodon!)</p>';
		}

		// Loop over all the found headings
		this.headings.each((i, el) => {
			const h = this.$(el);
			this.parseHeading(h, this.hierarchy);
		});

		const list = this.populateList(this.hierarchy);
		list.addClass(this.listClass);
		if (this.listLabelledBy) {
			list.attr('aria-labelledby', this.listLabelledBy);
		}
		return list.prop('outerHTML');
	}
}

export default function (eleventyConfig, options = {}) {
	if (['anchorClass'].some((key) => typeof options[key] !== 'string')) {
		throw new Error('The `anchorClass` property must be provided on the options argument.');
	}

	const slugify = eleventyConfig.getFilter('slugify');
	const { anchorClass } = options;

	let markdownItOptions = {
		html: true,
		breaks: true,
		linkify: true,
	};

	let markdownItAttrsOptions = {
		leftDelimiter: options.attrsLeftDelimiter || '{',
		rightDelimiter: options.attrsRightDelimiter || '}',
		allowedAttributes: options.attrsAllowedAttributes || [],
	};

	let markdownItAnchorOptions = {
		permalink: true,
		permalinkSpace: false,
		permalinkSymbol: '§',
		permalinkClass: anchorClass,
		renderPermalink: (slug, opts, state, idx) => {
			// Based on https://nicolas-hoizey.com/articles/2021/02/25/accessible-anchor-links-with-markdown-it-and-eleventy/
			// Itself based on fifth version from https://amberwilson.co.uk/blog/are-your-anchor-links-accessible/

			// Create the opening/closing <a> tokens
			const headingAnchorTokenOpen = Object.assign(new state.Token('link_open', 'a', 1), {
				attrs: [
					...(opts.permalinkClass ? [['class', opts.permalinkClass]] : []),
					['href', opts.permalinkHref(slug, state)],
					...Object.entries(opts.permalinkAttrs(slug, state)),
				],
			});
			const headingAnchorTokenClose = Object.assign(new state.Token('link_close', 'a', -1));

			// idx is the index of the heading's first token
			const tokensBeforeContent = [headingAnchorTokenOpen];
			const tokensAfterContent = [headingAnchorTokenClose];
			// insert the anchor opening inside the heading, before the content token
			state.tokens.splice(idx + 1, 0, ...tokensBeforeContent);
			// insert the anchor closing after the heading opening and the content token + the tokens before the content
			state.tokens.splice(idx + 2 + tokensBeforeContent.length, 0, ...tokensAfterContent);
		},
		slugify: slugify,
	};

	let markdownItCodeWrapOptions = {
		outerCustomElement: options.outerCustomElement,
		outerCustomElementAttrs: options.outerCustomElementAttrs,
		wrapTag: options.codeWrapTag,
		wrapClass: options.codeWrapClass,
		hasToolbar: options.codeWrapToolbar,
		hasCopyButton: options.hasCopyButton,
		toolbarTag: options.codeToolbarTag,
		toolbarClass: options.codeToolbarClass,
		toolbarLabel: options.codeToolbarLabel,
		isButtonInToolbar: options.copyButtonInToolbar,
		copyButtonAttrs: options.copyButtonAttrs,
		copyButtonLabel: options.copyButtonLabel,
		inlineCopyHandler: options.inlineCopyHandler,
	};

	// Configure the MarkdownIt instance
	const md = new markdownIt(markdownItOptions)
		.disable('code')
		.use(markdownItAttrs, markdownItAttrsOptions)
		.use(markdownItAnchor, markdownItAnchorOptions)
		.use(markdownItCodeWrap, markdownItCodeWrapOptions);

	/** Configure the markdown-it library to use. */
	eleventyConfig.setLibrary('md', md);

	/** Take markup content and automatically create anchors for headings. Should only be used when content is not Markdown. */
	eleventyConfig.addFilter('getHeadingAnchors', (markup, includeH1 = false) => {
		// If this isn't a string, there isn't anything we can do!
		if (typeof markup !== 'string') {
			return markup;
		}

		if (anchorifiedContentCache.hasOwnProperty(markup)) {
			return anchorifiedContentCache[markup]; // Return cached value
		}

		const selector = `${includeH1 ? 'h1,' : ''} h2, h3, h4, h5, h6`;

		const $ = cheerio.load(markup, null, false); // Load the contents into cheerio to get a DOM representation
		const headings = $(selector); // Look for all semantic headings

		// If there are no headings, just return the content
		if (headings.length === 0) {
			anchorifiedContentCache[markup] = markup;
			return markup;
		}

		// Iterate over each heading
		headings.each(function () {
			const h = $(this);
			const innerLinks = h.find('a');

			// If there is already a link within, do not process the node
			if (innerLinks.length > 0) {
				return h;
			}

			const text = h.text(); // Get the heading content
			const slug = slugify(text); // Create a slug from the content
			const id = h.attr('id') || slug;
			const inner = `<a class="${anchorClass}" href="#${slug}">${text}</a>`;
			h.attr('id', id);
			h.attr('tabindex', '-1');
			h.html(inner);
			return h;
		});

		const processedMarkup = $.html();
		anchorifiedContentCache[markup] = processedMarkup;
		return processedMarkup;
	});

	/** Create a table of content list from markup */
	eleventyConfig.addFilter('autoToc', function (markup, listClass, listLabelledBy) {
		// If this isn't a string, there isn't anything we can do!
		if (typeof markup !== 'string') {
			return '';
		}

		const toc = new TableOfContents({ markup, selectors: 'h2, h3, h4', listClass: listClass, listLabelledBy });
		return toc.render();
	});

	/** Converts a Markdown string into markup. */
	eleventyConfig.addFilter('markdown', (content, inline = false) => (inline ? md.renderInline(content) : md.render(content)));
}

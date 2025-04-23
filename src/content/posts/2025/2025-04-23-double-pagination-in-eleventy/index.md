---
title: "Double-Pagination in Eleventy"
summary: 'Yo dawg, I heard you liked pagination, so I added pagination inside your paginated pages, so you can paginate while you paginate.'
tags:
    - eleventy
toc: true
---

So I recently converted [a French blog of mine](https://geekometric.com) to Eleventy from a Hugo-powered one (which itself was previously a WordPress…), as one does on a cloudy weekend. While Hugo is a very fast static site generator, it also uses a syntax which can easily get confusing if not used often. Given I barely did any maintenance since 2019, and basically only published content every so often, it’s been holding up surprisingly well. However, small changes few and far in between really highlighted how brittle this setup was. As such, I figured I’d reduce the technical debt and switch to Eleventy. But… Hugo does have some nice things out of the box, namely: **nested pagination**. Pass in a template with pagination inside of an already-paginating loop, and it… just works? It’s been so long that I don’t remember how, which is kind of a problem.

Anyways, sorry for the long intro. The point is: use Eleventy long enough and you’ll end up needing double-pagination. You can find many articles on the topic, as this blog post is far from the only one (heck, I wouldn’t be surprised if there was one which does _exactly_ what I’m about to describe). There are several ways to achieve this, and I’ll cover two techniques in this article. For a little clarity, what I refer to as "top level loop" is the metadata needing to be split up (e.g. a list of tags), and the second level loop corresponds to the pages numbers of the top level (for example: a top level loop for the “eleventy” tag, and a second-level loop for its pages 1 through 11).

{% callout %}
My rebuild uses [VentoJS](https://vento.js.org/) as the templating language. I have converted it to the more popular Nunjucks syntax, but please forgive me if I’ve missed anything (and let me know!). Also! Please consider all this code as wrapped inside a `export default async function (eleventyConfig) { ... }` block. (yay for ESM!)
{% endcallout %}

## Using a hardcoded list

This is the “easy” one but not-so-dynamic one. It requires us to know what we’re looping through ahead of time. In my converted blog, that was mapped to categories: a list which is separate from tags, set in the front-matter (usually a category is a media type like “gaming”, and the tags will be something like “RPG” or “puzzle”). If you’re like me and only blog every two or three months about similar topics, those categories are nearly static. Because of that, we don’t need to seek them out at build time: we can prepare the list beforehand, and loop over it during the build itself. Then, we can use [Eleventy’s virtual templates](https://www.11ty.dev/docs/virtual-templates/) to create the top level loop page which will receive the pagination. Here’s how that looks:

```js:.eleventy.js{% raw %}
const PAGE_SIZE = 5; // N posts per page
// Hardcoded list of categories to paginate
const categoriesMap = {
	gaming: 'Gaming',
	movies: 'Movies & TV',
	music: 'Music',
	events: 'Events',
	unboxing: 'Unboxing', // I've never done an unboxing video don't worry
};

// Loop over the category slugs
Object.keys(categoriesMap).forEach((cat) => {
	const catLabel = categoriesMap[cat];
	const catCollectionKey = `_category__${cat}`; // Using a tag structure that should not exist in regular content
	
	// First, create a new collection which will contain all the posts of the provided category
	eleventyConfig.addCollection(catCollectionKey, (collectionApi) => collectionApi.getFilteredByTag('_posts').filter((p) => p.data.categories.includes(cat)));

	// Then, create a virtual template for that category
	eleventyConfig.addTemplate(
		`content/categories/${cat}.njk`, // Virtual template filename: make sure this doesn't exist already!
		// Virtual template contents
		// Passing in data needs to come from the parent context, and cannot be injected in Nunjucks — pagination is luckily already set (Liquid has `with`, and VentoJS accepts an object as a second argument to the include which is super helpful)
		`{% set posts = quintet %}
		{% include "parts/postList.njk" %}
		{% include "parts/paginator.njk" %}`,
		{ // Virtual template data (frontmatter equivalent)
			layout: 'page.njk',
			pagination: {
				data: `collections[${catCollectionKey}']`,
				size: PAGE_SIZE,
				alias: 'quintet',
				before: function (paginationData, fullData) {
					paginationData.sort((a, b) => new Date(b.date) - new Date(a.date)); // Desc sort order
					return paginationData;
				},
			},
			permalink: `/categories/${cat}/{% if pagination.pageNumber > 0 %}page/{{ pagination.pageNumber + 1 }}/{{ endif }}index.html`,
			eleventyExcludeFromCollections: true,
			eleventyComputed: {
				title: (data) => `Category: ${catLabel}` + (data.pagination.pageNumber > 0 ? `, page ${data.pagination.pageNumber + 1}` : ''),
			},
		}
	);
});

return { ... };
{% endraw %}
```

One thing of note: I am not using `eleventyComputed` for the permalinks as it seems to throw things off for the results of `pagination.href` (I may need to file an issue, yes), so I am mixing in a template string to inject the category slug, but leaving the rest up to the “runtime” template parser!

That does the job. Since our `forEach` is our top level loop, Eleventy only needs to run the pagination engine once: it’s relatively short code that returns the desired behaviour. However, what about a not-so-static list? *There’s gotta be a better way!*

## Using a list from data at build time

It’s now time to think a little further… a little deeper, I’d wager! This time, let’s try to double-paginate our tags. That list is definitely going to be evolving over time, and hardcoding it, while doable, is an annoying obstacle to low-maintenance blogging. 

The thing to know is that we’re faced with a race condition (at least I think!). `addCollection` needs to run when all templates are ready, but we want to build a new collection from existing templates. Chicken and egg, or egg and chicken? There are ways around that, such as pre-compiling the tags list in a `before` step, but that is complexity we may want to avoid (I sure do). So, what do we need to make this happen automatically? Time to go sicko-mode on these tags.

We’ll start off the creation of a new collection looking through all the posts, which will contain every single tag — with `new Set()` we ensure all values are unique. In my case, I am excluding tags starting with an underscore, as I consider those “private” (or meta), and thus, they are more of a “collection” tag than a “topic” tag. I haven’t tested what would happen, but I can also imagine this helps keep me away from potential recursion issues.

Once that is done, we need to loop over every tag we found, and create some “sub-pagination” data for it: given our tags are the top level, this is going to be the second level of pagination. I want 5 posts per page, as presented earlier in the categories example with the `PAGE_SIZE` value, but that number can be whatever you want. (well, technically, any *positive integer* kind of number) This also means we need “chunks” (a fixed-length sub-grouping), which will represent our numbered pages. It’s a relatively easy function to create that:

```js:.eleventy.js
function toChunk(array, size = PAGE_SIZE) {
	if (size <= 0) { size = PAGE_SIZE; } // Hey now, let's stay positive
	const chunks = [];
	for (let i = 0; i < array.length; i += size) {
		chunks.push(array.slice(i, i + size)); // Grabs an array of {size} items at a time, adding it to the list of chunks
	}
	return chunks;
}
```

Cool, now we need to do two more things for all these chunks by looping over them: build out their URLs, and construct a data object which mimics Eleventy’s native pagination one. For the URLs, we can set up a `getPageHref` helper function which takes in the chunk index (zero-based) and spits out the final path (including the tag) which in this example can output something like `/tags/rpg/page/2/index.html`. As for the data object, we need the tag itself, as well as a pagination object, and the posts for that page (hey that’s our chunk!). I elected to provide that as an `alias` variable to make edits easier.

The Eleventy pagination object is relatively simple but detailed, so here we’ll add all we need: current page number, whether there’s a previous or next page, a bunch of relative permalinks (first page, previous page, etc.), and the full list of page links and chunks. I have written the word “chunk” too many times, semantic satiation is kicking in…

```js:.eleventy.js{% raw %}
const alias = 'pageItems'; // Data property which will contain the posts of the current sub-pages

eleventyConfig.addCollection('_tags', (collectionApi) => {
	// Retrieve a list of all posts tagged `_posts`, extract their list of tags, flatten to a single-level array, and feed that into Set to deduplicate
	const allTags = Array.from(new Set(
			collectionApi
				.getFilteredByTag('_posts')
				.map((p) => p.data.tags)
				.flat()
		)).filter((t) => t.startsWith('_') === false); // In my setup, tags starting with `_` are "private" and not meant to be seen by users

	// Now iterate over every tag to build out the nested pagination
	const allPostsPerTag = allTags
		.map((t) => {
			// Grab every post of the current tag `t`, sorted by post date in descending order
			const allPostsOfTag = collectionApi.getFilteredByTag(t).sort((a, b) => new Date(b.date) - new Date(a.date));
			const chunkedPostsOfTag = toChunk(allPostsOfTag, PAGE_SIZE); // Convert single array of all posts for the tag, to an array of arrays of N posts
			const maxPageOfTag = chunkedPostsOfTag.length; // e.g 3 chunks = 3 pages
			// Helper to build out the permalink based on the page index
			const getPageHref = (index0) => `/tags/${eleventyConfig.getFilter('slugify')(t)}/${index0 > 0 ? `page/${index0 + 1}/` : ''}index.html`;
			// Now iterate over every chunk to create a page with all the data you'd expect from Eleventy's pagination
			const chunkPages = chunkedPostsOfTag.map((chunk, pageIndex0, allPagesOfTag) => {
				return {
					tag: t, // Our tag context
					// Recreate the useful properties of a top level Eleventy pagination object
					subPagination: {
						alias: alias, // Not sure this is needed but… maybe?
						pageNumber: pageIndex0,
						pageHref: getPageHref(pageIndex0),
						previous: pageIndex0 > 0,
						next: (pageIndex0 + 1) < maxPageOfTag,
						href: {
							first: getPageHref(0),
							previous: pageIndex0 > 0 ? getPageHref(pageIndex0 - 1) : null,
							current: getPageHref(pageIndex0),
							next: (pageIndex0 + 1) < maxPageOfTag ? getPageHref(pageIndex0 + 1) : null,
							last: getPageHref(maxPageOfTag - 1),
						},
						hrefs: Array.apply(null, Array(maxPageOfTag)).map((_, i) => getPageHref(i)), // This generates a list of all the page permalinks for the current tag
						pages: allPagesOfTag, // All the chunks (this is kind of wrong I think but should be useful enough for things like pages.length in a paginator component
					},
					[alias]: chunk,
				};
			});
			return chunkPages; // List of all the pages for the current tag
		})
		.flat(); // Flatten the array of pages
	return allPostsPerTag; // Single flat array of all pages for all tags, fully iterable!
});
{% endraw %}
```

We now have an array (top level) which contains arrays of these sub-pages, but we want to iterate over them as a collection… so, just like before `#Array.flat()` will handle that for us. Because this is built *from* existing data, we don’t need to worry about empty chunks: that should be impossible. And so… finally! A nested but also technically flat collection! With the assumption that we have two files (`postsList.njk` which displays the provided posts, and `paginator.njk` which displays the list of pages) to consume this data to render our HTML, let’s throw that into our template and see what happens.

```js:.eleventy.js{% raw %}
// While I am using a virtual template, you can do the exact same in a regular file
eleventyConfig.addTemplate(
	`content/dlbtag.njk`,
	// Once again due to this being in Nunjucks, the data must be passed via the parent context
	`{% set pagination = tagData.subPagination %}
	<ul>{% for p in tagData.pageItems %}
	<li>{{ p.data.title }}</li>
	{% endfor %}</ul>

	{% include "components/paginator.njk" %}`,
	{
		layout: 'page.njk',
		pagination: {
			data: `collections._dbltags`,
			size: 1,
			alias: 'tagData',
		},
		permalink: `{{ tagData.subPagination.pageHref }}`,
		eleventyExcludeFromCollections: true,
		eleventyComputed: {
			title: (data) => `Tagged: ${data.tagData.tag}` + (data.tagData.subPagination.pageNumber > 0 ? `, page ${data.tagData.subPagination.pageNumber + 1}` : ''),
		},
	}
);
{% endraw %}
```

Well that is neat! A handful of code, to be sure, but still… it works! I will however raise a potential concern: this may not be the fastest way to loop over all this data. In other words, this may slow down your build time depending on how may posts and tags you have.

## tl;dr I just want the full code

Skipping to the good part? Have you not seen the 2006 cinematic masterpiece _Click_ with Adam Sandler and Christopher Walken warning us about the dangers of ——

{% expander "Erm, yeah, check out that code" %}

```js:.eleventy.js{% raw %}
export default async function (eleventyConfig) {
	const PAGE_SIZE = 5; // N posts per page
	const alias = 'pageItems'; // Data property which will contain the posts of the current sub-pages

	function toChunk(array, size = PAGE_SIZE) {
		if (size <= 0) { size = PAGE_SIZE; } // Hey now, let's stay positive
		const chunks = [];
		for (let i = 0; i < array.length; i += size) {
			chunks.push(array.slice(i, i + size)); // Grabs an array of {size} items at a time, adding it to the list of chunks
		}
		return chunks;
	}

	eleventyConfig.addCollection('_tags', (collectionApi) => {
		// Retrieve a list of all posts tagged `_posts`, extract their list of tags, flatten to a single-level array, and feed that into Set to deduplicate
		const allTags = Array.from(new Set(
				collectionApi
					.getFilteredByTag('_posts')
					.map((p) => p.data.tags)
					.flat()
			)).filter((t) => t.startsWith('_') === false); // In my setup, tags starting with `_` are "private" and not meant to be seen by users
		const alias = 'pageItems'; // Data property which will contain the posts of the current sub-pages
		
		// Now iterate over every tag to build out the nested pagination
		const allPostsPerTag = allTags
			.map((t) => {
				// Grab every post of the current tag `t`, sorted by post date in descending order
				const allPostsOfTag = collectionApi.getFilteredByTag(t).sort((a, b) => new Date(b.date) - new Date(a.date));
				const chunkedPostsOfTag = toChunk(allPostsOfTag, PAGE_SIZE); // Convert single array of all posts for the tag, to an array of arrays of N posts
				const maxPageOfTag = chunkedPostsOfTag.length; // e.g 3 chunks = 3 pages
				// Helper to build out the permalink based on the page index
				const getPageHref = (index0) => `/tags/${eleventyConfig.getFilter('slugify')(t)}/${index0 > 0 ? `page/${index0 + 1}/` : ''}index.html`;
				// Now iterate over every chunk to create a page with all the data you'd expect from Eleventy's pagination
				const chunkPages = chunkedPostsOfTag.map((chunk, pageIndex0, allPagesOfTag) => {
					return {
						tag: t, // Our tag context
						// Recreate the useful properties of a top level Eleventy pagination object
						subPagination: {
							alias: alias, // Not sure this is needed but… maybe?
							pageNumber: pageIndex0,
							pageHref: getPageHref(pageIndex0),
							previous: pageIndex0 > 0,
							next: (pageIndex0 + 1) < maxPageOfTag,
							href: {
								first: getPageHref(0),
								previous: pageIndex0 > 0 ? getPageHref(pageIndex0 - 1) : null,
								current: getPageHref(pageIndex0),
								next: (pageIndex0 + 1) < maxPageOfTag ? getPageHref(pageIndex0 + 1) : null,
								last: getPageHref(maxPageOfTag - 1),
							},
							hrefs: Array.apply(null, Array(maxPageOfTag)).map((_, i) => getPageHref(i)), // This generates a list of all the page permalinks for the current tag
							pages: allPagesOfTag, // All the chunks (this is kind of wrong I think but should be useful enough for things like pages.length in a paginator component
						},
						[alias]: chunk,
					};
				});
				return chunkPages; // List of all the pages for the current tag
			})
			.flat(); // Flatten the array of pages
		return allPostsPerTag; // Single flat array of all pages for all tags, fully iterable!
	});

	// While I am using a virtual template, you can do the exact same in a regular file
	eleventyConfig.addTemplate(
		`content/dlbtag.njk`,
		// Once again due to this being in Nunjucks, the data must be passed via the parent context
		`{% set pagination = tagData.subPagination %}
		<ul>{% for p in tagData.pageItems %}
		<li>{{ p.data.title }}</li>
		{% endfor %}</ul>

		{% include "components/paginator.njk" %}`,
		{
			layout: 'page.njk',
			pagination: {
				data: `collections._dbltags`,
				size: 1,
				alias: 'tagData',
			},
			permalink: `{{ tagData.subPagination.pageHref }}`,
			eleventyExcludeFromCollections: true,
			eleventyComputed: {
				title: (data) => `Tagged: ${data.tagData.tag}` + (data.tagData.subPagination.pageNumber > 0 ? `, page ${data.tagData.subPagination.pageNumber + 1}` : ''),
			},
		}
	);
}
{% endraw %}
```

{% endexpander %}

## Bonus: paginator component

While we’re here, I might as well share the paginator “component” I built. It is a little more readable in Vento thanks to the JS syntax but I converted it to Nunjucks should you need it — though it is BYOS (Bring Your Own Styles): that’s the fun part!

```njk:paginator.njk{% raw %}
{% set currentPage = pagination.pageNumber + 1 %}
{% set totalPages = pagination.pages.length %}
{% set adjacentLinks = 2 %}
{# If this is near or at a boundary (first/last), we'll show one or two more from the opposite side #}
{% set beforeLimit = currentPage - adjacentLinks - (2 if (currentPage === totalPages) else (1 if ((currentPage + adjacentLinks) > totalPages) else 0)) %}
{% set afterLimit = currentPage + adjacentLinks + (2 if (currentPage === 1) else (1 if ((currentPage - adjacentLinks) < 1) else 0)) %}

{% if totalPages > 1 %}
<nav aria-label="Pages for {{ tag }}">
	<p class="visually-hidden" id="pagination">Pages:</p>
	<ul class="pagination" aria-labelledby="pagination">
		{# First page #}
		{% if currentPage > 1 %}
		<li class="pagination-item pagination-item--first">
			<a href="{{ pagination.href.first }}" class="pagination-link" aria-label="First page">
				&laquo;
			</a>
		</li>
		{% endif %}

		{# Previous page #}
		{% if pagination.previous %}
		<li class="pagination-item pagination-item--previous">
			<a href="{{ pagination.href.previous }}" rel="prev" class="pagination-link" aria-label="Previous page">
				&lsaquo;
			</a>
		</li>
		{% endif %}

		{% for n0 in range(0, totalPages) %}
			{% set n = n0 + 1 %}
			{# Show links that are within the adjacent limit (minus or plus) #}
			{% if n >= beforeLimit and n <= afterLimit %}
			<li class="pagination-item">
				<a href="{{ pagination.hrefs[n0] }}" class="pagination-link" {% if n == currentPage %}aria-current="page"{% endif %} aria-label="Page {{ n }}">
					{{ n }}
				</a>
			</li>
			{% endif %}
		{% endfor %}

		{# Next page #}
		{% if pagination.next %}
		<li class="pagination-item pagination-item--next">
			<a href="{{ pagination.href.next }}" rel="next" class="pagination-link" aria-label="Next page">
				&rsaquo;
			</a>
		</li>
		{% endif %}

		{# Last page #}
		{% if currentPage < totalPages %}
		<li class="pagination-item pagination-item--last">
			<a href="{{ pagination.href.last }}" class="pagination-link" aria-label="Last page">
				&raquo;
			</a>
		</li>
		{% endif %}
	</ul>
</nav>
{% endif %}
{% endraw %}
```

{% callout %}
In Nunjucks, a ternary expression looks like `ifValue if (trueCondition) else elseValue`, as opposed to JavaScript’s `(trueCondition) ? ifValue : elseValue`. The parentheses are optional but they sure make things legible to me, despite, in this case, `beforeLimit` and `afterLimit` bordering on unhinged territory.
{% endcallout %}

Whew, what a ride. I should write about VentoJS because it is cool. I should also write some sort of helper to paginate… a plugin might be cool, but the configuration would need to be very customisable… ah well, an idea for another day. For now, I hope this helped you in one way or another!

Go forth and paginate! Also here's a meme from yesteryear because I am a cool and hip.

{% image "./yodawg.jpg" | toRoot, "A terribly old meme of famous rapper Xzibit laughing, captioned: Yo dawg, I heard you liked pagination, so I added pagination inside your paginated pages, so you can paginate while you paginate.", null, { ratio: 500/320 } %}
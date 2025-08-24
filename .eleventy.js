//* Imports
import 'dotenv/config';
import assets from './src/_data/assets.js';

import assetCompiler from './config/before/asset-compiler.js';

import stringFilters from './config/filters/strings.js';
import numberFilters from './config/filters/numbers.js';
import arrayFilters from './config/filters/arrays.js';
import objectFilters from './config/filters/objects.js';
import dateFilters from './config/filters/dates.js';
import urlFilters from './config/filters/urls.js';
import { default as minifierFilters, cachedJsmin, cachedCssmin } from './config/filters/minifiers.js';

import callout from './config/shortcodes/callout.js';
import codeview from './config/shortcodes/codeview.js';
import embed from './config/shortcodes/embed.js';
import expander from './config/shortcodes/expander.js';
import renderInclude from './config/shortcodes/render-include.js';
import mediaGallery from './config/shortcodes/media-gallery.js';

import markdownLibrary from './config/libraries/markdown.js';

import cssTransforms from './config/transforms/css.js';

import markdownIt from 'markdown-it';
import { EleventyRenderPlugin, BundlePlugin } from '@11ty/eleventy';
import pluginRss from '@11ty/eleventy-plugin-rss';
import pageAssetsPluginMxbckFix from 'eleventy-plugin-page-assets';
import pluginSyntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight';
import { VentoPlugin } from 'eleventy-plugin-vento';
import EleventyPluginRobotsTxt from 'eleventy-plugin-robotstxt';

//* Constants
const rootDir = 'src'; // Root folder
const outputDir = '_site'; // Build destination folder
const includesDir = '_includes'; // Includes folder
const partsDir = `${includesDir}/parts`; // Layout parts folder
const layoutsDir = `${includesDir}/layouts`; // Layouts folder
const assetsDir = `_assets`; // Assets folder
const BUILD_CONTEXT = process?.env?.BUILD_CONTEXT || 'LIVE';
const md = new markdownIt({ html: true, breaks: true, linkify: true }).disable('code');
const purgeCssList = {
	_global: { safe: [/^\:[-a-z]+$/, 'translated-rtl', 'data-tooltip-pos'], block: [] }, // Preserve any pseudo-class for now (thanks laurentpayot; still broken in 6.0 https://github.com/FullHuman/purgecss/issues/978)
	home: { safe: ['data-section=home'], block: ['data-section=about'] },
	about: { safe: ['data-section=about'], block: ['data-section=home'] },
};

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function (eleventyConfig) {
	//* Plugins
	eleventyConfig.addPlugin(EleventyRenderPlugin, { accessGlobalData: true });
	eleventyConfig.addPlugin(BundlePlugin, {
		toFileDirectory: 'assets',
		transforms: [
			async function (content) {
				// Don't cache empty buckets
				if ((content || '').trim().length === 0) {
					return content;
				}
				switch (this.type) {
					case 'js': {
						return cachedJsmin(content, `BUCKET:${String(this.buckets)}`);
					}
					case 'css': {
						return cachedCssmin(content, `BUCKET:${String(this.buckets)}`);
					}
					default: {
						return content;
					}
				}
			},
		],
	});
	eleventyConfig.addPlugin(stringFilters);
	eleventyConfig.addPlugin(numberFilters);
	eleventyConfig.addPlugin(arrayFilters);
	eleventyConfig.addPlugin(objectFilters);
	eleventyConfig.addPlugin(dateFilters);
	eleventyConfig.addPlugin(urlFilters);
	eleventyConfig.addPlugin(minifierFilters, { useCache: true });
	eleventyConfig.addPlugin(pageAssetsPluginMxbckFix, {
		mode: 'directory',
		postsMatching: [
			`${rootDir}/content/pages/**/index.{vto,njk,md}`, // Regular pages
			`${rootDir}/content/posts/**/index.{vto,njk,md}`, // Regular posts
			`${rootDir}/content/projects/**/index.{vto,njk,md}`, // Projects
			`${rootDir}/content/fonts/*/*.{vto,njk}`, // Fonts
		],
		assetsMatching: '*.jpg|*.png|*.gif|*.mp4|*.otf|*.woff|*.woff2|*.zip', // Images, videos, fonts, and archives
		silent: true,
	});
	eleventyConfig.addPlugin(pluginSyntaxHighlight, {
		languages: ['md', 'html', 'njk', 'vto', 'css', 'js', 'scss', 'text', 'php', 'json'],
		preAttributes: {
			tabindex: 0,
			class: (context) => `${context.language ? 'language-' + context.language : ''} codeblock-pre`.trim(),
		},
		init: function ({ Prism }) {
			// Avoids re-running some logic for each save/rebuild
			if (Prism.hasOwnProperty('__CUSTOM_OVERRIDES_ARE_PREPARED__') === false) {
				Prism.__CUSTOM_OVERRIDES_ARE_PREPARED__ = false;
			}

			Prism.languages.njk = Object.assign({}, Prism.languages.django);
			Prism.languages.vto = Object.assign({}, Prism.languages.django, {
				comment: /^\{\{#[\s\S]*?#\}\}$/,
				tag: {
					pattern: /(^\{\{[>+-]?\s*)(?!async|await|echo|else|export|for|from|function|if|import|in|of|set|typeof|while)\b/,
					lookbehind: true,
					alias: 'variable',
				},
				delimiter: {
					pattern: /^\{\{[>+-]?|[+-]?\}\}$/,
					alias: 'punctuation',
				},
				// filter: {
				// 	pattern: /(?<=\|>\s*)(\w+)/,
				// 	alias: 'function',
				// },
				punctuation: /(?:\|>|[{}[\](),.:;])/, // The usual plus |>
				keyword: /\b(?:async|await|echo|else|export|for|from|function|if|import|in|of|set|typeof|while)\b/,
				// operator: /--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/, // JS operators
				operator: /--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|(?:((?!|)>)|((?<!\|)>)|([-+*/%&^!=<]))=?|\.{3}|\?\?=?|\?\.?|[~:]/, // JS operators, sans |> matching
				boolean: /false|true/,
			}); // Close enough?

			let patternForNunjucks = /\{\{[\s\S]*?\}\}|\{%[\s\S]*?%\}|\{#[\s\S]*?#\}/g;
			let patternForVento = /\{\{>?[\s\S]*?\}\}|\{\{#[\s\S]*?#\}\}/g;
			let markupTemplating = Prism.languages['markup-templating'];

			if (!Prism.__CUSTOM_OVERRIDES_ARE_PREPARED__) {
				Prism.__CUSTOM_OVERRIDES_ARE_PREPARED__ = true;
				Prism.hooks.add('before-tokenize', function (env) {
					markupTemplating.buildPlaceholders(env, 'njk', patternForNunjucks);
				});
				Prism.hooks.add('after-tokenize', function (env) {
					markupTemplating.tokenizePlaceholders(env, 'njk');
				});

				Prism.hooks.add('before-tokenize', function (env) {
					markupTemplating.buildPlaceholders(env, 'vto', patternForVento);
				});
				Prism.hooks.add('after-tokenize', function (env) {
					markupTemplating.tokenizePlaceholders(env, 'vto');
				});
			}
		},
	});
	eleventyConfig.addPlugin(pluginRss);
	eleventyConfig.addPlugin(assetCompiler, { fontsDir: '/assets/fonts' });
	eleventyConfig.addPlugin(mediaGallery, { galleryClasses: ['image-gallery'] });
	eleventyConfig.addPlugin(callout, { markdownEngine: md });
	eleventyConfig.addPlugin(codeview);
	eleventyConfig.addPlugin(embed, { markdownEngine: md });
	eleventyConfig.addPlugin(expander);
	eleventyConfig.addPlugin(markdownLibrary, {
		attrsLeftDelimiter: '{$',
		attrsRightDelimiter: '$}',
		attrsAllowedAttributes: ['id'],
		anchorClass: 'heading-anchor',
		outerCustomElement: 'code-wrap',
		outerCustomElementAttrs: { class: 'codeblock', 'copy-label': '📋 Copy', 'copy-class': 'button', 'copy-done-label': '✅ Done' },
		codeWrapTag: 'figure',
		codeWrapToolbar: true,
		hasCopyButton: false,
		inlineCopyHandler: false,
		codeToolbarTag: 'figcaption',
		codeToolbarClass: 'codeblock-toolbar',
		codeToolbarLabel: (tokens, idx, options, env, self) => {
			// If a "filename" is provided, isolate it
			if (tokens[idx].info.includes(':')) {
				const [lang, filename] = tokens[idx].info.split(':');
				tokens[idx].info = lang || 'text'; // Reset to a "normal" type
				tokens[idx]._filename = filename; // Create a private property
			}

			let toolbarLabel = '';
			let toolbarIcon = '';
			let syntaxType = tokens[idx].info;

			let toolbarIconRef = '';
			toolbarLabel = syntaxType.toUpperCase();
			switch (syntaxType) {
				case 'js': {
					toolbarLabel = 'JavaScript';
					toolbarIconRef = 'js';
					break;
				}
				case 'json': {
					toolbarLabel = 'JSON';
					toolbarIconRef = 'json';
					break;
				}
				case 'njk': {
					toolbarLabel = 'Nunjucks';
					toolbarIconRef = 'nunjucks';
					break;
				}
				case 'vto': {
					toolbarLabel = 'Vento';
					toolbarIconRef = 'vento';
					break;
				}
				case 'html': {
					toolbarIconRef = 'html';
					break;
				}
				case 'css': {
					toolbarIconRef = 'css';
					break;
				}
				case 'php': {
					toolbarIconRef = 'php';
					break;
				}
				case 'sass':
				case 'scss': {
					toolbarIconRef = 'sass';
					break;
				}
				case 'text':
				case '':
				default: {
					toolbarLabel = tokens[idx]?._filename || '';
					toolbarIconRef = 'code';
				}
			}

			if (toolbarIconRef) {
				toolbarIcon = eleventyConfig.getShortcode('svg')(`${toolbarIconRef}-icon`, { class: 'inline-icon inline-icon--center' });
			}

			// If a filename was provided, use that as a label instead
			if (tokens[idx]?._filename) {
				// If it's a file without an extension, add it at the end
				toolbarLabel = tokens[idx]._filename.includes('.') ? tokens[idx]._filename : tokens[idx]._filename + '.' + syntaxType;
			}

			// If no type or filename was given, add a visually hidden label
			if (!toolbarLabel) {
				toolbarLabel = `<span class="visually-hidden">Code block</span>`;
			}

			return `<span class="codeblock-toolbar-label">${[toolbarIcon, toolbarLabel].join(' ').trim()}</span>`;
		},
	});
	eleventyConfig.addPlugin(EleventyPluginRobotsTxt, { shouldBlockAIRobots: 'true' });

	//* Collections
	eleventyConfig.addCollection('_posts.en', (collectionApi) => collectionApi.getFilteredByTag('_posts').filter((item) => ['en', undefined].includes(item.data.lang)));
	eleventyConfig.addCollection('_posts.fr', (collectionApi) => collectionApi.getFilteredByTag('_posts').filter((item) => item.data.lang === 'fr'));
	eleventyConfig.addCollection('_posts.featured', (collectionApi) => collectionApi.getFilteredByTag('_posts').filter((item) => item.data.featured));
	eleventyConfig.addCollection('_posts.not_featured', (collectionApi) => collectionApi.getFilteredByTag('_posts').filter((item) => !item.data.featured));

	//* Filters
	eleventyConfig.addPlugin(renderInclude, {
		svgAssetFolder: `./${rootDir}/${includesDir}/assets/svg`,
		componentsFolder: `./${rootDir}/${includesDir}/components`,
		isSvgCached: true, //BUILD_CONTEXT === 'LIVE', // While serving locally, set to `false` if editing SVG assets so the cache doesn't persist across builds
	});

	//* Transforms
	eleventyConfig.addPlugin(cssTransforms, {
		placeholder: assets.inlineCssPlaceholder,
		pathToCss: [`./${rootDir}/${includesDir}/assets/css/style.css`],
		dynamicAttributes: ['data-theme', 'aria-pressed', 'href'],
		safelist: purgeCssList._global.safe,
		blocklist: purgeCssList._global.block,
		getPageList: function (outputPath) {
			if (outputPath === `${outputDir}/index.html`) {
				return purgeCssList.home;
			} else if (outputPath === `${outputDir}/about/index.html`) {
				return purgeCssList.about;
			}
		},
	});

	//* Vento templating (needs to be added last)
	eleventyConfig.addPlugin(VentoPlugin, { autotrim: false });

	//* Passthroughs
	eleventyConfig.addPassthroughCopy({
		[`${rootDir}/_includes/assets/css/`]: '/assets/css/',
		[`${rootDir}/_assets/fonts/`]: '/assets/fonts/',
		[`${rootDir}/_assets/img/`]: '/assets/img/',
		[`${rootDir}/_assets/vid/`]: '/assets/vid/',
		// [`${rootDir}/_includes/assets/svg/footer-deco-*.svg`]: '/assets/svg/',
		[`${rootDir}/favicon.ico`]: '/favicon.ico',
		[`${rootDir}/ai.txt`]: '/ai.txt',
	});

	//* Options for development
	eleventyConfig.addWatchTarget(`./${rootDir}/${assetsDir}/css/**/*.css`);
	eleventyConfig.addWatchTarget(`./${rootDir}/${assetsDir}/js/**/*.js`);
	eleventyConfig.setConcurrency(1);

	// The following resources are built in the `before` step, so we must not watch them, lest we want to trigger a build loop
	eleventyConfig.watchIgnores.add(`./${rootDir}/${assetsDir}/css/global/_tokens.css`);
	eleventyConfig.watchIgnores.add(`./${rootDir}/${assetsDir}/css/font-face.css`);
	eleventyConfig.watchIgnores.add(`./${rootDir}/${includesDir}/assets/css/**/*`);
	eleventyConfig.watchIgnores.add(`./${rootDir}/${includesDir}/assets/js/**/*`);

	eleventyConfig.setServerOptions({
		domDiff: false, // Due to runtime JS (mainly themes), it is preferable to get a fresh copy of the DOM
	});

	return {
		pathPrefix: '/',
		templateFormats: ['md', 'vto', 'njk', '11ty.js'],
		markdownTemplateEngine: 'vto',
		htmlTemplateEngine: 'vto',
		passthroughFileCopy: true,
		dir: {
			input: rootDir,
			output: outputDir,
			includes: includesDir,
			layouts: layoutsDir,
		},
	};
}

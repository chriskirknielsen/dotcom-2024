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
import codepen from './config/shortcodes/codepen.js';
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
import EleventyPluginRobotsTxt from 'eleventy-plugin-robotstxt';

//* Constants
const rootDir = 'src'; // Root folder
const outputDir = '_site'; // Build destination folder
const includesDir = '_includes'; // Includes folder
const partsDir = `${includesDir}/parts`; // Layout parts folder
const layoutsDir = `${includesDir}/layouts`; // Layouts folder
const assetsDir = `_assets`; // Assets folder
const BUILD_CONTEXT = process?.env?.BUILD_CONTEXT || 'LIVE';
const md = new markdownIt().disable('code');
const purgeCssList = {
	_global: { safe: [/^\:[-a-z]+$/, 'translated-rtl'], block: [] }, // Preserve any pseudo-class for now (thanks laurentpayot; still broken in 6.0 https://github.com/FullHuman/purgecss/issues/978)
	home: { safe: ['data-section=home'], block: ['data-section=about'] },
	about: { safe: ['data-section=about'], block: ['data-section=home'] },
};

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function (eleventyConfig) {
	//* Plugins
	eleventyConfig.addPlugin(EleventyRenderPlugin);
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
			`${rootDir}/content/pages/**/index.{njk,md}`, // Regular pages
			`${rootDir}/content/posts/**/index.{njk,md}`, // Regular posts
			`${rootDir}/content/projects/**/index.{njk,md}`, // Projects
			`${rootDir}/content/fonts/*/*.njk`, // Fonts
		],
		assetsMatching: '*.jpg|*.png|*.gif|*.mp4|*.otf|*.woff|*.woff2|*.zip', // Images, videos, fonts, and archives
		silent: true,
	});
	eleventyConfig.addPlugin(pluginSyntaxHighlight, {
		templateFormats: ['md', 'html', 'njk'],
		preAttributes: {
			tabindex: 0,
			class: (context) => `${context.language ? 'language-' + context.language : ''} codeblock-pre`.trim(),
		},
	});
	eleventyConfig.addPlugin(pluginRss);
	eleventyConfig.addPlugin(assetCompiler, { fontsDir: '/assets/fonts' });
	eleventyConfig.addPlugin(mediaGallery, { galleryClasses: ['image-gallery'] });
	eleventyConfig.addPlugin(callout, { markdownEngine: md });
	eleventyConfig.addPlugin(codeview);
	eleventyConfig.addPlugin(codepen);
	eleventyConfig.addPlugin(expander);
	eleventyConfig.addPlugin(markdownLibrary, {
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
			let syntaxType = tokens[idx].info;

			if (!syntaxType || syntaxType === 'text') {
				toolbarLabel = tokens[idx]?._filename || '';
			} else if (tokens[idx]?._filename) {
				toolbarLabel = tokens[idx]._filename.includes('.') ? tokens[idx]._filename : tokens[idx]._filename + '.' + syntaxType;
			} else {
				switch (syntaxType) {
					case 'js': {
						toolbarLabel = 'JavaScript';
						break;
					}
					case 'njk': {
						toolbarLabel = 'Nunjucks';
						break;
					}
					default: {
						toolbarLabel = syntaxType.toUpperCase();
						break;
					}
				}
			}

			return `<span class="codeblock-toolbar-label">${toolbarLabel}</span>`;
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
		cacheSvg: BUILD_CONTEXT === 'LIVE', // While serving locally, set to `false` if editing SVG assets so the cache doesn't persist across builds
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

	//* Passthroughs
	eleventyConfig.addPassthroughCopy({
		[`${rootDir}/_includes/assets/css/`]: '/assets/css/',
		[`${rootDir}/_assets/fonts/`]: '/assets/fonts/',
		[`${rootDir}/_assets/img/`]: '/assets/img/',
		// [`${rootDir}/_includes/assets/svg/footer-deco-*.svg`]: '/assets/svg/',
		[`${rootDir}/favicon.ico`]: '/favicon.ico',
		[`${rootDir}/ai.txt`]: '/ai.txt',
	});

	//* Options for development
	eleventyConfig.addWatchTarget(`./${rootDir}/${assetsDir}/css/**/*.css`);
	eleventyConfig.addWatchTarget(`./${rootDir}/${assetsDir}/js/**/*.js`);

	// The following ressources are built in the `before` step, so we must not watch them, lest we want to trigger a build loop
	eleventyConfig.watchIgnores.add(`./${rootDir}/${assetsDir}/css/global/_tokens.css`);
	eleventyConfig.watchIgnores.add(`./${rootDir}/${assetsDir}/css/font-face.css`);
	eleventyConfig.watchIgnores.add(`./${rootDir}/${includesDir}/assets/css/**/*`);
	eleventyConfig.watchIgnores.add(`./${rootDir}/${includesDir}/assets/js/**/*`);

	eleventyConfig.setServerOptions({
		domDiff: false, // Due to runtime JS (mainly themes), it is preferrable to get a fresh copy of the DOM
	});

	return {
		pathPrefix: '/',
		markdownTemplateEngine: 'njk',
		htmlTemplateEngine: 'njk',
		passthroughFileCopy: true,
		dir: {
			input: rootDir,
			output: outputDir,
			includes: includesDir,
			layouts: layoutsDir,
		},
	};
}

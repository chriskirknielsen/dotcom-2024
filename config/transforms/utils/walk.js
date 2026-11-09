import path from 'node:path';
import { readdir } from 'node:fs/promises';

/**
 * Recursively walk files in a directory using a async generator
 * @param  {string} dir Path to walk
 * @return {type} {description}
 *
 * @example
 * (async () => {
 *   for await (const f of getFiles('.')) {
 *       console.log(f);
 *   }
 * })()
 */
async function* getFiles(dir) {
	const list = await readdir(dir, { withFileTypes: true });
	for (const item of list) {
		const itemPath = path.join(dir, item.name);
		if (item.isDirectory()) {
			yield* getFiles(itemPath);
		} else {
			yield itemPath;
		}
	}
}

export default getFiles;

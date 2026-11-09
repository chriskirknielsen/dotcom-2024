import fs from 'node:fs';

export default async function resolveFile(filePath) {
	try {
		await fs.promises.access(filePath, fs.F_OK);
		return true;
	} catch (error) {
		console.error(__dirname, error);
		return false;
	}
}

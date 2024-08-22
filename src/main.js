import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { getSubmissions } from "./api.js";
import { Logger } from "./logger.js";

import * as constants from "./constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const startTime = Date.now();

const logs = new Logger("example.js");


const submissions = await getSubmissions();

for (const submission of submissions) {
	if (submission.status_display !== "Accepted" 
		|| submission.is_pending !== "Not Pending") {
		continue;
	}
	logs.logInfo(submission);

	let fileExtension = "txt";
	if (constants.LANG_TO_FILE_EXTENSION[submission.lang] != null) {
		fileExtension = constants.LANG_TO_FILE_EXTENSION[submission.lang];
	}

	mkdirSync(join(__dirname, constants.REPO_PATH, submission.title), {recursive: true});
	writeFileSync(join(__dirname, constants.REPO_PATH, submission.title, `${submission.id}.${fileExtension}`), submission.code);
}


const endTime = Date.now();
logs.logInfo(`Total Operation took: ${(endTime - startTime) / 1000} seconds`);

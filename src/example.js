import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { getSubmissions } from "./api.js";
import { Logger } from "./logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const startTime = Date.now();

const logs = new Logger("example.js");


const submissions = await getSubmissions(false, 5);
logs.logInfo({"submissions": submissions});

for (const submission of submissions) {
	if (submission.status_display !== "Accepted" 
		|| submission.is_pending !== "Not Pending") {
		continue;
	}

	let fileExtension = "";

	if (submission.lang === "python3") {
		fileExtension = ".py";
	}
	else if (submission.lang === "cpp") {
		fileExtension = ".cpp";
	}
	else if (submission.lang === "javascript") {
		fileExtension = ".js";
	}
	else if (submission.lang === "java") {
		fileExtension = ".class";
	}

	// todo check what characters should be replaced in submission.title
	mkdirSync(join(__dirname, "../extracted", submission.title), {recursive: true});
	writeFileSync(join(__dirname, "../extracted", submission.title, '' + submission.id + fileExtension), submission.code);
}


const endTime = Date.now();
logs.logInfo(`Total Operation took: ${(endTime - startTime) / 1000} seconds`);
logs.writeLogs();
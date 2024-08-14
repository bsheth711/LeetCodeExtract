import { sendRequest } from "./api.js";
import { Logger } from "./logger.js";
import { readFileSync, writeFileSync } from 'node:fs';

const limit = 20;
const logs = new Logger("example.js");
let extractedIds = new Set();

// todo refactor
extractedIds = new Set(readFileSync("./extracted.csv").toString().split("\n"));

const startTime = Date.now();
let hasNext = true;
for (let i = 0; (i < 100) && hasNext; ++i) {
	const offset = i * 20;

	const data = await sendRequest(
		`/api/submissions/?offset=${offset}&limit=${limit}&lastkey=`, 
		{method: "GET"}
	);

	if (data == null) {
		continue;
	}

	hasNext = data.has_next;

	for (const submission of data.submissions_dump) {
		const id = submission.id.toString()
		if (extractedIds.has(id)) {
			hasNext = false;
		}
		extractedIds.add(id);
	}

}

writeFileSync("./extracted.csv", [...extractedIds].join("\n"));

const endTime = Date.now();

logs.logInfo(`Total Operation took: ${(endTime - startTime) / 1000} seconds`);
logs.writeLogs();
import { sendRequest } from "./api.js";
import { Logger } from "./logger.js";

const limit = 20;
const logs = new Logger("example.js");

const startTime = Date.now();
for (let i = 0; i < 5; ++i) {
	const offset = i * 20;

	const data = await sendRequest(
		`/api/submissions/?offset=${offset}&limit=${limit}&lastkey=`, 
		{method: "GET"}
	);

}
const endTime = Date.now();

logs.logInfo(`Total Operation took: ${(endTime - startTime) / 1000} seconds`);
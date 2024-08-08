import * as constants from "./constants.js";
import { sendRequest } from "./api.js";

const limit = 20;

const startTime = Date.now();
for (let offset = 0; offset < 500; offset += 20) {
	const data = await sendRequest(`/api/submissions/?offset=${offset}&limit=${20}&lastkey=`, 
		{method: "GET"}
	);
}
const endTime = Date.now();

console.log((endTime - startTime) / 1000);


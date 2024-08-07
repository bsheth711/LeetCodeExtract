import * as constants from "./constants.js";
import { sendRequest } from "./api.js";

const offset = 0;
const limit = 20;

const startTime = Date.now();
for (let i = 0; i < 40; ++i) {
	const data = await sendRequest(`/api/submissions/?offset=${offset}&limit=${limit}&lastkey=`, 
		{method: "GET"}
	);
}
const endTime = Date.now();

console.log((endTime - startTime) / 1000);


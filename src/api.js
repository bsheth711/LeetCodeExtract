import * as constants from "./constants.js";
import { readFileSync } from 'node:fs';
import {Logger} from "./logger.js";

const credentialsFilePath = process.env.LEETCODE_CREDENTIALS_PATH;
const CREDS = JSON.parse(readFileSync(credentialsFilePath).toString());
/*
must set environment variable LEETCODE_CREDENTIALS_PATH
credentials file format (keep it safe!):
{
	"LEETCODE_SESSION": "...",
	"csrftoken": "..."
}
*/

export const logs = new Logger();
const requestTimes = [];

// todo: add retryLimit and exponential backoff
export async function sendRequest(path, requestInit) {
	logs.log("sendRequest started");
	if (requestInit.headers == null) {
		requestInit.headers = {Cookie: `LEETCODE_SESSION=${CREDS.LEETCODE_SESSION};csrftoken=${CREDS.csrftoken}`};
	}
	else {
		requestInit.headers.Cookie = `LEETCODE_SESSION=${CREDS.LEETCODE_SESSION};csrftoken=${CREDS.csrftoken}`;
	}

	await limit();

	logs.log("sending request");
	const data = await fetch(`${constants.BASE_URL}${path}`, requestInit)
		.then((response) => {
			logs.log(response.status);
			return response.json();
		});	
		
	logs.log("adding req time");
	requestTimes.push(Date.now());

	return data;
}

async function limit() {
	removeRequestTimesBeyondInterval();

	if (constants.CONFIG.LimitType === constants.LimitType.EVEN_PACED) {
		await sleep(Math.floor(constants.INTERVAL_IN_MS / (1.5 * constants.MAXIMUM_REQUESTS_PER_INTERVAL)));	
	}

	while (requestTimes.length >= constants.MAXIMUM_REQUESTS_PER_INTERVAL) {
		logs.log("waiting");

		removeRequestTimesBeyondInterval();

		await sleep(Math.floor(constants.INTERVAL_IN_MS / (2 * constants.MAXIMUM_REQUESTS_PER_INTERVAL)));	
	}
}

function removeRequestTimesBeyondInterval() {
	let requestTime = null;
	if (requestTimes.length > 0) {
		requestTime = requestTimes[0];
	}
	let time = Date.now();
	logs.log(`time: ${time}, requestTime: ${requestTime}, val ${time - requestTime > constants.INTERVAL_IN_MS}`);
	while ((requestTime != null) && (Date.now() - requestTime > constants.INTERVAL_IN_MS)) {
		logs.log("shifting");
		requestTime = requestTimes.shift();
	}
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
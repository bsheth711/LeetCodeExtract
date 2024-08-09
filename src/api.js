import * as constants from "./constants.js";
import { readFileSync } from 'node:fs';
import {Logger} from "./logger.js";
import config from "../config.json" assert { type: 'json' };

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

export const logs = new Logger("api.js");
const requestTimes = [];

// todo: add retryLimit and exponential backoff
export async function sendRequest(path, requestInit) {
	if (requestInit.headers == null) {
		requestInit.headers = {Cookie: `LEETCODE_SESSION=${CREDS.LEETCODE_SESSION};csrftoken=${CREDS.csrftoken}`};
	}
	else {
		requestInit.headers.Cookie = `LEETCODE_SESSION=${CREDS.LEETCODE_SESSION};csrftoken=${CREDS.csrftoken}`;
	}

	await limit();
	const endpoint = `${constants.BASE_URL}${path}`;

	if (config.logRequestsAndResponses) {
		logs.logInfo({"Sending Request": {endpoint, requestInit}});
	}

	const data = await fetch(endpoint, requestInit)
		.then((response) => {
			if (response.status != constants.OK_STATUS) {
				logs.logError({"BAD RESPONSE": response});
			}
			return response.json();
		});	

	if (config.logRequestsAndResponses) {
		logs.logInfo({"Response Recieved": data});
	}
		
	requestTimes.push(Date.now());

	return data;
}

async function limit() {
	removeRequestTimesBeyondInterval();

	logs.logInfo("Waiting for requestTimes to open up.");
	if (config.limitType === constants.LimitType.EVEN_PACED) {
		await sleep(Math.floor(config.intervalInMs / (1.5 * config.maximumRequestsPerInterval)));	
	}

	while (requestTimes.length >= config.maximumRequestsPerInterval) {

		removeRequestTimesBeyondInterval();

		await sleep(Math.floor(config.intervalInMs / (2 * config.maximumRequestsPerInterval)));	
	}
}

function removeRequestTimesBeyondInterval() {
	let requestTime = null;
	if (requestTimes.length > 0) {
		requestTime = requestTimes[0];
	}

	let time = Date.now();

	while ((requestTime != null) && (Date.now() - requestTime > config.intervalInMs)) {
		requestTime = requestTimes.shift();
	}
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
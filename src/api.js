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

export async function sendRequest(path, requestInit, wait = 0, retryCount = 0) {
	const endpoint = `${constants.BASE_URL}${path}`;

	if (retryCount > config.retryLimit) {
		logs.logError({"Maximum number of retries attempted": {endpoint, requestInit}});
		return null;
	}

	addCookieTokensToRequest(requestInit);

	await sleep(wait);
	await limit();

	if (config.logRequestsAndResponses) {
		logs.logInfo({"Sending Request": {endpoint, requestInit}});
	}

	requestTimes.push(Date.now());

	const data = await fetch(endpoint, requestInit)
		.then((response) => {
			if (response.status !== constants.OK_STATUS) {
				logs.logError({"BAD RESPONSE": response});
				if (wait === 0) {
					wait = 200;
				}
				return sendRequest(path, requestInit, wait * 2, retryCount + 1);
			}
			return response.json();
		});	

	if (config.logRequestsAndResponses) {
		logs.logInfo({"Response Recieved": data});
	}
		
	return data;
}

function addCookieTokensToRequest (requestInit) {
	if (requestInit) {
		if (!requestInit.headers) {
			requestInit.headers = {Cookie: `LEETCODE_SESSION=${CREDS.LEETCODE_SESSION};csrftoken=${CREDS.csrftoken}`};
		}
		else {
			requestInit.headers.Cookie = `LEETCODE_SESSION=${CREDS.LEETCODE_SESSION};csrftoken=${CREDS.csrftoken}`;
		}
	}
}

async function limit() {
	removeRequestTimesBeyondInterval();

	if (config.limitType === constants.LimitType.EVEN_PACED) {
		await sleep(Math.floor(config.intervalInMs / (1.5 * config.maximumRequestsPerInterval)));	
	}

	while (requestTimes.length >= config.maximumRequestsPerInterval) {
		logs.logInfo("Waiting for requestTimes to open up.");

		removeRequestTimesBeyondInterval();

		await sleep(Math.floor(config.intervalInMs / (2 * config.maximumRequestsPerInterval)));	
	}
}

function removeRequestTimesBeyondInterval() {
	let requestTime = null;
	if (requestTimes.length > 0) {
		requestTime = requestTimes[0];
	}

	while ((requestTime != null) && (Date.now() - requestTime > config.intervalInMs)) {
		requestTime = requestTimes.shift();
	}
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
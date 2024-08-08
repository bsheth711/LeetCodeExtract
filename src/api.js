import * as constants from "./constants.js";
import { setTimeout as sleep } from 'node:timers/promises';
import { readFileSync } from 'node:fs';

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

const requestTimes = [];

const delay = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export async function sendRequest(path, requestInit) {
	console.log("sendRequest started");
	if (requestInit.headers == null) {
		requestInit.headers = {Cookie: `LEETCODE_SESSION=${CREDS.LEETCODE_SESSION};csrftoken=${CREDS.csrftoken}`};
	}
	else {
		requestInit.headers.Cookie = `LEETCODE_SESSION=${CREDS.LEETCODE_SESSION};csrftoken=${CREDS.csrftoken}`;
	}

	if (requestTimes.length >= constants.MAXIMUM_REQUESTS_PER_INTERVAL) {
		console.log("waiting");

		let requestTime = requestTimes.shift();
		while ((requestTime != null) && (Date.now() - requestTime > constants.INTERVAL_IN_MS)) {
			console.log("shifting");
			requestTime = requestTimes.shift();
		}

		await delay(Math.floor(constants.INTERVAL_IN_MS / constants.MAXIMUM_REQUESTS_PER_INTERVAL));	
	}

	console.log("sending request");
	const data = await fetch(`${constants.BASE_URL}${path}`, requestInit)
		.then((response) => {
			console.log(response.status);
			return response.json();
		});	
		
	console.log("adding req time");
	requestTimes.push(Date.now());

	return data;
}

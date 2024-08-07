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
	"csrftoken": "...",
	"username": "..."
}
*/

let lastMs = Date.now();
let numRequests = 30;

const asyncTimeout = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export async function sendRequest(path, requestInit) {
	if (requestInit.headers == null) {
		requestInit.headers = {Cookie: `LEETCODE_SESSION=${CREDS.LEETCODE_SESSION};csrftoken=${CREDS.csrftoken}`};
	}
	else {
		requestInit.headers.Cookie = `LEETCODE_SESSION=${CREDS.LEETCODE_SESSION};csrftoken=${CREDS.csrftoken}`;
	}

	// todo fix rate limiting
	const curMs = Date.now();
	if (curMs - lastMs <= constants.INTERVAL_IN_MS) {

		if (numRequests >= constants.MAXIMUM_REQUESTS_PER_INTERVAL) {
			console.log("waiting");
			console.log(constants.INTERVAL_IN_MS - (curMs - lastMs));
			await asyncTimeout(constants.INTERVAL_IN_MS - (curMs - lastMs));
			console.log("done waiting");
		}


		++numRequests;
	}
	else {
		lastMs = curMs;
		numRequests = 0;
	}

	const data = await fetch(`${constants.BASE_URL}${path}`, requestInit)
		.then((response) => {
			console.log(response.status);
			return response.json();
		});
	
	return data;
}

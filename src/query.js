import { readFileSync } from 'node:fs';
import {BASE_URL, IS_NOT_PENDING, } from "./constants"; // todo continue

const credentialsFilePath = process.env.LEETCODE_CREDENTIALS_PATH;
/*
must set environment variable LEETCODE_EXTRACT_CREDENTIALS_PATH
credentials file format (keep it safe!):
{
	"LEETCODE_SESSION": "...",
	"csrftoken": "...",
	"username": "..."
}
*/

const CREDS = JSON.parse(readFileSync(credentialsFilePath).toString());
const offset = 0;
const limit = 20;


fetch(`https://leetcode.com/api/submissions/?offset=${offset}&limit=${limit}&lastkey=`, {
	method: "GET",
	headers: {
		Cookie: `LEETCODE_SESSION=${CREDS.LEETCODE_SESSION};csrftoken=${CREDS.csrftoken}`
	}
})
	.then((response) => response.json())
	.then((data) => console.log(data));

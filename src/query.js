import { readFileSync } from 'node:fs';

const PROFILE = readFileSync('./src/graphql/daily.graphql').toString();
console.log(PROFILE);

fetch("https://leetcode.com/graphql/", {
	method: "POST",
	headers: {
		"Content-Type": "application/json"
	},
	body: JSON.stringify({
		query: PROFILE
	})
}).then((response) => response.text())
  .then((txt) => console.log(txt));
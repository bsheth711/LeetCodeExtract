import * as constants from "./constants.js";

export class Logger {
	constructor() {
		this.messages = [];
	}

	log(val) {
		if (constants.CONFIG.Logging) {
			console.log(val);
		}
		this.messages.push(val);
	}
}

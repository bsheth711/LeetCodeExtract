import { inspect } from "node:util";

import { fileURLToPath } from 'url';
import { dirname } from 'path';

import * as constants from "./constants.js";

import config from "../config.json" assert { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Filter {
	constructor (name, pattern, replacement) {
		this.name = name;
		this.pattern = pattern;
		this.replacement = replacement;
	}
}

export class Logger {	
	static _filters = [
		new Filter("sessionToken", /(LEETCODE_SESSION=)([^;"']*)/gm, `$1${constants.REDACTED}`),
		new Filter("csrfToken", /(csrftoken=)([^;"']*)/gm, `$1${constants.REDACTED}`)
	];

	constructor(name) {
		this.name = name;
	}

	_log(val, level) {
		if (config.logToConsole) {

			const message = new LogMessage(this.name, val, level);
			let str = inspect(message, {depth: null, colors: true});

			for (const filter of Logger._filters) {
				str = str.replace(filter.pattern, filter.replacement);
			}

			console.log(str);
		}
	}

	logInfo(val) {
		this._log(val, constants.LoggingLevel.INFO);
	}

	logWarn(val) {
		this._log(val, constants.LoggingLevel.WARN);
	}

	logError(val) {
		this._log(val, constants.LoggingLevel.INFO);
	}

}

class LogMessage {
	constructor (logName, contents, level) {
		this.logName = logName;
		this.contents = contents;
		this.level = level;
		this.time = Date.now();
	}
}
import { writeFileSync } from 'node:fs';
import { join } from "node:path";

import { fileURLToPath } from 'url';
import { dirname } from 'path';

import * as constants from "./constants.js";

import config from "../config.json" assert { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export class Logger {	
	static messages = [];

	constructor(name) {
		this.name = name;
	}

	_log(val, level) {
		const message = new LogMessage(this.name, val, level);

		if (config.logToConsole) {
			console.dir(message, {depth: null, showHidden: false});
		}

		Logger.messages.push(message);
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

	writeLogs(file = config.defaultLoggingFile) {
		try {
			writeFileSync(join(__dirname, file), JSON.stringify(Logger.messages, null, 4));
			this.clearLogs();
		}
		catch (error) {
			this.logError(`Unable to write logs. Error ${error}`);
			console.log(`Unable to write logs. Error ${error}`);
		}
	}

	clearLogs() {
		Logger.messages = [];
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
import * as constants from "./constants.js";
import { writeFileSync } from 'node:fs';
import config from "../config.json" assert { type: 'json' };

export class Logger {	
	static messages = [];

	constructor(name) {
		this.name = name;
	}

	_log(val, level) {
		const message = new LogMessage(this.name, val, level);

		if (config.logToConsole) {
			console.log(JSON.stringify(message, null, 4) + ",");
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
			writeFileSync(file, JSON.stringify(Logger.messages, null, 4));
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
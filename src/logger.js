import * as constants from "./constants.js";
import { writeFileSync } from 'node:fs';

export class Logger {	
	static messages = [];

	constructor(name) {
		this.name = name;
	}

	logInfo(val) {
		if (constants.CONFIG.Logging) {
			console.log(val);
		}
		Logger.messages.push(new LogMessage(this.name, val, constants.LoggingLevel.INFO));
	}

	logWarn(val) {
		if (constants.CONFIG.Logging) {
			console.log(val);
		}
		Logger.messages.push(new LogMessage(this.name, val, constants.LoggingLevel.WARN));
	}

	logError(val) {
		if (constants.CONFIG.Logging) {
			console.log(val);
		}
		Logger.messages.push(new LogMessage(this.name, val, constants.LoggingLevel.ERROR));
	}

	writeLogs(file) {
		try {
			writeFileSync(file, JSON.stringify(Logger.messages, null, 4));
		}
		catch (error) {
			this.logError(`Unable to write logs. Error ${error}`);
			console.log(`Unable to write logs. Error ${error}`);
		}
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
import * as constants from "./constants.js";
import { writeFileSync, writeSync, openSync, createWriteStream, WriteStream } from 'node:fs';
import config from "../config.json" assert { type: 'json' };

export class Logger {	
	static messages = [];
	static _position = 0;
	static _fd;
	static _separator = "";
	static _writeStream;

	static {
		if (config.logToFile && typeof config.loggingFile == "string" && config.loggingFile != "") {
			try {
				Logger._fd = openSync(config.loggingFile, "w"); //todo: figure out why positional writing is not working
				Logger._writeStream = createWriteStream(null, {
					flags: "w",
					fd: Logger._fd,
					start: 8,
					flush: true
				});
				writeSync(Logger._fd, "[\n\n]")
				Logger._position -= 8;
			}
			catch (error) {
				console.log(`Unable to write logs. Error ${error}`);
			}
		}
	}

	constructor(name) {
		this.name = name;
	}

	_log(val, level) {
		if (config.logToConsole) {
			console.log(val);
		}

		const newMessage = new LogMessage(this.name, val, level);
		Logger.messages.push(newMessage);

		if (config.logToFile && typeof config.loggingFile == "string" && config.loggingFile != "") {
			try {
				const lines = JSON.stringify(newMessage, null, 4).split("\n");
				lines.forEach((part, idx, arr) => arr[idx] = "\t" + part);
				const jsonString = lines.join("\n");

				const messageBuf = Buffer.from(Logger._separator + jsonString);
				if (!Logger._separator) {
					Logger._separator = ",\n";
				}
				//writeSync(Logger._fd, messageBuf, null, messageBuf.length, 0);
				Logger._writeStream.write(messageBuf);
				Logger._position += 4 * messageBuf.length;
			}
			catch (error) {
				console.log(`Unable to write logs. Error ${error}`);
			}
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

	writeLogs(file = config.loggingFile) {
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
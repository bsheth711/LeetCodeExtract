import { getSubmissions } from "./api.js";
import { Logger } from "./logger.js";

const startTime = Date.now();

const logs = new Logger("example.js");


const submissions = await getSubmissions();
logs.logInfo({"submissions": submissions});


const endTime = Date.now();
logs.logInfo(`Total Operation took: ${(endTime - startTime) / 1000} seconds`);
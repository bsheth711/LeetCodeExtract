export const BASE_URL = "https://leetcode.com";
export const INTERVAL_IN_MS = 20000;
export const MAXIMUM_REQUESTS_PER_INTERVAL = 10;

export const IS_NOT_PENDING = "Not Pending";
export const ACCEPTED = "Accepted";

export const LimitType = {
	GREEDY: Symbol("GREEDY"),
	EVEN_PACED: Symbol("EVEN_PACED")
};

export const CONFIG = {
	LimitType: LimitType.EVEN_PACED,
	Logging: true
};

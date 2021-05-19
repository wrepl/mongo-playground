/* eslint-disable @typescript-eslint/no-explicit-any */
import https from "https";
import qs from "querystring";

interface Options {
	mode?: "bson" | "mgodatagen";
	raw?: boolean;
}

type ReturnType<T, Opts> = Opts extends { raw: true } ? string : T;

const run = <T = any, Opts extends Options = Options>(
	configuration: string | any[] | Record<any, any>,
	query: string,
	options?: Opts
): Promise<ReturnType<T, Opts>> => {
	const opt: Options = {
		mode: "bson",
		raw: false,
		...options,
	};

	return new Promise<ReturnType<T, Opts>>((resolve, reject) => {
		const req = https.request(
			{
				method: "POST",
				hostname: "mongoplayground-api.net",
				port: 443,
				path: "/run",
				headers: { "content-type": "application/x-www-form-urlencoded" },
			},
			(res) => {
				res.setEncoding("utf8");
				let responseBody = "";

				res.on("data", (chunk) => {
					responseBody += chunk;
				});

				res.on("end", () => {
					try {
						resolve(opt.raw ? responseBody : JSON.parse(responseBody));
					} catch (err) {
						reject(new Error(responseBody));
					}
				});
			}
		);

		let config =
			typeof configuration === "string"
				? configuration.trim()
				: JSON.stringify(configuration);
		if (!Array.isArray(configuration) && typeof configuration !== "string")
			config = "db=" + config;

		const data = {
			config,
			query,
			mode: opt.mode,
		};

		req.on("error", reject);
		req.write(qs.stringify(data));
		req.end();
	});
};

export { run };

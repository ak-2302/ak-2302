const ALLOWED_ORIGINS = new Set([
	"https://xn--28j4bvdyc.tech",
	"https://www.xn--28j4bvdyc.tech",
	"https://ak-2302.github.io",
]);

const LIMITS = {
	name: 80,
	email: 254,
	message: 1800,
};

function isAllowedOrigin(origin) {
	if (!origin) return true;
	if (ALLOWED_ORIGINS.has(origin)) return true;

	try {
		const url = new URL(origin);
		return url.protocol === "http:"
			&& (url.hostname === "localhost" || url.hostname === "127.0.0.1");
	} catch {
		return false;
	}
}

function corsHeaders(origin) {
	const headers = {
		"Access-Control-Allow-Headers": "Content-Type",
		"Access-Control-Allow-Methods": "POST, OPTIONS",
		"Access-Control-Max-Age": "86400",
		Vary: "Origin",
	};

	if (origin && isAllowedOrigin(origin)) {
		headers["Access-Control-Allow-Origin"] = origin;
	}

	return headers;
}

function jsonResponse(body, status, origin) {
	return Response.json(body, {
		status,
		headers: corsHeaders(origin),
	});
}

function validatePayload(payload) {
	if (!payload || typeof payload !== "object") {
		return "Invalid request body.";
	}

	for (const field of ["name", "email", "message"]) {
		if (typeof payload[field] !== "string" || !payload[field].trim()) {
			return `${field} is required.`;
		}

		if (payload[field].trim().length > LIMITS[field]) {
			return `${field} is too long.`;
		}
	}

	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) {
		return "email is invalid.";
	}

	return null;
}

export default {
	async fetch(request, env) {
		const origin = request.headers.get("Origin");

		if (!isAllowedOrigin(origin)) {
			return jsonResponse({ error: "Origin is not allowed." }, 403, origin);
		}

		if (request.method === "OPTIONS") {
			return new Response(null, {
				status: 204,
				headers: corsHeaders(origin),
			});
		}

		if (request.method !== "POST") {
			return jsonResponse({ error: "Method not allowed." }, 405, origin);
		}

		if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) {
			return jsonResponse({ error: "Content-Type must be application/json." }, 415, origin);
		}

		let payload;
		try {
			payload = await request.json();
		} catch {
			return jsonResponse({ error: "Invalid JSON." }, 400, origin);
		}

		const validationError = validatePayload(payload);
		if (validationError) {
			return jsonResponse({ error: validationError }, 400, origin);
		}

		if (!env.DISCORD_WEBHOOK_URL) {
			console.error("DISCORD_WEBHOOK_URL is not configured.");
			return jsonResponse({ error: "Contact service is not configured." }, 500, origin);
		}

		const name = payload.name.trim();
		const email = payload.email.trim();
		const message = payload.message.trim();
		let discordResponse;
		try {
			discordResponse = await fetch(env.DISCORD_WEBHOOK_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					username: "Website Contact",
					allowed_mentions: { parse: [] },
					embeds: [{
						title: "New contact message",
						description: message,
						color: 0xc9ff57,
						fields: [
							{ name: "Name", value: name },
							{ name: "Email", value: email },
						],
						timestamp: new Date().toISOString(),
					}],
				}),
			});
		} catch (error) {
			console.error("Discord webhook request failed.", error);
			return jsonResponse({ error: "Failed to deliver message." }, 502, origin);
		}

		if (!discordResponse.ok) {
			console.error(`Discord webhook failed with status ${discordResponse.status}.`);
			return jsonResponse({ error: "Failed to deliver message." }, 502, origin);
		}

		return jsonResponse({ ok: true }, 200, origin);
	},
};

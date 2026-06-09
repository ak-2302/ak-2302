import { createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import { afterEach, describe, expect, it, vi } from "vitest";
import worker from "../src";

const origin = "https://xn--28j4bvdyc.tech";
const webhookUrl = "https://discord.com/api/webhooks/test";

function postRequest(body, requestOrigin = origin) {
	return new Request("https://contact-worker.example.com", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Origin: requestOrigin,
		},
		body: JSON.stringify(body),
	});
}

async function run(request, env = { DISCORD_WEBHOOK_URL: webhookUrl }) {
	const ctx = createExecutionContext();
	const response = await worker.fetch(request, env, ctx);
	await waitOnExecutionContext(ctx);
	return response;
}

afterEach(() => {
	vi.restoreAllMocks();
});

describe("contact worker", () => {
	it("handles an allowed CORS preflight", async () => {
		const response = await run(new Request("https://contact-worker.example.com", {
			method: "OPTIONS",
			headers: { Origin: origin },
		}));

		expect(response.status).toBe(204);
		expect(response.headers.get("Access-Control-Allow-Origin")).toBe(origin);
	});

	it("allows local development origins on any port", async () => {
		const localOrigin = "http://127.0.0.1:3000";
		const response = await run(new Request("https://contact-worker.example.com", {
			method: "OPTIONS",
			headers: {
				Origin: localOrigin,
				"Access-Control-Request-Method": "POST",
				"Access-Control-Request-Headers": "content-type",
			},
		}));

		expect(response.status).toBe(204);
		expect(response.headers.get("Access-Control-Allow-Origin")).toBe(localOrigin);
	});

	it("rejects requests from unknown origins", async () => {
		const response = await run(postRequest({
			name: "Test",
			email: "test@example.com",
			message: "Hello",
		}, "https://example.com"));

		expect(response.status).toBe(403);
	});

	it("validates required fields", async () => {
		const response = await run(postRequest({
			name: "",
			email: "test@example.com",
			message: "Hello",
		}));

		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({ error: "name is required." });
	});

	it("forwards a valid message to Discord", async () => {
		const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(null, { status: 204 }),
		);

		const response = await run(postRequest({
			name: "Test User",
			email: "test@example.com",
			message: "Hello from the site",
		}));

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ ok: true });
		expect(fetchMock).toHaveBeenCalledOnce();

		const [url, options] = fetchMock.mock.calls[0];
		expect(url).toBe(webhookUrl);
		const discordBody = JSON.parse(options.body);
		expect(discordBody.embeds[0].description).toBe("Hello from the site");
		expect(discordBody.embeds[0].fields).toEqual([
			{ name: "Name", value: "Test User" },
			{ name: "Email", value: "test@example.com" },
		]);
	});

	it("does not expose Discord errors to the client", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response("unauthorized", { status: 401 }),
		);

		const response = await run(postRequest({
			name: "Test User",
			email: "test@example.com",
			message: "Hello",
		}));

		expect(response.status).toBe(502);
		expect(await response.json()).toEqual({ error: "Failed to deliver message." });
	});
});

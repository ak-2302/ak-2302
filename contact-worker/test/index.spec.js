import { createExecutionContext, waitOnExecutionContext } from 'cloudflare:test'
import { afterEach, describe, expect, it, vi } from 'vitest'
import worker from '../src/index.js'

const origin = 'https://xn--28j4bvdyc.tech'
const webhookUrl = 'https://discord.com/api/webhooks/test'

function postRequest(body, requestOrigin = origin) {
	return new Request('https://contact-worker.example.com', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Origin: requestOrigin },
		body: JSON.stringify(body),
	})
}

async function run(request, env = { DISCORD_WEBHOOK_URL: webhookUrl }) {
	const ctx = createExecutionContext()
	const response = await worker.fetch(request, env, ctx)
	await waitOnExecutionContext(ctx)
	return response
}

afterEach(() => vi.restoreAllMocks())

describe('contact worker', () => {
	it('handles allowed CORS preflight', async () => {
		const response = await run(new Request('https://contact-worker.example.com', { method: 'OPTIONS', headers: { Origin: origin } }))
		expect(response.status).toBe(204)
		expect(response.headers.get('Access-Control-Allow-Origin')).toBe(origin)
	})

	it('rejects unknown origins', async () => {
		const response = await run(postRequest({ name: 'Test', email: 'test@example.com', message: 'Hello', consent: true }, 'https://example.com'))
		expect(response.status).toBe(403)
	})

	it('validates required fields and consent', async () => {
		const response = await run(postRequest({ name: '', email: 'test@example.com', message: 'Hello', consent: false }))
		expect(response.status).toBe(400)
		expect(await response.json()).toEqual({ error: 'name is required.' })
	})

	it('forwards a valid message without exposing webhook details', async () => {
		const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }))
		const response = await run(postRequest({ name: 'Test User', email: 'test@example.com', message: 'Hello from the site', consent: true }))
		expect(response.status).toBe(200)
		expect(await response.json()).toEqual({ ok: true })
		expect(fetchMock).toHaveBeenCalledOnce()
	})

	it('returns a delivery error when the webhook fails', async () => {
		vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network unavailable'))
		const response = await run(postRequest({ name: 'Test User', email: 'test@example.com', message: 'Hello', consent: true }))
		expect(response.status).toBe(502)
		expect(await response.json()).toEqual({ error: 'Failed to deliver message.' })
	})
})

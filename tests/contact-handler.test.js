import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/contact.js';

function createResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    setHeader(name, value) { this.headers[name] = value; return this; },
    end(value) { this.body = value; return this; },
  };
}

function validRequest(body) {
  return { method: 'POST', headers: { 'content-length': '500', 'x-forwarded-for': '127.0.0.1' }, body };
}

test('contact handler rejects invalid email before delivery', async () => {
  const response = createResponse();
  await handler(validRequest({ firstName: 'Alex', lastName: 'Example', email: 'bad', message: 'Hello' }), response);
  assert.equal(response.statusCode, 400);
  assert.equal(JSON.parse(response.body).ok, false);
});

test('contact handler returns an explicit configuration error when email delivery is not configured', async () => {
  const previousKey = process.env.RESEND_API_KEY;
  const previousFrom = process.env.CONTACT_FROM_EMAIL;
  delete process.env.RESEND_API_KEY;
  delete process.env.CONTACT_FROM_EMAIL;
  const originalFetch = global.fetch;
  global.fetch = async () => { throw new Error('fetch must not run without delivery credentials'); };
  try {
    const response = createResponse();
    await handler(validRequest({ firstName: 'Alex', lastName: 'Example', email: 'alex@example.test', message: 'Hello' }), response);
    assert.equal(response.statusCode, 503);
    assert.equal(JSON.parse(response.body).code, 'CONTACT_NOT_CONFIGURED');
  } finally {
    global.fetch = originalFetch;
    if (previousKey !== undefined) process.env.RESEND_API_KEY = previousKey;
    if (previousFrom !== undefined) process.env.CONTACT_FROM_EMAIL = previousFrom;
  }
});

test('contact honeypot never claims an email was delivered', async () => {
  const response = createResponse();
  await handler(validRequest({ website: 'filled by bot' }), response);
  assert.equal(response.statusCode, 204);
  assert.equal(response.body, undefined);
});

test('contact handler rejects malformed JSON and non-object payloads', async () => {
  for (const body of ['{', 'null', []]) {
    const response = createResponse();
    await handler(validRequest(body), response);
    assert.equal(response.statusCode, 400);
    assert.equal(JSON.parse(response.body).ok, false);
  }
});

test('contact handler enforces the payload limit even when content-length is missing', async () => {
  const response = createResponse();
  const payload = { firstName: 'A', lastName: 'B', email: 'a@example.test', message: 'x'.repeat(13_000) };
  await handler({ method: 'POST', headers: {}, body: payload }, response);
  assert.equal(response.statusCode, 413);
});

test('contact handler reports success only after the configured provider accepts the message', async () => {
  const previous = {
    key: process.env.RESEND_API_KEY,
    from: process.env.CONTACT_FROM_EMAIL,
    to: process.env.CONTACT_TO_EMAIL,
  };
  process.env.RESEND_API_KEY = 'test-key';
  process.env.CONTACT_FROM_EMAIL = 'Portfolio <contact@example.test>';
  process.env.CONTACT_TO_EMAIL = 'owner@example.test';
  const originalFetch = global.fetch;
  let sent;
  global.fetch = async (url, options) => {
    sent = { url, options };
    return { ok: true, status: 200 };
  };
  try {
    const response = createResponse();
    await handler({
      method: 'POST',
      headers: { 'content-length': '400', 'x-forwarded-for': 'test-success' },
      body: { firstName: 'Alex', lastName: 'Example', email: 'alex@example.test', message: 'A real inquiry.' },
    }, response);
    assert.equal(response.statusCode, 200);
    assert.equal(JSON.parse(response.body).ok, true);
    assert.equal(sent.url, 'https://api.resend.com/emails');
    assert.equal(JSON.parse(sent.options.body).to[0], 'owner@example.test');
    assert.equal(JSON.parse(sent.options.body).reply_to, 'alex@example.test');
  } finally {
    global.fetch = originalFetch;
    if (previous.key === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = previous.key;
    if (previous.from === undefined) delete process.env.CONTACT_FROM_EMAIL; else process.env.CONTACT_FROM_EMAIL = previous.from;
    if (previous.to === undefined) delete process.env.CONTACT_TO_EMAIL; else process.env.CONTACT_TO_EMAIL = previous.to;
  }
});

test('contact handler rejects further submissions from a rate-limited connection', async () => {
  const response = createResponse();
  for (let i = 0; i < 5; i++) {
    await handler({
      method: 'POST',
      headers: { 'content-length': '400', 'x-forwarded-for': 'rate-limit-test' },
      body: { firstName: 'Alex', lastName: 'Example', email: 'alex@example.test', message: 'Hello' },
    }, response);
  }
  assert.equal(response.statusCode, 429);
  assert.equal(JSON.parse(response.body).ok, false);
});

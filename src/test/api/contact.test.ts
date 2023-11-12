import { afterEach, describe, expect, test } from 'vitest'
import { Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'

import { cookies, codes, RequestState } from '../base'
import {
  EMAIL_MAX_LENGTH,
  EmailType,
  MESSAGE_MAX_LENGTH,
  MESSAGE_MIN_LENGTH,
  MessageType,
} from '../../lib/safety'
import { JsonObject } from '../../lib/types'
import { POST } from '../../app/api/contact/route'
import db from '../../lib/db'

const genRequest = () =>
  new RequestState()
    .route('/api/contact')
    .method('POST')
    .header('X-CSRF-TOKEN', codes.csrf)
    .cookie('csrf', cookies.csrf)
    .handler(POST)

const genBody = (): JsonObject => ({
  email: 'test@e.mail',
  message: 'Test message.',
})

const AdminMessageRowType = Type.Object({
  email: Type.Union([EmailType, Type.Null()]),
  message: MessageType,
  id: Type.Number({ minimum: 1 }),
  read: Type.Literal(false),
  timestamp: Type.Date({
    minimumTimestamp: Date.now() - 1000,
  }),
})

type AdminMessageT = Static<typeof AdminMessageRowType>

const rowValidator = TypeCompiler.Compile(AdminMessageRowType)

const checkDatabase = async (body: object) => {
  const result = await db.query<AdminMessageT>(`SELECT * FROM admin_messages`)
  expect(result.rowCount).toBe(1)
  const message = result.rows[0]
  const errors = [...rowValidator.Errors(message)]
  for (const error of errors) {
    const { type, schema, ...pertinent } = error
    expect('error', JSON.stringify(pertinent)).toBeNull()
  }
  expect(message).toMatchObject(body)
}

describe('correct POST', () => {
  afterEach(async () => {
    await db.query(`
      TRUNCATE TABLE admin_messages
      RESTART IDENTITY
    `)
  })

  test('message and email', async () => {
    const reqBody = genBody()
    const res = await genRequest().send(reqBody)
    expect(res.status).toBe(201)
    expect(res.body).toBe(null)
    await checkDatabase(reqBody)
  })

  test('only message', async () => {
    const reqBody = genBody()
    delete reqBody.email
    const res = await genRequest().send(reqBody)
    expect(res.status).toBe(201)
    expect(res.body).toBe(null)
    await checkDatabase(reqBody)
  })
})

describe('faulty body', () => {
  test('not JSON', async () => {
    const res = await genRequest().send()
    expect(res.status).toBe(400)
    const resBody = await res.json()
    expect(resBody).toMatchObject({ error: 'BODY_INVALID_JSON' })
  })

  test('no message', async () => {
    const reqBody = genBody()
    delete reqBody.message
    const res = await genRequest().send(reqBody)
    expect(res.status).toBe(400)
    const resBody = await res.json()
    expect(resBody).toMatchObject({
      message: 'Required property',
      property: '/message',
    })
  })

  test('mistyped message', async () => {
    const reqBody = genBody()
    reqBody.message = 87
    const res = await genRequest().send(reqBody)
    expect(res.status).toBe(400)
    const resBody = await res.json()
    expect(resBody).toMatchObject({
      message: 'Expected string',
      property: '/message',
    })
  })

  test('message too short', async () => {
    const reqBody = genBody()
    reqBody.message = 'a'
    const res = await genRequest().send(reqBody)
    expect(res.status).toBe(400)
    const resBody = await res.json()
    expect(resBody).toMatchObject({
      message: `Expected string length greater or equal to ${MESSAGE_MIN_LENGTH}`,
      property: '/message',
    })
  })

  test('message too long', async () => {
    const reqBody = genBody()
    reqBody.message = 'a'.repeat(MESSAGE_MAX_LENGTH + 1)
    const res = await genRequest().send(reqBody)
    expect(res.status).toBe(400)
    const resBody = await res.json()
    expect(resBody).toMatchObject({
      message: `Expected string length less or equal to ${MESSAGE_MAX_LENGTH}`,
      property: '/message',
    })
  })

  test('mistyped email', async () => {
    const reqBody = genBody()
    reqBody.email = false
    const res = await genRequest().send(reqBody)
    expect(res.status).toBe(400)
    const resBody = await res.json()
    expect(resBody).toMatchObject({
      message: 'Expected string',
      property: '/email',
    })
  })

  test("email doesn't match pattern", async () => {
    const reqBody = genBody()
    reqBody.email = 'testermail.com'
    const res = await genRequest().send(reqBody)
    expect(res.status).toBe(400)
    const resBody = await res.json()
    expect(resBody).toMatchObject({
      message: "Expected string to match '^.+@.+$'",
      property: '/email',
    })
  })

  test('email too long', async () => {
    const reqBody = genBody()
    reqBody.email += 'm'.repeat(EMAIL_MAX_LENGTH)
    const res = await genRequest().send(reqBody)
    expect(res.status).toBe(400)
    const resBody = await res.json()
    expect(resBody).toMatchObject({
      message: `Expected string length less or equal to ${EMAIL_MAX_LENGTH}`,
      property: '/email',
    })
  })

  test('unnecessary property', async () => {
    const reqBody = genBody()
    reqBody.auth = true
    const res = await genRequest().send(reqBody)
    expect(res.status).toBe(400)
    const resBody = await res.json()
    expect(resBody).toMatchObject({
      error: 'BODY_UNEXPECTED_PROPERTIES',
      properties: ['auth'],
    })
  })
})

describe('faulty cookies', () => {
  test('missing CSRF', async () => {
    const reqBody = genBody()
    const res = await genRequest().cookie('csrf', null).send(reqBody)
    expect(res.status).toBe(400)
    const resBody = await res.json()
    expect(resBody).toMatchObject({
      error: 'CSRF_NO_COOKIE',
    })
  })

  test('valid token but not CSRF', async () => {
    const reqBody = genBody()
    const res = await genRequest().cookie('csrf', cookies.auth).send(reqBody)
    expect(res.status).toBe(400)
    const resBody = await res.json()
    expect(resBody).toMatchObject({
      error: 'CSRF_COOKIE_MISSING_CODE',
    })
  })

  test('invalid CSRF', async () => {
    const reqBody = genBody()
    const res = await genRequest().cookie('csrf', 'notAJwt').send(reqBody)
    expect(res.status).toBe(400)
    const resBody = await res.json()
    expect(resBody).toMatchObject({
      error: 'CSRF_VERIFY_FAILED',
    })
  })
})

describe('faulty headers', () => {
  test('missing CSRF', async () => {
    const reqBody = genBody()
    const res = await genRequest().header('X-CSRF-TOKEN', null).send(reqBody)
    expect(res.status).toBe(400)
    const resBody = await res.json()
    expect(resBody).toMatchObject({
      error: 'CSRF_NO_HEADER',
    })
  })

  test('wrong CSRF code', async () => {
    const reqBody = genBody()
    const res = await genRequest()
      .header('X-CSRF-TOKEN', codes.csrfB)
      .send(reqBody)
    expect(res.status).toBe(400)
    const resBody = await res.json()
    expect(resBody).toMatchObject({
      error: 'CSRF_COOKIE_HEADER_MISMATCH',
    })
  })
})

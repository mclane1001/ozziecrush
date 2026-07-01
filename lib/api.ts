import { NextResponse } from 'next/server'

export const notImplemented = () =>
  NextResponse.json({ error: 'Not implemented' }, { status: 501 })

export const ok = (data: unknown) =>
  NextResponse.json(data, { status: 200 })

export const badRequest = (message: string) =>
  NextResponse.json({ error: message }, { status: 400 })

export const unauthorized = () =>
  NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

export const serverError = (message = 'Internal server error') =>
  NextResponse.json({ error: message }, { status: 500 })

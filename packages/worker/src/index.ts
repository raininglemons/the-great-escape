import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  ENVIRONMENT: string
  ALLOWED_ORIGINS?: string
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS middleware
app.use('*', async (c, next) => {
  const corsMiddleware = cors({
    origin: (origin) => {
      // In development, allow localhost
      if (c.env.ENVIRONMENT === 'development') {
        return origin
      }
      // In production, check against allowed origins
      const allowed = c.env.ALLOWED_ORIGINS?.split(',') || []
      if (allowed.includes(origin)) {
        return origin
      }
      return null
    },
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-API-Secret'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  })
  return corsMiddleware(c, next)
})

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// X API proxy endpoint
// Users provide their own API credentials in the request headers
app.get('/api/x/users/:userId/following', async (c) => {
  const userId = c.req.param('userId')
  const cursor = c.req.query('pagination_token')

  // Get user-provided credentials from headers
  const apiKey = c.req.header('X-API-Key')
  const apiSecret = c.req.header('X-API-Secret')
  const accessToken = c.req.header('Authorization')?.replace('Bearer ', '')

  if (!apiKey || !accessToken) {
    return c.json({ error: 'Missing API credentials' }, 401)
  }

  try {
    const url = new URL(`https://api.twitter.com/2/users/${userId}/following`)
    url.searchParams.set('max_results', '1000')
    url.searchParams.set('user.fields', 'id,name,username,description,profile_image_url')

    if (cursor) {
      url.searchParams.set('pagination_token', cursor)
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      return c.json(
        { error: 'X API error', details: error },
        response.status as 400 | 401 | 403 | 404 | 429 | 500
      )
    }

    const data = await response.json()
    return c.json(data)
  } catch (error) {
    console.error('X API proxy error:', error)
    return c.json({ error: 'Failed to fetch from X API' }, 500)
  }
})

// Batch lookup users by IDs (up to 100 at a time)
// POST body: { ids: ["123", "456", ...] }
app.post('/api/x/users/lookup', async (c) => {
  const accessToken = c.req.header('Authorization')?.replace('Bearer ', '')

  if (!accessToken) {
    return c.json({ error: 'Missing access token' }, 401)
  }

  try {
    const body = await c.req.json<{ ids: string[] }>()
    const ids = body.ids

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return c.json({ error: 'Missing or invalid ids array' }, 400)
    }

    if (ids.length > 100) {
      return c.json({ error: 'Maximum 100 IDs per request' }, 400)
    }

    const url = new URL('https://api.twitter.com/2/users')
    url.searchParams.set('ids', ids.join(','))
    url.searchParams.set(
      'user.fields',
      'id,name,username,description,profile_image_url,public_metrics'
    )

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      return c.json(
        { error: 'X API error', details: error },
        response.status as 400 | 401 | 403 | 404 | 429 | 500
      )
    }

    const data = await response.json()
    return c.json(data)
  } catch (error) {
    console.error('X API proxy error:', error)
    return c.json({ error: 'Failed to fetch from X API' }, 500)
  }
})

// Get authenticated user info
app.get('/api/x/users/me', async (c) => {
  const accessToken = c.req.header('Authorization')?.replace('Bearer ', '')

  if (!accessToken) {
    return c.json({ error: 'Missing access token' }, 401)
  }

  try {
    const response = await fetch(
      'https://api.twitter.com/2/users/me?user.fields=id,name,username,description,profile_image_url',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      const error = await response.text()
      return c.json(
        { error: 'X API error', details: error },
        response.status as 400 | 401 | 403 | 404 | 429 | 500
      )
    }

    const data = await response.json()
    return c.json(data)
  } catch (error) {
    console.error('X API proxy error:', error)
    return c.json({ error: 'Failed to fetch from X API' }, 500)
  }
})

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404)
})

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err)
  return c.json({ error: 'Internal server error' }, 500)
})

export default app

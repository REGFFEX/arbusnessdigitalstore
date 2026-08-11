const { PrismaClient } = require('@prisma/client');

// Create Prisma client lazily to avoid connection explosion in serverless environments
let prisma;
function getPrisma() {
  if (!prisma) prisma = new PrismaClient();
  return prisma;
}

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const prismaClient = getPrisma();

  try {
    const payload = JSON.parse(event.body || '{}');
    const { productId, userId, ip, meta } = payload;

    // Basic validation
    if (!productId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'productId_required' }) };
    }

    // Insert download log via Prisma using server-side credentials
    const log = await prismaClient.downloads.create({
      data: {
        product_id: productId,
        user_id: userId || null,
        ip: ip || null,
      },
    });

    return {
      statusCode: 201,
      body: JSON.stringify({ success: true, id: log.id }),
    };
  } catch (err) {
    console.error('log-download error', err?.message || err);
    return { statusCode: 500, body: JSON.stringify({ error: 'internal_error' }) };
  }
};

// IMPORTANT:
// - Set environment variable DIRECT_URL or DATABASE_URL in Netlify (do NOT commit .env)
// - Use a server-only service role / DB credentials stored in Netlify env vars.

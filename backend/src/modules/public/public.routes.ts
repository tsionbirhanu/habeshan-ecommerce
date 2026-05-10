import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../../database/prisma';
import * as settingsController from '../admin/settings.controller';
import logger from '../../utils/logger';

const router = Router();

/**
 * GET /api/sitemap.xml
 * Generate XML sitemap with all ACTIVE products and categories
 */
router.get('/sitemap.xml', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // Fetch all active products and categories
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true, slug: true, updatedAt: true },
      }),
      prisma.category.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    // Build XML sitemap
    const baseUrl = process.env.FRONTEND_URL || 'https://habesha-minimarket.com';
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add home page
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}</loc>\n`;
    xml += '    <lastmod>' + new Date().toISOString() + '</lastmod>\n';
    xml += '    <changefreq>daily</changefreq>\n';
    xml += '    <priority>1.0</priority>\n';
    xml += '  </url>\n';

    // Add categories
    for (const category of categories) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/categories/${category.slug}</loc>\n`;
      xml += '    <lastmod>' + new Date(category.updatedAt).toISOString() + '</lastmod>\n';
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    }

    // Add products
    for (const product of products) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/products/${product.slug}</loc>\n`;
      xml += '    <lastmod>' + new Date(product.updatedAt).toISOString() + '</lastmod>\n';
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';
    }

    xml += '</urlset>';

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.send(xml);
  } catch (error) {
    logger.error('Error generating sitemap:', error);
    next(error);
  }
});

/**
 * GET /api/robots.txt
 * Return robots.txt for SEO crawlers
 */
router.get('/robots.txt', (_req: Request, res: Response) => {
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/admin
Disallow: /api/auth/
Disallow: /api/users/
Disallow: /api/cart
Disallow: /api/orders
Disallow: /*.json$
Crawl-delay: 1

User-agent: Googlebot
Allow: /
Crawl-delay: 0.1

Sitemap: ${process.env.FRONTEND_URL || 'https://habesha-minimarket.com'}/api/sitemap.xml`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(robotsTxt);
});

/**
 * GET /api/store/info
 * Public store information endpoint
 */
router.get('/store/info', settingsController.getPublicStoreInfo);

export default router;

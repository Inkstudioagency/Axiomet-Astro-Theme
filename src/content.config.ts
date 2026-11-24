/**
 * Content collections backed by Strapi (see ./strapi).
 *
 * Each loader fetches the published entries at build time (or when the dev server
 * syncs content), normalises Strapi's response and validates it with a schema.
 * Entry ids are the slugs.
 */
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { fetchCollection, mediaUrl, type StrapiMedia } from './lib/strapi';

// ---------- shared shapes

const imageSchema = z.object({
  url: z.string(),
  alt: z.string(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  /** Responsive sources from Strapi's image formats (null for demo content) */
  srcset: z.string().nullable(),
});

// Strapi "Blocks" rich text, rendered by src/components/RichText.astro
const blocksSchema = z.array(z.any()).default([]);

const itemSchema = z.object({ title: z.string(), description: z.string() });

const seoSchema = z.object({
  metaTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
});

type Formats = Record<string, { url: string; width: number }> | null | undefined;

function image(media: (StrapiMedia & { formats?: Formats }) | null | undefined, fallbackAlt = '') {
  if (!media) return null;
  const sources = Object.values(media.formats ?? {})
    .filter((f) => f.width >= 500)
    .sort((a, b) => a.width - b.width)
    .map((f) => `${mediaUrl(f.url)} ${f.width}w`);
  if (sources.length && media.width) sources.push(`${mediaUrl(media.url)} ${media.width}w`);
  return {
    url: mediaUrl(media.url),
    alt: media.alternativeText || fallbackAlt,
    width: media.width ?? null,
    height: media.height ?? null,
    srcset: sources.length ? sources.join(', ') : null,
  };
}

function blocks(nodes: any[] | null | undefined) {
  return (nodes ?? []).map((node) =>
    node.type === 'image' && node.image ? { ...node, image: { ...node.image, url: mediaUrl(node.image.url) } } : node,
  );
}

const items = (list: any[] | null | undefined) =>
  (list ?? []).map((i) => ({ title: i.title ?? '', description: i.description ?? '' }));

const seo = (value: any) => ({ metaTitle: value?.metaTitle || null, metaDescription: value?.metaDescription || null });

const entryMeta = (e: any) => ({ id: e.slug, slug: e.slug, order: e.order ?? 0, createdAt: e.createdAt });
const entryMetaSchema = { slug: z.string(), order: z.number(), createdAt: z.coerce.date() };

// ---------- collections

const services = defineCollection({
  loader: async () => {
    const entries = await fetchCollection<any>('services', {
      image: true,
      challengeImage: true,
      expertiseImage: true,
      challenges: true,
      expertise: true,
      seo: true,
    });
    return entries.map((s) => ({
      ...entryMeta(s),
      name: s.name,
      shortName: s.shortName ?? s.name,
      image: image(s.image, s.name),
      shortDescription: s.shortDescription ?? '',
      longSummary: s.longSummary ?? '',
      biggerPicture: s.biggerPicture ?? '',
      challengeTitle: s.challengeTitle ?? '',
      challengeDescription: s.challengeDescription ?? '',
      challenges: items(s.challenges),
      challengeImage: image(s.challengeImage, s.name),
      expertiseTitle: s.expertiseTitle ?? '',
      expertiseDescription: s.expertiseDescription ?? '',
      expertise: items(s.expertise),
      expertiseImage: image(s.expertiseImage, s.name),
      seo: seo(s.seo),
    }));
  },
  schema: z.object({
    ...entryMetaSchema,
    name: z.string(),
    shortName: z.string(),
    image: imageSchema,
    shortDescription: z.string(),
    longSummary: z.string(),
    biggerPicture: z.string(),
    challengeTitle: z.string(),
    challengeDescription: z.string(),
    challenges: z.array(itemSchema),
    challengeImage: imageSchema,
    expertiseTitle: z.string(),
    expertiseDescription: z.string(),
    expertise: z.array(itemSchema),
    expertiseImage: imageSchema,
    seo: seoSchema,
  }),
});

const projects = defineCollection({
  loader: async () => {
    const entries = await fetchCollection<any>('projects', { image: true, clientLogo: true, seo: true });
    return entries.map((p) => ({
      ...entryMeta(p),
      name: p.name,
      category: p.category ?? '',
      image: image(p.image, p.name),
      clientLogo: image(p.clientLogo, p.clientName ?? p.name),
      statValue: p.statValue ?? '',
      statLabel: p.statLabel ?? '',
      summary: p.summary ?? '',
      shortDescription: p.shortDescription ?? '',
      clientName: p.clientName ?? '',
      industry: p.industry ?? '',
      location: p.location ?? '',
      engagement: p.engagement ?? '',
      timeline: p.timeline ?? '',
      team: p.team ?? '',
      overview: p.overview ?? '',
      details: blocks(p.details),
      seo: seo(p.seo),
    }));
  },
  schema: z.object({
    ...entryMetaSchema,
    name: z.string(),
    category: z.string(),
    image: imageSchema,
    clientLogo: imageSchema,
    statValue: z.string(),
    statLabel: z.string(),
    summary: z.string(),
    shortDescription: z.string(),
    clientName: z.string(),
    industry: z.string(),
    location: z.string(),
    engagement: z.string(),
    timeline: z.string(),
    team: z.string(),
    overview: z.string(),
    details: blocksSchema,
    seo: seoSchema,
  }),
});

const blogs = defineCollection({
  loader: async () => {
    const entries = await fetchCollection<any>('blogs', { image: true, seo: true });
    return entries.map((b) => ({
      ...entryMeta(b),
      title: b.title,
      category: b.category ?? '',
      image: image(b.image, b.title),
      date: b.date,
      readTime: b.readTime ?? '',
      featured: Boolean(b.featured),
      shortDescription: b.shortDescription ?? '',
      summary: b.summary ?? '',
      content: blocks(b.content),
      quote: b.quote ?? '',
      contentAfterQuote: blocks(b.contentAfterQuote),
      seo: seo(b.seo),
    }));
  },
  schema: z.object({
    ...entryMetaSchema,
    title: z.string(),
    category: z.string(),
    image: imageSchema,
    date: z.coerce.date(),
    readTime: z.string(),
    featured: z.boolean(),
    shortDescription: z.string(),
    summary: z.string(),
    content: blocksSchema,
    quote: z.string(),
    contentAfterQuote: blocksSchema,
    seo: seoSchema,
  }),
});

export const collections = { services, projects, blogs };

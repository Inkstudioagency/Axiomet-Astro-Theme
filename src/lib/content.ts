/**
 * Queries used by the pages and sections. Like the collection lists of the original
 * template, entries are sorted by their `order` field (the "Serial Number"):
 * 'asc' = 01, 02, 03... and 'desc' = the highest number first. Each section then
 * takes its slice (limit / offset) of that list; see the section components.
 */
import { getCollection, type CollectionEntry } from 'astro:content';

export type Service = CollectionEntry<'services'>['data'];
export type Project = CollectionEntry<'projects'>['data'];
export type Blog = CollectionEntry<'blogs'>['data'];
export type Order = 'asc' | 'desc';

/** By order, then by creation date for entries with the same order */
const byOrder =
  (direction: Order) =>
  <T extends { order: number; createdAt: Date }>(a: T, b: T) => {
    const diff = a.order - b.order || a.createdAt.getTime() - b.createdAt.getTime();
    return direction === 'asc' ? diff : -diff;
  };

export async function getServices(direction: Order = 'asc'): Promise<Service[]> {
  return (await getCollection('services')).map((e) => e.data).sort(byOrder(direction));
}

export async function getProjects(direction: Order = 'asc'): Promise<Project[]> {
  return (await getCollection('projects')).map((e) => e.data).sort(byOrder(direction));
}

export async function getBlogs(direction: Order = 'asc'): Promise<Blog[]> {
  return (await getCollection('blogs')).map((e) => e.data).sort(byOrder(direction));
}

/** 1 -> "01" (the service list numbers) */
export const pad = (value: number) => String(value).padStart(2, '0');

/** "September 4, 2026" */
export function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

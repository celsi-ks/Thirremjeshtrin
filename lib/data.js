import { cache } from 'react';
import { sbServer } from './supabase';
import { slugify, idFromSlug } from './util';

export const getCategories = cache(async () => {
  const { data } = await sbServer().from('categories').select('id,name').order('name');
  return data || [];
});
export const getCities = cache(async () => {
  const { data } = await sbServer().from('cities').select('id,name').order('name');
  return data || [];
});

export async function findCategory(slug) {
  return (await getCategories()).find((c) => slugify(c.name) === slug) || null;
}
export async function findCity(slug) {
  return (await getCities()).find((c) => slugify(c.name) === slug) || null;
}

/** Mjeshtrat e aprovuar (nga pamja craftsmen_public), opsionalisht të filtruar. */
export async function getCraftsmen({ categoryId, cityId } = {}) {
  let q = sbServer().from('craftsmen_public').select('*').order('created_at', { ascending: false });
  if (categoryId) q = q.eq('category_id', categoryId);
  if (cityId) q = q.eq('city_id', cityId);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data || [];
}

export const getCraftsman = cache(async (slug) => {
  const id = idFromSlug(slug);
  if (!id) return null;
  const { data } = await sbServer().from('craftsmen_public').select('*').eq('id', id).maybeSingle();
  return data;
});

export async function getReviews(craftsmanId) {
  const { data } = await sbServer()
    .from('reviews').select('id,craftsman_id,client_id,rating,author_name,comment,created_at')
    .eq('craftsman_id', craftsmanId).order('created_at', { ascending: false });
  return data || [];
}

/** Lidhjet e vjetra të profesioneve (para ndryshimit të emrave, nëntor 2026) -> id e kategorisë. */
const OLD_CATEGORY_SLUGS = {
  hidraulik: 1, elektricar: 2, murator: 3, moler: 4, pastrim: 6, saldues: 8, kanalizim: 9, 'servis-kaldajash': 10,
  bravatar: 11, autoelektricist: 12, 'klima-servis': 13, 'servis-i-teknikes-se-bardhe': 14, limar: 15, vulkanizer: 16,
  mekanik: 17, tapecier: 18, parketar: 19, 'alumin-dhe-pvc': 20, izolues: 21, kopshtar: 22,
};
export async function findOldCategory(slug) {
  const id = OLD_CATEGORY_SLUGS[slug];
  return id ? (await getCategories()).find((c) => c.id === id) || null : null;
}

/** Shërbimet brenda profesioneve (p.sh. "Panele solare" te Elektrikë & Energji). */
export const getServices = cache(async () => {
  const { data } = await sbServer().from('services').select('id,category_id,name').order('name');
  return data || [];
});

import { getCategories, getCities, getServices } from '@/lib/data';
import Profile from './Profile';

export const metadata = { title: 'Profili im', robots: { index: false } };
export const revalidate = 3600;

export default async function Page() {
  const [cats, cities, services] = await Promise.all([getCategories(), getCities(), getServices()]);
  return <Profile cats={cats} cities={cities} services={services} />;
}

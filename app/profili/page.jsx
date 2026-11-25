import { getCategories, getCities } from '@/lib/data';
import Profile from './Profile';

export const metadata = { title: 'Profili im', robots: { index: false } };
export const revalidate = 3600;

export default async function Page() {
  const [cats, cities] = await Promise.all([getCategories(), getCities()]);
  return <Profile cats={cats} cities={cities} />;
}

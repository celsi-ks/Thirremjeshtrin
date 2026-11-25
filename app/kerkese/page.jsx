import { getCategories, getCities } from '@/lib/data';
import PostRequest from './PostRequest';

export const metadata = {
  title: 'Posto një kërkesë – mjeshtrat të thërrasin ty',
  description: 'Shkruaj çfarë pune të duhet dhe në cilin qytet. Mjeshtrat e atij profesioni e shohin kërkesën dhe të thërrasin vetë. Falas.',
  alternates: { canonical: '/kerkese' },
};
export const revalidate = 3600;

export default async function Page() {
  const [cats, cities] = await Promise.all([getCategories(), getCities()]);
  return <PostRequest cats={cats} cities={cities} />;
}

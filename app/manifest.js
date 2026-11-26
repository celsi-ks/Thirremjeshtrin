export default function manifest() {
  return {
    name: 'Thirr Mjeshtrin', short_name: 'Mjeshtrin',
    description: 'Gjej mjeshtër në Kosovë dhe telefono direkt.',
    start_url: '/', display: 'standalone', lang: 'sq',
    background_color: '#F5F7FA', theme_color: '#12213B',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}

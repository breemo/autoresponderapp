/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true }, // يجبر Vercel على تضمين مجلد public بالكامل
}

module.exports = nextConfig

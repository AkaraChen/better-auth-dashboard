import { Helmet } from 'react-helmet-async'
import config from '@/dashboard.config'

export function Seo() {
  const brand = config.brand

  return (
    <Helmet>
      <title>{brand} Dashboard & Landing Template</title>
      <meta name="title" content={`${brand} Dashboard & Landing Template`} />
      <meta name="description" content={`Open-source Shadcn UI dashboard + landing page template built with React (Vite) and Next.js. Clean, modern, and production-ready.`} />

      {/* Canonical */}
      <link rel="canonical" href={`https://shadcnstore.com/templates/dashboard/shadcn-dashboard-landing-template/`} />

      {/* Open Graph / Facebook / LinkedIn */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={brand} />
      <meta property="og:title" content={`${brand} Dashboard & Landing Template`} />
      <meta property="og:description" content="Open-source Shadcn UI dashboard + landing page template built with React (Vite) and Next.js. Clean, modern, and production-ready." />
      <meta property="og:url" content="https://shadcnstore.com/templates/dashboard/shadcn-dashboard-landing-template/" />
      <meta property="og:image" content="https://shadcnstore.com/templates/dashboard/shadcn-dashboard-landing-template/og-image.png" />
      <meta property="og:image:alt" content={`Screenshot of the ${brand} Dashboard & Landing Template`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${brand} Dashboard & Landing Template`} />
      <meta name="twitter:description" content="Open-source Shadcn UI dashboard + landing page template built with React (Vite) and Next.js. Clean, modern, and production-ready." />
      <meta name="twitter:image" content="https://shadcnstore.com/templates/dashboard/shadcn-dashboard-landing-template/og-image.png" />
      <meta name="twitter:image:alt" content={`Screenshot of the ${brand} Dashboard & Landing Template`} />
    </Helmet>
  )
}

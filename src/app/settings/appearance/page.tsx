"use client"

import { BaseLayout } from "@/components/layouts/base-layout"
import { AppearanceThemeCustomizer } from "./components/appearance-theme-customizer"

export default function AppearanceSettings() {
  return (
    <BaseLayout>
      <div className="space-y-6 px-4 lg:px-6">
        <div>
          <h1 className="text-3xl font-bold">Appearance</h1>
          <p className="text-muted-foreground">
            Customize the appearance of the application.
          </p>
        </div>

        <AppearanceThemeCustomizer />
      </div>
    </BaseLayout>
  )
}

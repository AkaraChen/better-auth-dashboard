"use client"

import React from 'react'
import { Layout, Palette, Dices, Upload, ExternalLink, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useThemeManager } from '@/hooks/use-theme-manager'
import { useCircularTransition } from '@/hooks/use-circular-transition'
import { useSidebarConfig } from '@/contexts/sidebar-context'
import { useSidebar } from '@/components/ui/sidebar'
import { tweakcnThemes, colorThemes } from '@/config/theme-data'
import { radiusOptions, baseColors, sidebarVariants, sidebarCollapsibleOptions, sidebarSideOptions } from '@/config/theme-customizer-constants'
import { ColorPicker } from '@/components/color-picker'
import { ImportModal } from '@/components/theme-customizer/import-modal'
import type { ImportedTheme } from '@/types/theme-customizer'
import "./circular-transition.css"

export function AppearanceThemeCustomizer() {
  const { applyImportedTheme, isDarkMode, resetTheme, applyRadius, setBrandColorsValues, applyTheme, applyTweakcnTheme, brandColorsValues, handleColorChange } = useThemeManager()
  const { toggleTheme } = useCircularTransition()
  const { config: sidebarConfig, updateConfig: updateSidebarConfig } = useSidebarConfig()
  const { toggleSidebar, state: sidebarState } = useSidebar()

  const [selectedTheme, setSelectedTheme] = React.useState("")
  const [selectedTweakcnTheme, setSelectedTweakcnTheme] = React.useState("")
  const [selectedRadius, setSelectedRadius] = React.useState("0.5rem")
  const [importModalOpen, setImportModalOpen] = React.useState(false)
  const [importedTheme, setImportedTheme] = React.useState<ImportedTheme | null>(null)

  const handleImport = (themeData: ImportedTheme) => {
    setImportedTheme(themeData)
    setSelectedTheme("")
    setSelectedTweakcnTheme("")
    applyImportedTheme(themeData, isDarkMode)
  }

  const handleRandomShadcn = () => {
    const randomTheme = colorThemes[Math.floor(Math.random() * colorThemes.length)]
    setSelectedTheme(randomTheme.value)
    setSelectedTweakcnTheme("")
    setBrandColorsValues({})
    setImportedTheme(null)
    applyTheme(randomTheme.value, isDarkMode)
  }

  const handleRandomTweakcn = () => {
    const randomTheme = tweakcnThemes[Math.floor(Math.random() * tweakcnThemes.length)]
    setSelectedTweakcnTheme(randomTheme.value)
    setSelectedTheme("")
    setBrandColorsValues({})
    setImportedTheme(null)
    applyTweakcnTheme(randomTheme.preset, isDarkMode)
  }

  const handleRadiusSelect = (radius: string) => {
    setSelectedRadius(radius)
    applyRadius(radius)
  }

  const handleLightMode = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isDarkMode === false) return
    toggleTheme(event)
  }

  const handleDarkMode = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isDarkMode === true) return
    toggleTheme(event)
  }

  const handleSidebarVariantSelect = (variant: "sidebar" | "floating" | "inset") => {
    updateSidebarConfig({ variant })
  }

  const handleSidebarCollapsibleSelect = (collapsible: "offcanvas" | "icon" | "none") => {
    updateSidebarConfig({ collapsible })
    if (collapsible === "icon" && sidebarState === "expanded") {
      toggleSidebar()
    }
  }

  const handleSidebarSideSelect = (side: "left" | "right") => {
    updateSidebarConfig({ side })
  }

  React.useEffect(() => {
    if (importedTheme) {
      applyImportedTheme(importedTheme, isDarkMode)
    } else if (selectedTheme) {
      applyTheme(selectedTheme, isDarkMode)
    } else if (selectedTweakcnTheme) {
      const selectedPreset = tweakcnThemes.find(t => t.value === selectedTweakcnTheme)?.preset
      if (selectedPreset) {
        applyTweakcnTheme(selectedPreset, isDarkMode)
      }
    }
  }, [isDarkMode, importedTheme, selectedTheme, selectedTweakcnTheme, applyImportedTheme, applyTheme, applyTweakcnTheme])

  return (
    <>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Theme Settings */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Palette className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium">Theme</h3>
          </div>

          {/* Mode */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Mode</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={!isDarkMode ? "secondary" : "outline"}
                size="sm"
                onClick={handleLightMode}
                className="cursor-pointer mode-toggle-button relative overflow-hidden"
              >
                <Sun className="h-4 w-4 mr-1 transition-transform duration-300" />
                Light
              </Button>
              <Button
                variant={isDarkMode ? "secondary" : "outline"}
                size="sm"
                onClick={handleDarkMode}
                className="cursor-pointer mode-toggle-button relative overflow-hidden"
              >
                <Moon className="h-4 w-4 mr-1 transition-transform duration-300" />
                Dark
              </Button>
            </div>
          </div>

          <Separator />

          {/* Shadcn UI Theme Presets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Shadcn UI Theme Presets</Label>
              <Button variant="outline" size="sm" onClick={handleRandomShadcn} className="cursor-pointer">
                <Dices className="h-3.5 w-3.5 mr-1.5" />
                Random
              </Button>
            </div>

            <Select value={selectedTheme} onValueChange={(value) => {
              setSelectedTheme(value)
              setSelectedTweakcnTheme("")
              setBrandColorsValues({})
              setImportedTheme(null)
              applyTheme(value, isDarkMode)
            }}>
              <SelectTrigger className="w-full cursor-pointer">
                <SelectValue placeholder="Choose Shadcn Theme" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <div className="p-2">
                  {colorThemes.map((theme) => (
                    <SelectItem key={theme.value} value={theme.value} className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div
                            className="w-3 h-3 rounded-full border border-border/20"
                            style={{ backgroundColor: theme.preset.styles.light.primary }}
                          />
                          <div
                            className="w-3 h-3 rounded-full border border-border/20"
                            style={{ backgroundColor: theme.preset.styles.light.secondary }}
                          />
                          <div
                            className="w-3 h-3 rounded-full border border-border/20"
                            style={{ backgroundColor: theme.preset.styles.light.accent }}
                          />
                          <div
                            className="w-3 h-3 rounded-full border border-border/20"
                            style={{ backgroundColor: theme.preset.styles.light.muted }}
                          />
                        </div>
                        <span>{theme.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </div>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Tweakcn Theme Presets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Tweakcn Theme Presets</Label>
              <Button variant="outline" size="sm" onClick={handleRandomTweakcn} className="cursor-pointer">
                <Dices className="h-3.5 w-3.5 mr-1.5" />
                Random
              </Button>
            </div>

            <Select value={selectedTweakcnTheme} onValueChange={(value) => {
              setSelectedTweakcnTheme(value)
              setSelectedTheme("")
              setBrandColorsValues({})
              setImportedTheme(null)
              const selectedPreset = tweakcnThemes.find(t => t.value === value)?.preset
              if (selectedPreset) {
                applyTweakcnTheme(selectedPreset, isDarkMode)
              }
            }}>
              <SelectTrigger className="w-full cursor-pointer">
                <SelectValue placeholder="Choose Tweakcn Theme" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <div className="p-2">
                  {tweakcnThemes.map((theme) => (
                    <SelectItem key={theme.value} value={theme.value} className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div
                            className="w-3 h-3 rounded-full border border-border/20"
                            style={{ backgroundColor: theme.preset.styles.light.primary }}
                          />
                          <div
                            className="w-3 h-3 rounded-full border border-border/20"
                            style={{ backgroundColor: theme.preset.styles.light.secondary }}
                          />
                          <div
                            className="w-3 h-3 rounded-full border border-border/20"
                            style={{ backgroundColor: theme.preset.styles.light.accent }}
                          />
                          <div
                            className="w-3 h-3 rounded-full border border-border/20"
                            style={{ backgroundColor: theme.preset.styles.light.muted }}
                          />
                        </div>
                        <span>{theme.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </div>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Radius Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Radius</Label>
            <div className="grid grid-cols-5 gap-2">
              {radiusOptions.map((option) => (
                <div
                  key={option.value}
                  className={`relative cursor-pointer rounded-md p-3 border transition-colors ${
                    selectedRadius === option.value
                      ? "border-primary"
                      : "border-border hover:border-border/60"
                  }`}
                  onClick={() => handleRadiusSelect(option.value)}
                >
                  <div className="text-center">
                    <div className="text-xs font-medium">{option.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Import Theme Button */}
          <Button
            variant="outline"
            size="lg"
            onClick={() => setImportModalOpen(true)}
            className="w-full cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            Import Theme
          </Button>

          {/* Brand Colors Section */}
          <Accordion type="single" collapsible className="w-full border-b rounded-lg">
            <AccordionItem value="brand-colors" className="border border-border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 transition-colors">
                <Label className="text-sm font-medium cursor-pointer">Brand Colors</Label>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-3 border-t border-border bg-muted/20">
                {baseColors.map((color) => (
                  <div key={color.cssVar} className="flex items-center justify-between">
                    <ColorPicker
                      label={color.name}
                      cssVar={color.cssVar}
                      value={brandColorsValues[color.cssVar] || ""}
                      onChange={handleColorChange}
                    />
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Tweakcn */}
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Advanced Customization</span>
            </div>
            <p className="text-xs text-muted-foreground">
              For advanced theme customization with real-time preview, visual color picker, and hundreds of prebuilt themes, visit{" "}
              <a
                href="https://tweakcn.com/editor/theme"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium cursor-pointer"
              >
                tweakcn.com
              </a>
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full cursor-pointer"
              onClick={() => window.open('https://tweakcn.com/editor/theme', '_blank')}
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              Open Tweakcn
            </Button>
          </div>
        </div>

        {/* Layout Settings */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Layout className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium">Layout</h3>
          </div>

          {/* Sidebar Variant */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Sidebar Variant</Label>
            {sidebarConfig.variant && (
              <p className="text-xs text-muted-foreground mt-1">
                {sidebarConfig.variant === "sidebar" && "Default: Standard sidebar layout"}
                {sidebarConfig.variant === "floating" && "Floating: Floating sidebar with border"}
                {sidebarConfig.variant === "inset" && "Inset: Inset sidebar with rounded corners"}
              </p>
            )}
            <div className="grid grid-cols-3 gap-3">
              {sidebarVariants.map((variant) => (
                <div
                  key={variant.value}
                  className={`relative p-4 border rounded-md cursor-pointer transition-colors ${
                    sidebarConfig.variant === variant.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-border/60"
                  }`}
                  onClick={() => handleSidebarVariantSelect(variant.value as "sidebar" | "floating" | "inset")}
                >
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-center">{variant.name}</div>
                    <div className={`flex h-12 rounded border ${ variant.value === "inset" ? "bg-muted" : "bg-background" }`}>
                      <div
                        className={`w-3 flex-shrink-0 bg-muted flex flex-col gap-0.5 p-1 ${
                          variant.value === "floating" ? "border-r m-1 rounded" :
                          variant.value === "inset" ? "m-1 ms-0 rounded bg-muted/80" :
                          "border-r"
                        }`}
                      >
                        <div className="h-0.5 w-full bg-foreground/60 rounded"></div>
                        <div className="h-0.5 w-3/4 bg-foreground/50 rounded"></div>
                        <div className="h-0.5 w-2/3 bg-foreground/40 rounded"></div>
                        <div className="h-0.5 w-3/4 bg-foreground/30 rounded"></div>
                      </div>
                      <div className={`flex-1 ${ variant.value === "inset" ? "bg-background ms-0" : "bg-background/50" } m-1 rounded-sm border-dashed border border-muted-foreground/20`}>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Sidebar Collapsible Mode */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Sidebar Collapsible Mode</Label>
            {sidebarConfig.collapsible && (
              <p className="text-xs text-muted-foreground mt-1">
                {sidebarConfig.collapsible === "offcanvas" && "Off Canvas: Slides out of view"}
                {sidebarConfig.collapsible === "icon" && "Icon: Collapses to icon only"}
                {sidebarConfig.collapsible === "none" && "None: Always visible"}
              </p>
            )}
            <div className="grid grid-cols-3 gap-3">
              {sidebarCollapsibleOptions.map((option) => (
                <div
                  key={option.value}
                  className={`relative p-4 border rounded-md cursor-pointer transition-colors ${
                    sidebarConfig.collapsible === option.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-border/60"
                  }`}
                  onClick={() => handleSidebarCollapsibleSelect(option.value as "offcanvas" | "icon" | "none")}
                >
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-center">{option.name}</div>
                    <div className="flex h-12 rounded border bg-background">
                      {option.value === "offcanvas" ? (
                        <div className="flex-1 bg-background/50 m-1 rounded-sm border-dashed border border-muted-foreground/20 flex items-center justify-start pl-2">
                          <div className="flex flex-col gap-0.5">
                            <div className="w-3 h-0.5 bg-foreground/60 rounded"></div>
                            <div className="w-3 h-0.5 bg-foreground/60 rounded"></div>
                            <div className="w-3 h-0.5 bg-foreground/60 rounded"></div>
                          </div>
                        </div>
                      ) : option.value === "icon" ? (
                        <>
                          <div className="w-4 flex-shrink-0 bg-muted flex flex-col gap-1 p-1 border-r items-center">
                            <div className="w-2 h-2 bg-foreground/60 rounded-sm"></div>
                            <div className="w-2 h-2 bg-foreground/40 rounded-sm"></div>
                            <div className="w-2 h-2 bg-foreground/30 rounded-sm"></div>
                          </div>
                          <div className="flex-1 bg-background/50 m-1 rounded-sm border-dashed border border-muted-foreground/20"></div>
                        </>
                      ) : (
                        <>
                          <div className="w-6 flex-shrink-0 bg-muted flex flex-col gap-0.5 p-1 border-r">
                            <div className="h-0.5 w-full bg-foreground/60 rounded"></div>
                            <div className="h-0.5 w-3/4 bg-foreground/50 rounded"></div>
                            <div className="h-0.5 w-2/3 bg-foreground/40 rounded"></div>
                            <div className="h-0.5 w-3/4 bg-foreground/30 rounded"></div>
                          </div>
                          <div className="flex-1 bg-background/50 m-1 rounded-sm border-dashed border border-muted-foreground/20"></div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Sidebar Side */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Sidebar Position</Label>
            {sidebarConfig.side && (
              <p className="text-xs text-muted-foreground mt-1">
                {sidebarConfig.side === "left" && "Left: Sidebar positioned on the left side"}
                {sidebarConfig.side === "right" && "Right: Sidebar positioned on the right side"}
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              {sidebarSideOptions.map((side) => (
                <div
                  key={side.value}
                  className={`relative p-4 border rounded-md cursor-pointer transition-colors ${
                    sidebarConfig.side === side.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-border/60"
                  }`}
                  onClick={() => handleSidebarSideSelect(side.value as "left" | "right")}
                >
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-center">{side.name}</div>
                    <div className="flex h-12 rounded border bg-background">
                      {side.value === "left" ? (
                        <>
                          <div className="w-6 flex-shrink-0 bg-muted flex flex-col gap-0.5 p-1 border-r">
                            <div className="h-0.5 w-full bg-foreground/60 rounded"></div>
                            <div className="h-0.5 w-3/4 bg-foreground/50 rounded"></div>
                            <div className="h-0.5 w-2/3 bg-foreground/40 rounded"></div>
                            <div className="h-0.5 w-3/4 bg-foreground/30 rounded"></div>
                          </div>
                          <div className="flex-1 bg-background/50 m-1 rounded-sm border-dashed border border-muted-foreground/20"></div>
                        </>
                      ) : (
                        <>
                          <div className="flex-1 bg-background/50 m-1 rounded-sm border-dashed border border-muted-foreground/20"></div>
                          <div className="w-6 flex-shrink-0 bg-muted flex flex-col gap-0.5 p-1 border-l">
                            <div className="h-0.5 w-full bg-foreground/60 rounded"></div>
                            <div className="h-0.5 w-3/4 bg-foreground/50 rounded"></div>
                            <div className="h-0.5 w-2/3 bg-foreground/40 rounded"></div>
                            <div className="h-0.5 w-3/4 bg-foreground/30 rounded"></div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ImportModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onImport={handleImport}
      />
    </>
  )
}

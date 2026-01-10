"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface MultiSelectComboboxProps {
  value: string[]
  onChange: (values: string[]) => void
  options: string[]
  placeholder?: string
  allowCustom?: boolean
  disabled?: boolean
  className?: string
}

export function MultiSelectCombobox({
  value,
  onChange,
  options,
  placeholder = "Select roles...",
  allowCustom = true,
  disabled = false,
  className,
}: MultiSelectComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const handleSelect = (selectedValue: string) => {
    if (value.includes(selectedValue)) {
      onChange(value.filter((v) => v !== selectedValue))
    } else {
      onChange([...value, selectedValue])
    }
  }

  const handleRemove = (valueToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(value.filter((v) => v !== valueToRemove))
  }

  const handleCreateCustom = () => {
    const trimmedValue = inputValue.trim()
    if (trimmedValue && !value.includes(trimmedValue)) {
      onChange([...value, trimmedValue])
      setInputValue("")
    }
  }

  const availableOptions = options.filter((option) => !value.includes(option))

  return (
    <div className={cn("space-y-2", className)}>
      {/* Trigger with badges inside */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "border-input bg-background ring-offset-background",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2",
              "data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50",
              "flex w-full flex-wrap items-center gap-1.5 rounded-md border px-3 py-2 text-sm shadow-sm",
              "min-h-10 transition-colors",
              "outline-none",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            {value.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              value.map((item) => (
                <Badge
                  key={item}
                  variant="secondary"
                  className="gap-1 pr-1.5 text-xs font-medium"
                >
                  {item}
                  {!disabled && (
                    <button
                      type="button"
                      onClick={(e) => handleRemove(item, e)}
                      className="hover:bg-secondary-foreground/20 rounded-sm p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))
            )}
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start" side="bottom">
          <Command>
            <CommandInput
              placeholder="Search roles..."
              value={inputValue}
              onValueChange={setInputValue}
              className="h-9"
            />
            <CommandList>
              {availableOptions.length === 0 ? (
                <CommandEmpty>
                  {allowCustom ? (
                    <div className="flex flex-col gap-1 py-3">
                      <span className="text-muted-foreground px-2 text-xs">
                        No roles found.
                      </span>
                      {inputValue.trim() && (
                        <button
                          type="button"
                          className="hover:bg-accent hover:text-accent-foreground relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCreateCustom()
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Create "{inputValue.trim()}"
                        </button>
                      )}
                    </div>
                  ) : (
                    "No roles found."
                  )}
                </CommandEmpty>
              ) : (
                <CommandGroup>
                  {availableOptions.map((option) => (
                    <CommandItem
                      key={option}
                      value={option}
                      onSelect={() => handleSelect(option)}
                      className="cursor-pointer"
                    >
                      <Check className="mr-2 h-4 w-4 opacity-0" />
                      <span className="flex-1">{option}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {allowCustom && inputValue.trim() && !options.includes(inputValue.trim()) && availableOptions.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      value={`create-${inputValue}`}
                      onSelect={handleCreateCustom}
                      className="cursor-pointer"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      <span className="flex-1">
                        Create "{inputValue.trim()}"
                      </span>
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

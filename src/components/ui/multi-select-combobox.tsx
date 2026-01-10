"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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

  const handleRemove = (valueToRemove: string) => {
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
      {/* Selected badges */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((item) => (
            <Badge
              key={item}
              variant="secondary"
              className="gap-1 pr-1"
            >
              {item}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                onClick={() => handleRemove(item)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Combobox trigger */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between"
          >
            {value.length === 0
              ? placeholder
              : `${value.length} role${value.length > 1 ? "s" : ""} selected`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search roles..."
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandList>
              {availableOptions.length === 0 ? (
                <CommandEmpty>
                  {allowCustom ? (
                    <div className="flex items-center gap-2 px-2 py-1.5">
                      <span className="text-sm">No roles found.</span>
                      {inputValue.trim() && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-primary"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCreateCustom()
                          }}
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Create "{inputValue.trim()}"
                        </Button>
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
                    >
                      <Check className="mr-2 h-4 w-4 opacity-0" />
                      {option}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {allowCustom && inputValue.trim() && !options.includes(inputValue.trim()) && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      value={`create-${inputValue}`}
                      onSelect={handleCreateCustom}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create "{inputValue.trim()}"
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

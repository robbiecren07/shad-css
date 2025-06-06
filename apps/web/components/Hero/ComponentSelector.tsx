'use client'

import type { ComponentItem } from '@/types'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Check, ChevronDown, ExternalLink, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { capitalize } from '@/utils/helpers'
import styles from './hero.module.scss'

interface Props {
  data: ComponentItem[]
}

export default function ComponentSelector({ data }: Props) {
  const [open, setOpen] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState<(typeof data)[0] | null>(null)

  return (
    <>
      <div className={styles.selector}>
        <div className={styles.selector_header}>
          <h3 className={styles.selector_header_title}>Select a component to get started</h3>
        </div>

        <div className={styles.selector_popover}>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="secondary"
                role="combobox"
                aria-expanded={open}
                className={styles.selector_comboboxBtn}
              >
                {selectedComponent ? (
                  <span className={styles.selector_comboboxValue}>
                    {capitalize(selectedComponent.name)}
                  </span>
                ) : (
                  <span className={styles.selector_placeholder}>Select a component...</span>
                )}
                <ChevronDown className={styles.selector_chevron} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className={styles.selector_popover_content} align="start">
              <Command>
                <CommandInput placeholder="Search components..." />
                <CommandList>
                  <CommandEmpty>No component found.</CommandEmpty>
                  <CommandGroup>
                    {data.map((component) => (
                      <CommandItem
                        key={component.name}
                        value={component.name}
                        onSelect={() => {
                          setSelectedComponent(component)
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            styles.combo_icon,
                            selectedComponent?.name === component.name && styles.combo_icon_active
                          )}
                        />
                        <span>{capitalize(component.name)}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {selectedComponent && (
        <Card className={styles.selectedCard}>
          <CardHeader className={styles.selectedCard_header}>
            <div className={styles.selectedCard_title}>{capitalize(selectedComponent.name)}</div>
          </CardHeader>
          <CardContent className={styles.selectedCard_content}>
            <div className="space-y-4">
              <div>
                <h4 className={styles.selectedCard_featuresTitle}>Installation</h4>
                <div className={styles.selectedCard_code_block}>
                  <div className={styles.selectedCard_code_header}>
                    <ToggleGroup type="single">
                      <ToggleGroupItem size="sm" value="npm">
                        npm
                      </ToggleGroupItem>
                      <ToggleGroupItem size="sm" value="pnpm">
                        pnpm
                      </ToggleGroupItem>
                      <ToggleGroupItem size="sm" value="yarn">
                        yarn
                      </ToggleGroupItem>
                      <ToggleGroupItem size="sm" value="bun">
                        bun
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                  <code className={styles.selectedCard_code_text}>
                    bunx --bun shadcn@latest add toggle-group
                  </code>
                </div>
              </div>

              <div className={styles.selectedCard_action}>
                <Button className={styles.selectedCard_docBtn} asChild>
                  <Link href={`/docs/${selectedComponent.name}`} target="_self">
                    View Our Docs
                  </Link>
                </Button>

                <Button className={styles.selectedCard_docBtn} asChild>
                  <Link href={`/docs/${selectedComponent.name}`} target="_blank" rel="nofollow">
                    <ExternalLink className={styles.selectedCard_docIcon} />
                    View Shadcn's Docs
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}

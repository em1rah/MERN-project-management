import { Palette, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'

const themeSwatches = {
  light: 'bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300',
  dark: 'bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-600',
  system: 'bg-gradient-to-br from-slate-200 to-slate-400 border border-slate-400',
  blue: 'bg-blue-500',
  rose: 'bg-rose-500',
  green: 'bg-emerald-500',
  violet: 'bg-violet-500',
  amber: 'bg-amber-500',
  'dark-blue': 'bg-blue-700',
  'dark-rose': 'bg-rose-700',
  'dark-green': 'bg-emerald-700',
  'dark-violet': 'bg-violet-700',
}

export function ModeToggle() {
  const { theme, setTheme, themeOptions } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Choose theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-muted-foreground">Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themeOptions.filter((o) => ['light', 'dark', 'system'].includes(o.value)).map((opt) => (
          <DropdownMenuItem key={opt.value} onClick={() => setTheme(opt.value)}>
            <span
              className={cn(
                'mr-3 h-5 w-5 shrink-0 rounded-full border',
                themeSwatches[opt.value] || 'bg-muted'
              )}
            />
            <span className="flex-1">{opt.label}</span>
            {theme === opt.value && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-muted-foreground">Color themes</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themeOptions.filter((o) => !['light', 'dark', 'system'].includes(o.value)).map((opt) => (
          <DropdownMenuItem key={opt.value} onClick={() => setTheme(opt.value)}>
            <span
              className={cn(
                'mr-3 h-5 w-5 shrink-0 rounded-full border',
                themeSwatches[opt.value] || 'bg-muted'
              )}
            />
            <span className="flex-1">{opt.label}</span>
            {theme === opt.value && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ThemePickerCompact() {
  const { theme, setTheme } = useTheme()
  return (
    <div className="flex flex-wrap gap-1.5">
      {['light', 'dark', 'blue', 'rose', 'green', 'violet', 'amber'].map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => setTheme(t)}
          title={t.charAt(0).toUpperCase() + t.slice(1)}
          className={cn(
            'h-6 w-6 rounded-full border-2 transition-all hover:scale-110',
            themeSwatches[t] || 'bg-muted',
            theme === t ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'border-transparent'
          )}
        />
      ))}
    </div>
  )
}

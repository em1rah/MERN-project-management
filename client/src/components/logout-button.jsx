import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useNavigate } from 'react-router-dom'

export function LogoutButton({ variant = 'outline', showLabel = true, className }) {
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/signin')
  }

  const logoutHighlight =
    'border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 hover:text-red-700 dark:border-red-800/70 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:border-red-700 dark:hover:text-red-300'

  if (showLabel) {
    return (
      <Button
        variant={variant}
        onClick={handleLogout}
        className={`${logoutHighlight} ${className ?? ''}`}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={`${logoutHighlight} ${className ?? ''}`}>
          <LogOut className="h-4 w-4" />
          <span className="sr-only">Logout</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-red-600 focus:bg-red-50 focus:text-red-700 dark:text-red-400 dark:focus:bg-red-950/40 dark:focus:text-red-300"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

import type { ReactNode } from 'react'
import { AppShell } from '@/components/shell/app-shell'
import { StoreProvider } from '@/lib/use-store'

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <AppShell>{children}</AppShell>
    </StoreProvider>
  )
}

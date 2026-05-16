'use client'

import type { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import type { PermissionKey } from '@/lib/types'

interface PermissionGuardProps {
  permission?: PermissionKey
  ownerOnly?: boolean
  fallback?: ReactNode
  children: ReactNode
}

export default function PermissionGuard({
  permission,
  ownerOnly,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { isOwner, hasPermission } = useAuth()

  if (ownerOnly && !isOwner) return <>{fallback}</>
  if (permission && !isOwner && !hasPermission(permission)) return <>{fallback}</>

  return <>{children}</>
}

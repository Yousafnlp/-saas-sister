'use client';

import { Fragment } from 'react';
import { Check, Lock, Minus, Pencil, Trash2 } from 'lucide-react';
import { ADMIN_ROLE, PERMISSION_GROUPS } from '@daesthetics/shared';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/status-badge';
import { ROLE_TONE, type Role } from './types';

interface RolesMatrixProps {
  roles: Role[];
  memberCounts: Record<string, number>;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

/** Permissions down the side, roles across the top, so roles are easy to compare. */
export function RolesMatrix({ roles, memberCounts, onEdit, onDelete }: RolesMatrixProps) {
  const columns = roles.length + 1;

  return (
    <div className="bg-card">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="min-w-56 px-3 py-3 align-bottom text-xs font-medium text-muted-foreground">Permission</TableHead>
            {roles.map((role) => {
              const members = memberCounts[role.name] ?? 0;
              return (
                <TableHead key={role.name} className="min-w-32 px-3 py-3 text-center align-bottom">
                  <div className="flex flex-col items-center gap-1">
                    <StatusBadge label={role.name} tone={ROLE_TONE[role.name] ?? 'neutral'} />
                    <span className="text-xs font-normal text-muted-foreground">
                      {members} {members === 1 ? 'member' : 'members'}
                    </span>
                    <div className="flex h-7 items-center gap-0.5">
                      {role.name === ADMIN_ROLE ? (
                        <span className="text-muted-foreground" title="Admins always have full access">
                          <Lock className="size-3.5" />
                          <span className="sr-only">Admins always have full access</span>
                        </span>
                      ) : (
                        <>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground"
                            onClick={() => onEdit(role)}
                            aria-label={`Edit ${role.name}`}
                            title={`Edit ${role.name}`}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          {!role.builtIn && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => onDelete(role)}
                              aria-label={`Delete ${role.name}`}
                              title={`Delete ${role.name}`}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {PERMISSION_GROUPS.map((group) => (
            <Fragment key={group.label}>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableCell
                  colSpan={columns}
                  className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {group.label}
                </TableCell>
              </TableRow>
              {group.permissions.map((permission) => (
                <TableRow key={permission.key} className="hover:bg-muted/40">
                  <TableCell className="whitespace-normal px-3 py-3">
                    <p className="font-medium text-foreground">{permission.label}</p>
                    <p className="text-xs text-muted-foreground">{permission.description}</p>
                  </TableCell>
                  {roles.map((role) => (
                    <TableCell key={role.name} className="px-3 py-3 text-center">
                      {role.permissions.includes(permission.key) ? (
                        <>
                          <Check className="mx-auto size-4 text-success" aria-hidden />
                          <span className="sr-only">Allowed</span>
                        </>
                      ) : (
                        <>
                          <Minus className="mx-auto size-4 text-muted-foreground/40" aria-hidden />
                          <span className="sr-only">Not allowed</span>
                        </>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

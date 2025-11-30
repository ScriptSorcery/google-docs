import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState, useRef } from 'react'
import { toast } from 'sonner'
import type { DocumentItem } from '@/utils/types'
import { subscribeDocuments, removeDocument } from '@/firebase/firestoreService'

const StatusPill = ({ status }: { status: string }) => {
  const base = 'px-2 py-0.5 rounded-full text-xs font-medium border-0'

  const colors =
    status === 'Active'
      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100'
      : status === 'Draft'
        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100'
        : 'bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-100'

  return (
    <Badge className={`${base} ${colors}`}>
      {status}
    </Badge>
  )
}

const List = () => {
  const navigate = useNavigate()

  const [docs, setDocs] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [query, setQuery] = useState('')
  const searchRef = useRef<number | null>(null)

  // rawAll holds the full list from Firestore; docs is filtered view
  const rawAllRef = useRef<DocumentItem[]>([])

  useEffect(() => {
    setLoading(true)
    const unsub = subscribeDocuments((items) => {
      rawAllRef.current = items
      // apply current search query immediately
      const q = query.trim().toLowerCase()
      if (!q) setDocs(items)
      else setDocs(items.filter(it => ((it.title || '') + ' ' + (it.content || '')).toLowerCase().includes(q)))
      setLoading(false)
    })

    // on error path subscribeDocuments will call callback([]). We still want to catch subscribe errors separately if needed.
    return () => unsub()
    // intentionally not listing `query` as dependency; search logic handled separately
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounced client-side search — filters rawAllRef.current
  useEffect(() => {
    if (searchRef.current) {
      clearTimeout(searchRef.current)
      searchRef.current = null
    }
    searchRef.current = window.setTimeout(() => {
      const q = query.trim().toLowerCase()
      const items = rawAllRef.current
      if (!q) setDocs(items)
      else setDocs(items.filter(it => ((it.title || '') + ' ' + (it.content || '')).toLowerCase().includes(q)))
    }, 350)
    return () => {
      if (searchRef.current) clearTimeout(searchRef.current)
    }
  }, [query])

  const formatUpdated = (d?: any) => {
    if (!d) return '-'
    // Firestore Timestamp has seconds + nanoseconds.
    if (typeof d === 'object' && d?.seconds) return new Date(d.seconds * 1000).toLocaleDateString()
    try {
      return new Date(d).toLocaleDateString()
    } catch {
      return '-'
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!confirm('Delete this document? This cannot be undone.')) return
    try {
      await removeDocument(id)
      // optimistic update — also the realtime subscription will update shortly
      setDocs((prev) => prev.filter((d) => d.id !== id))
      rawAllRef.current = rawAllRef.current.filter(d => d.id !== id)
      toast.success('Document deleted.')
    } catch (err: any) {
      console.error('Delete failed', err)
      toast.error(err?.message || 'Failed to delete document.')
    }
  }

  return (
    <main className="min-h-screen bg-muted/40 flex justify-center px-4 py-8">
      <div className="w-full max-w-5xl space-y-4">
        {/* Page header */}
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
            <p className="text-sm text-muted-foreground">
              Manage all your project docs in one place. Create, edit, or clone existing items.
            </p>
          </div>
          <Button size="sm" onClick={() => navigate('/doc/new')}>
            + New Item
          </Button>
        </div>

        {/* Card with search + list */}
        <Card className="shadow-sm border-border/60">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg">All documents</CardTitle>
                <CardDescription>
                  Quick overview of your recent items with status and last updated time.
                </CardDescription>
              </div>
              <div className="w-full sm:w-64">
                <Input
                  type="search"
                  placeholder="Search documents..."
                  className="h-9 text-sm"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[140px]">Updated</TableHead>
                    <TableHead className="text-right w-[170px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                        Loading…
                      </TableCell>
                    </TableRow>
                  )}

                  {!loading && !error && docs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                        No documents yet. Click{" "}
                        <button
                          type="button"
                          className="underline underline-offset-2"
                          onClick={() => navigate('/doc/new')}
                        >
                          New Item
                        </button>{" "}
                        to get started.
                      </TableCell>
                    </TableRow>
                  )}

                  {!loading && error && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-sm text-red-500">
                        {error}
                      </TableCell>
                    </TableRow>
                  )}

                  {!loading && docs.map((item: DocumentItem) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-muted/40 cursor-pointer"
                      onDoubleClick={() => navigate(`/doc/${item.id}`)}
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{item.title}</span>
                          <span className="text-xs text-muted-foreground">
                            ID: {item.id}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <span className="text-sm text-muted-foreground">
                          {item.content ? item.content.slice(0, 80) : '-'}
                        </span>
                      </TableCell>
                      <TableCell className="align-top">
                        <StatusPill status={item.content ? 'Active' : 'Draft'} />
                      </TableCell>
                      <TableCell className="align-top">
                        <span className="text-sm text-muted-foreground">
                          {formatUpdated(item.updatedAt || item.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right align-top">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/doc/new?clone=${item.id}`)
                            }}
                          >
                            Clone
                          </Button>
                          <Button
                            size="sm"
                            className="text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/doc/${item.id}`)
                            }}
                          >
                            Open
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="text-xs"
                            onClick={(e) => item?.id && handleDelete(e, item.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default List

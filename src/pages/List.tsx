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

const dummyItems = [
  { id: 1, name: 'Project Alpha', desc: 'Initial prototype', status: 'Active',   updated: '2025-11-20' },
  { id: 2, name: 'Design Review', desc: 'UI/UX pass',        status: 'Draft',    updated: '2025-11-18' },
  { id: 3, name: 'Marketing Plan', desc: 'Q1 launch',        status: 'Archived', updated: '2025-10-30' },
  { id: 4, name: 'Integration',    desc: 'API work',          status: 'Active',   updated: '2025-11-28' },
]

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
                  {dummyItems.map((item) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-muted/40 cursor-pointer"
                      onDoubleClick={() => alert(`Open ${item.name}`)}
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{item.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ID: {item.id}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <span className="text-sm text-muted-foreground">
                          {item.desc}
                        </span>
                      </TableCell>
                      <TableCell className="align-top">
                        <StatusPill status={item.status} />
                      </TableCell>
                      <TableCell className="align-top">
                        <span className="text-sm text-muted-foreground">
                          {item.updated}
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
                              alert(`Open ${item.name}`)
                            }}
                          >
                            Open
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {dummyItems.length === 0 && (
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

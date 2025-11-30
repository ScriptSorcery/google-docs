import { useNavigate, useSearchParams } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export default function Page() {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const id = params.get('id')        // ?id=123  => edit mode
  const cloneId = params.get('clone') // ?clone=123 => clone mode

  const isEdit = !!id && !cloneId
  const isClone = !!cloneId
  const isCreate = !isEdit && !isClone

  const title = isEdit
    ? 'Edit Item'
    : isClone
      ? 'Clone Item'
      : 'Create New Item'

  const description = isEdit
    ? 'Update the details of your existing item.'
    : isClone
      ? 'This will create a new item based on an existing one.'
      : 'Fill in the details to create a new item.'

  const primaryCta = isEdit ? 'Save changes' : 'Save item'

  // In real app, you'd pull existing values (for edit) from API / loader
  const defaultName =
    isClone ? `Cloned ${cloneId}` : isEdit ? `Item ${id}` : ''

  const defaultDescription =
    isClone
      ? 'Cloned description'
      : isEdit
        ? 'Existing item description…'
        : ''

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: call your mutation / API here
  }

  return (
    <main className="min-h-screen bg-muted/40 flex items-start justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Top bar with title + back */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>

        {/* Card with form */}
        <Card className="shadow-sm border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {isCreate && 'Basic details'}
              {isEdit && 'Edit details'}
              {isClone && 'Clone details'}
            </CardTitle>
            <CardDescription>
              {isCreate && 'Start by giving your item a name and description.'}
              {isEdit && 'Make changes and save when you’re done.'}
              {isClone && 'You can tweak the cloned values before saving.'}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter a clear, descriptive name"
                  defaultValue={defaultName}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Add a short description of what this item is about…"
                  rows={4}
                  defaultValue={defaultDescription}
                />
                <p className="text-xs text-muted-foreground">
                  This helps others quickly understand what this item is for.
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between gap-3 border-t pt-4">
              <p className="text-xs text-muted-foreground">
                {isEdit
                  ? 'Changes will update the existing item.'
                  : 'A new item will be created when you save.'}
              </p>
              <div className="flex items-center gap-2">
                <Button type="submit">{primaryCta}</Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  )
}

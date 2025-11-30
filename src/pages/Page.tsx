import { useNavigate, useSearchParams, useParams } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { createDocument, getDocumentById, updateDocument } from '@/firebase/firestoreService'

export default function Page() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const params = useParams<{ id?: string }>()

  const idFromPath = params.id
  const idFromQuery = searchParams.get('id')
  const cloneIdFromQuery = searchParams.get('clone')

  const id = idFromPath || idFromQuery || null
  const cloneId = cloneIdFromQuery

  const isEdit = !!id && !cloneId
  const isClone = !!cloneId
  const isCreate = !isEdit && !isClone

  // FORM STATES
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // ------------------------------
  // LOAD DATA
  // ------------------------------

  useEffect(() => {
    let mounted = true

    const load = async () => {
      setTitle('')
      setDescription('')
      setContent('')

      if (isEdit) {
        setLoading(true)
        try {
          const d = await getDocumentById(id!)
          if (!mounted) return
          if (d) {
            setTitle(d.title || '')
            setDescription(d.description || '')
            setContent(d.content || '')
          } else {
            toast.error('Document not found.')
          }
        } catch (err) {
          console.error(err)
          toast.error('Could not load document')
        } finally {
          if (mounted) setLoading(false)
        }
      }

      else if (isClone) {
        setLoading(true)
        try {
          const d = await getDocumentById(cloneId!)
          if (!mounted) return
          if (d) {
            setTitle(d.title ? `Cloned ${d.title}` : `Cloned`)
            setDescription(d.description || '')
            setContent(d.content || '')
          } else {
            toast.error('Clone source not found')
          }
        } catch (err) {
          console.error(err)
          toast.error('Could not load source for clone')
        } finally {
          if (mounted) setLoading(false)
        }
      }
    }

    load()
    return () => { mounted = false }
  }, [id, cloneId, isEdit, isClone])

  // ------------------------------
  // SAVE
  // ------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    toast.warning(isEdit ? 'Saving changes…' : 'Creating item…')

    try {
      if (isEdit) {
        await updateDocument(id!, { title, description, content })
        toast.success('Document updated!')
        navigate(`/doc/${id}`)
      } else {
        const newId = await createDocument({ title, description, content })
        toast.success('Item created!')
        navigate(`/doc/${newId}`)
      }
    } catch (err: any) {
      console.error('Save failed', err)
      toast.error(err?.message || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  // ------------------------------
  // UI
  // ------------------------------

  const titleText = isEdit ? 'Edit Item' : isClone ? 'Clone Item' : 'Create New Item'
  const descText = isEdit
    ? 'Update the details of your existing item.'
    : isClone
      ? 'This will create a new item based on an existing one.'
      : 'Fill in the details to create a new item.'
  const primaryCta = isEdit ? 'Save changes' : 'Save item'

  return (
    <main className="min-h-screen bg-muted/40 flex items-start justify-center px-4 py-8">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{titleText}</h1>
            <p className="text-sm text-muted-foreground">{descText}</p>
          </div>
          <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
        </div>

        <Card className="shadow-sm border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {isCreate && 'Basic details'}
              {isEdit && 'Edit details'}
              {isClone && 'Clone details'}
            </CardTitle>
            <CardDescription>
              {isCreate && 'Start by giving your item a title, description, and content.'}
              {isEdit && 'Make changes and save when you’re done.'}
              {isClone && 'You can tweak the cloned values before saving.'}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">

              {/* TITLE */}
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter a clear title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* DESCRIPTION */}
              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Small summary for quick understanding"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* CONTENT */}
              <div className="space-y-1.5">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Write the full content here…"
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

            </CardContent>

            <CardFooter className="flex items-center justify-between gap-3 border-t pt-4">
              <p className="text-xs text-muted-foreground">
                {isEdit ? 'Saving will update this item.' : 'Saving will create a new item.'}
              </p>

              <div className="flex items-center gap-2">
                <Button type="submit" disabled={saving || loading}>{primaryCta}</Button>
                <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  )
}

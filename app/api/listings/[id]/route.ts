import { NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { listingSchema } from '@/lib/validations'
import { MAX_IMAGES_PER_LISTING, MAX_IMAGE_SIZE_BYTES } from '@/lib/constants'

function getString(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

function getImages(formData: FormData): File[] {
  return formData
    .getAll('images')
    .filter((value): value is File => value instanceof File && value.size > 0)
    .slice(0, MAX_IMAGES_PER_LISTING)
}

function getFileExtension(file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '')
  return ext || 'jpg'
}

function extractStoragePath(publicUrl: string): string | null {
  const marker = '/listing-images/'
  const idx = publicUrl.indexOf(marker)
  return idx !== -1 ? publicUrl.slice(idx + marker.length) : null
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: listingId } = await params

    const authClient = await createClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })
    }

    const admin = await createAdminClient()

    // Verify ownership
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing, error: lookupError } = await (admin.from('listings') as any)
      .select('id, status')
      .eq('id', listingId)
      .eq('user_id', user.id)
      .neq('status', 'deleted')
      .single()

    if (lookupError || !existing) {
      return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 })
    }

    const wasSuspended = existing.status === 'suspended'

    const formData = await request.formData()
    const parsed = listingSchema.safeParse({
      title: getString(formData, 'title'),
      description: getString(formData, 'description'),
      price: Number(getString(formData, 'price')),
      category_id: getString(formData, 'category_id'),
      city: getString(formData, 'city'),
      neighborhood: getString(formData, 'neighborhood') || undefined,
      condition: getString(formData, 'condition'),
      is_delivery_available: getString(formData, 'is_delivery_available') === 'true',
    })

    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors
      const firstMessage = Object.values(fields).flat().find(Boolean)
      return NextResponse.json({ error: firstMessage || 'Données invalides', fields }, { status: 400 })
    }

    // Update listing fields — si l'annonce était suspendue, la repasser en pending
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (admin.from('listings') as any)
      .update({
        ...parsed.data,
        neighborhood: parsed.data.neighborhood || null,
        updated_at: new Date().toISOString(),
        ...(wasSuspended ? { status: 'pending' } : {}),
      })
      .eq('id', listingId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Listing update error:', updateError)
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
    }

    // Delete removed images
    const remainingIdsRaw = getString(formData, 'remainingImageIds')
    if (remainingIdsRaw) {
      try {
        const remainingIds: string[] = JSON.parse(remainingIdsRaw)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: allImages } = await (admin.from('listing_images') as any)
          .select('id, url')
          .eq('listing_id', listingId)

        const toDelete = ((allImages || []) as { id: string; url: string }[]).filter(
          (img) => !remainingIds.includes(img.id)
        )

        if (toDelete.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (admin.from('listing_images') as any)
            .delete()
            .in('id', toDelete.map((img) => img.id))

          const storagePaths = toDelete
            .map((img) => extractStoragePath(img.url))
            .filter((p): p is string => p !== null)

          if (storagePaths.length > 0) {
            await admin.storage.from('listing-images').remove(storagePaths)
          }
        }
      } catch {
        // ignore malformed JSON
      }
    }

    // Upload new images via admin client (bypasses RLS)
    const newImages = getImages(formData)
    if (newImages.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: currentImages } = await (admin.from('listing_images') as any)
        .select('display_order')
        .eq('listing_id', listingId)
        .order('display_order', { ascending: false })
        .limit(1)

      const startOrder: number =
        currentImages?.[0]?.display_order !== undefined ? currentImages[0].display_order + 1 : 0

      const uploadedRows: {
        listing_id: string
        url: string
        thumbnail_url: string
        display_order: number
      }[] = []

      for (let i = 0; i < newImages.length; i++) {
        const file = newImages[i]
        if (file.size > MAX_IMAGE_SIZE_BYTES || !file.type.startsWith('image/')) continue

        const ext = getFileExtension(file)
        const path = `listings/${listingId}/${Date.now()}-${i}.${ext}`
        const bytes = await file.arrayBuffer()

        const { data: upload, error: uploadError } = await admin.storage
          .from('listing-images')
          .upload(path, bytes, { upsert: true, contentType: file.type })

        if (uploadError) {
          console.error('Image upload error during edit:', uploadError)
          continue
        }

        const { data: { publicUrl } } = admin.storage
          .from('listing-images')
          .getPublicUrl(upload.path)

        uploadedRows.push({
          listing_id: listingId,
          url: publicUrl,
          thumbnail_url: publicUrl,
          display_order: startOrder + i,
        })
      }

      if (uploadedRows.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (admin.from('listing_images') as any).insert(uploadedRows)
      }
    }

    return NextResponse.json({ id: listingId })
  } catch (error) {
    console.error('Listing PUT error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { listingSchema } from '@/lib/validations'
import { MAX_IMAGES_PER_LISTING, MAX_IMAGE_SIZE_BYTES } from '@/lib/constants'

type ListingRow = {
  id: string
}

type ListingImageRow = {
  listing_id: string
  url: string
  thumbnail_url: string
  display_order: number
}

type UploadedImage = ListingImageRow & {
  path: string
}

type SupabaseError = {
  code?: string
  message?: string
  details?: string | null
  hint?: string | null
}

function getErrorPayload(error: SupabaseError, fallback: string) {
  return {
    error: fallback,
    ...(process.env.NODE_ENV !== 'production'
      ? {
          code: error.code,
          details: error.details,
          hint: error.hint,
          message: error.message,
        }
      : {}),
  }
}

function getValidationPayload(error: ReturnType<typeof listingSchema.safeParse>) {
  if (error.success) return { error: 'Données invalides' }

  const fields = error.error.flatten().fieldErrors
  const firstMessage = Object.values(fields).flat().find(Boolean)

  return {
    error: firstMessage || 'Données invalides',
    fields,
  }
}

function getUserPhone(user: User): string {
  const metadataPhone =
    typeof user.user_metadata?.phone === 'string' ? user.user_metadata.phone : ''
  const rawPhone =
    typeof user.user_metadata?.phone_number === 'string' ? user.user_metadata.phone_number : ''
  const identityPhone = user.identities?.find((identity) => {
    return typeof identity.identity_data?.phone === 'string'
  })?.identity_data?.phone

  return user.phone || metadataPhone || rawPhone || (typeof identityPhone === 'string' ? identityPhone : '')
}

function getUserFullName(user: User): string {
  const metadataName =
    typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name.trim() : ''
  const displayName =
    typeof user.user_metadata?.name === 'string' ? user.user_metadata.name.trim() : ''

  return metadataName || displayName || 'Utilisateur'
}

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
  const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '')
  return extension || 'jpg'
}

async function ensureListingImagesBucket(admin: Awaited<ReturnType<typeof createAdminClient>>) {
  const { error: getBucketError } = await admin.storage.getBucket('listing-images')
  if (!getBucketError) return null

  const { error: createBucketError } = await admin.storage.createBucket('listing-images', {
    public: true,
    fileSizeLimit: MAX_IMAGE_SIZE_BYTES,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  })

  // "already exists" means the bucket is there — treat as success
  if (!createBucketError || createBucketError.message?.includes('already exists')) return null

  return createBucketError
}

async function cleanupFailedListing(
  admin: Awaited<ReturnType<typeof createAdminClient>>,
  listingId: string,
  uploadedPaths: string[]
) {
  if (uploadedPaths.length > 0) {
    await admin.storage.from('listing-images').remove(uploadedPaths)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin.from('listings') as any).delete().eq('id', listingId)
}

export async function POST(request: Request) {
  try {
    const authClient = await createClient()
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })
    }

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
      return NextResponse.json(getValidationPayload(parsed), { status: 400 })
    }

    const images = getImages(formData)
    const invalidImage = images.find(
      (file) => file.size > MAX_IMAGE_SIZE_BYTES || !file.type.startsWith('image/')
    )

    if (invalidImage) {
      return NextResponse.json(
        { error: 'Une image est invalide ou dépasse 2MB.' },
        { status: 400 }
      )
    }

    const admin = await createAdminClient()

    const bucketError = await ensureListingImagesBucket(admin)
    if (bucketError) {
      console.error('Listing images bucket error:', bucketError)
      return NextResponse.json(
        getErrorPayload(bucketError, 'Le bucket listing-images est inaccessible.'),
        { status: 500 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const usersTable = admin.from('users') as any
    const { data: existingProfile, error: profileLookupError } = await usersTable
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (profileLookupError) {
      console.error('User profile lookup error:', profileLookupError)
      return NextResponse.json(
        getErrorPayload(profileLookupError, 'Erreur lors de la vérification du profil.'),
        { status: 500 }
      )
    }

    if (!existingProfile) {
      const phone = getUserPhone(user).trim() || `user:${user.id}`
      const { error: profileCreateError } = await usersTable.insert({
        id: user.id,
        phone,
        full_name: getUserFullName(user),
      })

      if (profileCreateError) {
        console.error('User profile create error:', profileCreateError)
        return NextResponse.json(
          getErrorPayload(profileCreateError, 'Erreur lors de la création du profil.'),
          { status: 500 }
        )
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listingsTable = admin.from('listings') as any
    const { data: listing, error: listingError } = await listingsTable
      .insert({
        ...parsed.data,
        neighborhood: parsed.data.neighborhood || null,
        user_id: user.id,
        status: 'active',
        published_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (listingError) {
      console.error('Listing create error:', listingError)
      return NextResponse.json(
        getErrorPayload(listingError, 'Erreur lors de la création de l’annonce.'),
        { status: 500 }
      )
    }

    const listingId = (listing as ListingRow).id

    if (images.length > 0) {
      const uploadedImages: UploadedImage[] = []

      for (let index = 0; index < images.length; index++) {
        const file = images[index]
        const extension = getFileExtension(file)
        const path = `listings/${listingId}/${index}.${extension}`
        const bytes = await file.arrayBuffer()

        const { data: upload, error: uploadError } = await admin.storage
          .from('listing-images')
          .upload(path, bytes, {
            upsert: true,
            contentType: file.type,
          })

        if (uploadError) {
          console.error('Listing image upload error:', uploadError)
          await cleanupFailedListing(
            admin,
            listingId,
            uploadedImages.map((image) => image.path)
          )
          return NextResponse.json(
            getErrorPayload(uploadError, 'Annonce créée, mais l’envoi des photos a échoué.'),
            { status: 500 }
          )
        }

        const {
          data: { publicUrl },
        } = admin.storage.from('listing-images').getPublicUrl(upload.path)

        uploadedImages.push({
          path: upload.path,
          listing_id: listingId,
          url: publicUrl,
          thumbnail_url: publicUrl,
          display_order: index,
        })
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: imageError } = await (admin.from('listing_images') as any).insert(
        uploadedImages.map((image) => ({
          listing_id: image.listing_id,
          url: image.url,
          thumbnail_url: image.thumbnail_url,
          display_order: image.display_order,
        }))
      )

      if (imageError) {
        console.error('Listing image rows error:', imageError)
        await cleanupFailedListing(
          admin,
          listingId,
          uploadedImages.map((image) => image.path)
        )
        return NextResponse.json(
          getErrorPayload(imageError, 'Annonce créée, mais l’enregistrement des photos a échoué.'),
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ id: listingId })
  } catch (error) {
    console.error('Listing API error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

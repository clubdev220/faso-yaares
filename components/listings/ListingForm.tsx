'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Upload, X, ChevronRight, ChevronLeft, Package } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { listingSchema, type ListingInput } from '@/lib/validations'
import { BURKINA_CITIES, LISTING_CONDITIONS, MAX_IMAGES_PER_LISTING } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Category, Listing } from '@/types'

interface ListingFormProps {
  categories: Category[]
  listing?: Listing
}

const STEPS = ['Infos', 'Prix & Lieu', 'Photos']

type CategoryOption = {
  category: Category
  depth: number
}

function sortCategories(categories: Category[]): Category[] {
  return [...categories].sort((a, b) => {
    if (a.display_order !== b.display_order) {
      return a.display_order - b.display_order
    }

    return a.name.localeCompare(b.name, 'fr')
  })
}

function getCategoryOptions(categories: Category[]): CategoryOption[] {
  const childrenByParent = new Map<string, Category[]>()
  const roots: Category[] = []

  for (const category of categories) {
    if (category.parent_id) {
      const children = childrenByParent.get(category.parent_id) || []
      children.push(category)
      childrenByParent.set(category.parent_id, children)
    } else {
      roots.push(category)
    }
  }

  const options: CategoryOption[] = []
  const seen = new Set<string>()

  const addCategory = (category: Category, depth: number) => {
    if (seen.has(category.id)) return

    seen.add(category.id)
    options.push({ category, depth })

    for (const child of sortCategories(childrenByParent.get(category.id) || [])) {
      addCategory(child, depth + 1)
    }
  }

  for (const root of sortCategories(roots)) {
    addCategory(root, 0)
  }

  for (const category of sortCategories(categories)) {
    if (!seen.has(category.id)) {
      addCategory(category, 0)
    }
  }

  return options
}

function getCategoryOptionLabel({ category, depth }: CategoryOption): string {
  return `${depth > 0 ? '  - '.repeat(depth) : ''}${category.name}`
}

export function ListingForm({ categories, listing }: ListingFormProps) {
  const [step, setStep] = useState(0)
  const [images, setImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState(listing?.images || [])
  const [previews, setPreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const isEditing = !!listing

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
    watch,
  } = useForm<ListingInput>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: listing?.title || '',
      description: listing?.description || '',
      price: listing?.price || 0,
      category_id: listing?.category_id || '',
      city: listing?.city || '',
      neighborhood: listing?.neighborhood || '',
      condition: listing?.condition || 'good',
      is_delivery_available: listing?.is_delivery_available || false,
    },
  })

  const title = watch('title')
  const description = watch('description')
  const categoryOptions = getCategoryOptions(categories)

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const available = MAX_IMAGES_PER_LISTING - images.length - existingImages.length
    const toAdd = files.slice(0, available)

    const validFiles = toAdd.filter((f) => {
      if (f.size > 2 * 1024 * 1024) {
        toast.error(`${f.name} dépasse 2MB`)
        return false
      }
      if (!f.type.startsWith('image/')) {
        toast.error(`${f.name} n'est pas une image`)
        return false
      }
      return true
    })

    setImages((prev) => [...prev, ...validFiles])
    const newPreviews = validFiles.map((f) => URL.createObjectURL(f))
    setPreviews((prev) => [...prev, ...newPreviews])
  }

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index])
    setImages((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (id: string) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== id))
  }

  const nextStep = async () => {
    const fieldsToValidate: (keyof ListingInput)[][] = [
      ['title', 'description', 'category_id', 'condition'],
      ['price', 'city'],
      [],
    ]
    const valid = await trigger(fieldsToValidate[step])
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isEditing && step < STEPS.length - 1) {
      void nextStep()
      return
    }

    void handleSubmit(onSubmit)(event)
  }

  const onSubmit = async (data: ListingInput) => {
    if (!isEditing && step < STEPS.length - 1) {
      await nextStep()
      return
    }

    setIsSubmitting(true)
    try {
      const listingData = {
        title: data.title,
        description: data.description,
        price: data.price,
        category_id: data.category_id,
        city: data.city,
        neighborhood: data.neighborhood || null,
        condition: data.condition,
        is_delivery_available: data.is_delivery_available,
      }

      if (!isEditing) {
        const formData = new FormData()

        for (const [key, value] of Object.entries(listingData)) {
          if (value !== null && value !== undefined) {
            formData.append(key, String(value))
          }
        }

        for (const image of images) {
          formData.append('images', image)
        }

        const res = await fetch('/api/listings', {
          method: 'POST',
          body: formData,
        })
        const result = await res.json() as {
          id?: string
          error?: string
          fields?: Record<string, string[] | undefined>
        }

        if (!res.ok || !result.id) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('Listing create failed:', result)
          }
          const firstFieldError = result.fields
            ? Object.values(result.fields).flat().find(Boolean)
            : undefined
          throw new Error(firstFieldError || result.error || 'Erreur lors de la publication')
        }

        toast.success('Annonce publiée ! 🎉')
        router.push('/dashboard')
        router.refresh()
        return
      }

      // EDIT via PUT API (admin client côté serveur, contourne RLS storage)
      const editFormData = new FormData()
      for (const [key, value] of Object.entries(listingData)) {
        if (value !== null && value !== undefined) {
          editFormData.append(key, String(value))
        }
      }
      editFormData.append('remainingImageIds', JSON.stringify(existingImages.map((img) => img.id)))
      for (const image of images) {
        editFormData.append('images', image)
      }

      const editRes = await fetch(`/api/listings/${listing!.id}`, {
        method: 'PUT',
        body: editFormData,
      })
      const editResult = await editRes.json() as { id?: string; error?: string }

      if (!editRes.ok || !editResult.id) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Listing update failed:', editResult)
        }
        throw new Error(editResult.error || 'Erreur lors de la mise à jour')
      }

      toast.success('Annonce modifiée !')
      router.push(`/listings/${editResult.id}`)
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la publication')
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalImages = existingImages.length + images.length

  return (
    <form onSubmit={handleFormSubmit} noValidate>
      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors',
                i <= step ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'
              )}
            >
              {i + 1}
            </div>
            <span
              className={cn(
                'text-xs font-medium hidden sm:block',
                i <= step ? 'text-primary' : 'text-gray-400'
              )}
            >
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 transition-colors',
                  i < step ? 'bg-primary' : 'bg-gray-200'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Informations */}
      {step === 0 && (
        <div className="card p-5 space-y-4">
          <h2 className="font-heading font-semibold text-gray-900">Informations</h2>

          <div>
            <label className="label" htmlFor="title">
              Titre <span className="text-secondary">*</span>
            </label>
            <input
              id="title"
              type="text"
              placeholder="Ex: iPhone 14 Pro Max 256Go"
              {...register('title')}
              className={cn('input', errors.title && 'input-error')}
              maxLength={100}
            />
            <div className="flex justify-between mt-1">
              {errors.title ? (
                <p className="text-xs text-red-500">{errors.title.message}</p>
              ) : <span />}
              <span className="text-xs text-gray-400">{title?.length || 0}/100</span>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="category">
              Catégorie <span className="text-secondary">*</span>
            </label>
            {categoryOptions.length === 0 && (
              <p className="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Aucune catégorie n&apos;est disponible. Vérifiez que la table categories contient
                des lignes et qu&apos;une politique SELECT existe dans Supabase.
              </p>
            )}
            <select
              id="category"
              {...register('category_id')}
              className={cn('input', errors.category_id && 'input-error')}
              disabled={categoryOptions.length === 0}
            >
              <option value="">Sélectionnez une catégorie</option>
              {categoryOptions.map((option) => (
                <option key={option.category.id} value={option.category.id}>
                  {getCategoryOptionLabel(option)}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="text-xs text-red-500 mt-1">{errors.category_id.message}</p>
            )}
          </div>

          <div>
            <label className="label">
              État de l&apos;article <span className="text-secondary">*</span>
            </label>
            <div className="space-y-2">
              {LISTING_CONDITIONS.map((cond) => (
                <label
                  key={cond.value}
                  className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary/5 cursor-pointer transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10"
                >
                  <input
                    type="radio"
                    value={cond.value}
                    {...register('condition')}
                    className="mt-0.5 text-primary focus:ring-primary"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{cond.label}</p>
                    <p className="text-xs text-gray-500">{cond.description}</p>
                  </div>
                </label>
              ))}
            </div>
            {errors.condition && (
              <p className="text-xs text-red-500 mt-1">{errors.condition.message}</p>
            )}
          </div>

          <div>
            <label className="label" htmlFor="description">
              Description <span className="text-secondary">*</span>
            </label>
            <textarea
              id="description"
              rows={5}
              placeholder="Décrivez votre article en détail : état, caractéristiques, raison de vente..."
              {...register('description')}
              className={cn('input resize-none', errors.description && 'input-error')}
              maxLength={2000}
            />
            <div className="flex justify-between mt-1">
              {errors.description ? (
                <p className="text-xs text-red-500">{errors.description.message}</p>
              ) : <span />}
              <span className="text-xs text-gray-400">{description?.length || 0}/2000</span>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Prix & Lieu */}
      {step === 1 && (
        <div className="card p-5 space-y-4">
          <h2 className="font-heading font-semibold text-gray-900">Prix & Localisation</h2>

          <div>
            <label className="label" htmlFor="price">
              Prix (FCFA) <span className="text-secondary">*</span>
            </label>
            <div className="relative">
              <input
                id="price"
                type="number"
                min={0}
                placeholder="0"
                {...register('price', { valueAsNumber: true })}
                className={cn('input pr-14', errors.price && 'input-error')}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
                FCFA
              </span>
            </div>
            {errors.price ? (
              <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>
            ) : (
              <p className="text-xs text-gray-400 mt-1">Mettez 0 si vous offrez gratuitement</p>
            )}
          </div>

          <div>
            <label className="label" htmlFor="city">
              Ville <span className="text-secondary">*</span>
            </label>
            <select
              id="city"
              {...register('city')}
              className={cn('input', errors.city && 'input-error')}
            >
              <option value="">Sélectionnez votre ville</option>
              {BURKINA_CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            {errors.city && (
              <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>
            )}
          </div>

          <div>
            <label className="label" htmlFor="neighborhood">
              Quartier (optionnel)
            </label>
            <input
              id="neighborhood"
              type="text"
              placeholder="Ex: Pissy, Dapoya, Samandin..."
              {...register('neighborhood')}
              className="input"
            />
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  {...register('is_delivery_available')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary transition-colors" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Livraison disponible</p>
                <p className="text-xs text-gray-500">Je peux livrer l&apos;article</p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Step 3: Photos */}
      {step === 2 && (
        <div className="card p-5 space-y-4">
          <div>
            <h2 className="font-heading font-semibold text-gray-900">Photos</h2>
            <p className="text-sm text-gray-500 mt-1">
              Ajoutez jusqu&apos;à {MAX_IMAGES_PER_LISTING} photos (max 2MB chacune)
            </p>
          </div>

          {/* Existing images */}
          {existingImages.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Photos actuelles</p>
              <div className="grid grid-cols-3 gap-2">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                    <Image src={img.thumbnail_url || img.url} alt="Photo" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img.id)}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New image previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {previews.map((preview, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload button */}
          {totalImages < MAX_IMAGES_PER_LISTING && (
            <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
              <Package className="w-8 h-8 text-gray-300" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  <span className="text-primary">Cliquez pour ajouter</span> ou glissez-déposez
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  JPG, PNG, WebP — max 2MB par photo ({totalImages}/{MAX_IMAGES_PER_LISTING})
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageAdd}
                className="sr-only"
              />
            </label>
          )}

          {totalImages === 0 && (
            <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
              💡 Les annonces avec photos reçoivent 10x plus de contacts
            </p>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-4">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="btn-ghost btn-lg flex-1"
          >
            <ChevronLeft className="w-5 h-5" />
            Retour
          </button>
        )}

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              void nextStep()
            }}
            className="btn-primary btn-lg flex-1"
          >
            Suivant
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary btn-lg flex-1"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
            {isSubmitting
              ? 'Publication...'
              : isEditing
              ? 'Mettre à jour'
              : 'Publier l\'annonce'}
          </button>
        )}
      </div>
    </form>
  )
}

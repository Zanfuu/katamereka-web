"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  Building2Icon,
  CheckCircle2Icon,
  ExternalLinkIcon,
  FilePlusIcon,
  FileTextIcon,
  ImageIcon,
  PencilIcon,
  PlusIcon,
  RotateCcwIcon,
  SearchIcon,
  ShieldAlertIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"

import { DashboardBreadcrumb } from "@/components/dashboard-breadcrumb"
import { PageHeader } from "@/components/page-header"
import { ResourceTable, type ResourceTableColumn } from "@/components/resource-table"
import { SearchInput } from "@/components/search-input"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { formatDate } from "@/lib/format"
import { useBusinessContext } from "@/components/business-provider"
import {
  CmsApiError,
  createBusinessArticle,
  deleteBusinessArticle,
  displayStatus,
  fetchCmsCategories,
  fetchMyBusinessArticles,
  slugify,
  updateBusinessArticle,
  type CmsCategory,
  type CmsContent,
  type ContentStatus,
} from "@/lib/cms-api"

export default function BusinessArticlesPage() {
  const { businesses, selectedBusiness, selectedBusinessId, hasApprovedBusiness, isLoading: isContextLoading } =
    useBusinessContext()

  const [articles, setArticles] = React.useState<CmsContent[]>([])
  const [categories, setCategories] = React.useState<CmsCategory[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [refreshTick, setRefreshTick] = React.useState(0)

  // Dialog state
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingArticle, setEditingArticle] = React.useState<CmsContent | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  // Form state
  const [title, setTitle] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [excerpt, setExcerpt] = React.useState("")
  const [body, setBody] = React.useState("")
  const [featuredImageUrl, setFeaturedImageUrl] = React.useState("")
  const [selectedCategoryIds, setSelectedCategoryIds] = React.useState<string[]>([])
  const [status, setStatus] = React.useState<ContentStatus>("PUBLISHED")

  // Delete confirmation dialog
  const [deleteTarget, setDeleteTarget] = React.useState<CmsContent | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  // Load categories
  React.useEffect(() => {
    fetchCmsCategories()
      .then((res) => {
        if (res && res.data) setCategories(res.data)
      })
      .catch(() => {})
  }, [])

  // Load articles
  React.useEffect(() => {
    if (!hasApprovedBusiness && businesses.length === 0) {
      setIsLoading(false)
      return
    }

    let ignore = false
    setIsLoading(true)

    fetchMyBusinessArticles({
      search: debouncedSearch || undefined,
      businessId: selectedBusinessId || undefined,
    })
      .then((res) => {
        if (ignore) return
        setArticles(res.data || [])
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Gagal memuat artikel bisnis:", err)
        }
      })
      .finally(() => {
        if (!ignore) setIsLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [hasApprovedBusiness, businesses.length, selectedBusinessId, debouncedSearch, refreshTick])

  function handleOpenCreate() {
    setEditingArticle(null)
    setTitle("")
    setSlug("")
    setExcerpt("")
    setBody("")
    setFeaturedImageUrl("")
    setSelectedCategoryIds([])
    setStatus("PUBLISHED")
    setDialogOpen(true)
  }

  function handleOpenEdit(article: CmsContent) {
    setEditingArticle(article)
    setTitle(article.title)
    setSlug(article.slug)
    setExcerpt(article.excerpt || "")
    setBody(article.body)
    setFeaturedImageUrl(article.featuredMedia?.url || "")
    setSelectedCategoryIds(article.categories?.map((c) => c.id) || [])
    setStatus(article.status)
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) {
      toast.error("Judul dan isi artikel wajib diisi.")
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim() ? slugify(slug) : slugify(title),
        excerpt: excerpt.trim() || undefined,
        body: body.trim(),
        businessId: selectedBusinessId || selectedBusiness?.id || businesses[0]?.id,
        categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
        status,
      }

      if (editingArticle) {
        await updateBusinessArticle(editingArticle.id, payload)
        toast.success("Artikel berhasil diperbarui.")
      } else {
        await createBusinessArticle(payload)
        toast.success("Artikel berhasil diterbitkan atas nama profil bisnis Anda.")
      }

      setDialogOpen(false)
      setRefreshTick((t) => t + 1)
    } catch (err: any) {
      toast.error(err instanceof CmsApiError ? err.message : err?.message || "Gagal menyimpan artikel")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteBusinessArticle(deleteTarget.id)
      toast.success(`Artikel “${deleteTarget.title}” berhasil dihapus.`)
      setDeleteTarget(null)
      setRefreshTick((t) => t + 1)
    } catch (err: any) {
      toast.error(err?.message || "Gagal menghapus artikel")
    } finally {
      setDeleting(false)
    }
  }

  const columns: ResourceTableColumn<CmsContent>[] = [
    {
      key: "title",
      header: "Judul Artikel",
      render: (article) => (
        <div className="flex items-center gap-3 min-w-[240px]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
            <FileTextIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-foreground line-clamp-1">{article.title}</span>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
              <span>/{article.slug}</span>
              {article.business && (
                <span className="inline-flex items-center gap-0.5 rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] font-medium text-emerald-800">
                  {article.business.name}
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (article) => <StatusBadge status={displayStatus(article)} />,
    },
    {
      key: "categories",
      header: "Kategori",
      render: (article) =>
        article.categories?.length ? (
          <div className="flex flex-wrap gap-1">
            {article.categories.map((c) => (
              <span key={c.id} className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                {c.name}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        ),
    },
    {
      key: "publishedAt",
      header: "Tanggal Terbit",
      render: (article) => (
        <span className="text-xs text-muted-foreground">
          {article.publishedAt ? formatDate(article.publishedAt) : "-"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (article) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          {displayStatus(article) === "PUBLISHED" && (
            <Button
              variant="ghost"
              size="icon-sm"
              render={<Link href={`/blogs/${article.slug}`} target="_blank" rel="noopener noreferrer" />}
            >
              <ExternalLinkIcon className="h-4 w-4" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
              <PencilIcon className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleOpenEdit(article)}>Edit Artikel</DropdownMenuItem>
              {displayStatus(article) === "PUBLISHED" && (
                <DropdownMenuItem
                  render={<Link href={`/blogs/${article.slug}`} target="_blank" rel="noopener noreferrer" />}
                >
                  Lihat di Blog Publik
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteTarget(article)}
              >
                Hapus Artikel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  // If user does not have a claimed business yet
  const hasNoBusiness = !isContextLoading && !hasApprovedBusiness && businesses.length === 0

  return (
    <div className="flex flex-col gap-6">
      <DashboardBreadcrumb items={[{ label: "Bisnis", href: "/dashboard/business" }, { label: "Artikel" }]} />

      <PageHeader
        title="Artikel & Wawasan Bisnis"
        description="Tulis dan publikasikan artikel atas nama profil bisnis Anda untuk menjangkau calon pelanggan dan memperkuat reputasi."
        action={
          !hasNoBusiness ? (
            <Button onClick={handleOpenCreate} className="bg-[#008767] hover:bg-[#007055] text-white">
              <PlusIcon className="h-4 w-4 mr-1.5" />
              Tulis Artikel Baru
            </Button>
          ) : null
        }
      />

      {hasNoBusiness ? (
        <div className="rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/50 p-8 text-center sm:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700 mb-4">
            <ShieldAlertIcon className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Wajib Memiliki Profil Bisnis Terverifikasi</h3>
          <p className="mx-auto max-w-lg text-sm text-slate-600 mb-6 leading-relaxed">
            Untuk menjaga kualitas dan keaslian konten di KataMereka, artikel hanya dapat diterbitkan oleh akun yang
            terdaftar sebagai <strong>Pemilik (Owner)</strong> atau <strong>Admin</strong> dari profil bisnis yang aktif.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button render={<Link href="/klaim-bisnis" />} className="bg-[#008767] hover:bg-[#007055] text-white">
              <Building2Icon className="h-4 w-4 mr-1.5" />
              Klaim atau Daftarkan Bisnis Sekarang
            </Button>
            <Button variant="outline" render={<Link href="/bantuan" />}>
              Pelajari Syarat & Ketentuan
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Author info banner */}
          {selectedBusiness && (
            <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-emerald-200 overflow-hidden">
                  {selectedBusiness.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selectedBusiness.logo} alt={selectedBusiness.name} className="h-full w-full object-cover" />
                  ) : (
                    <Building2Icon className="h-5 w-5 text-emerald-600" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-emerald-800">Menerbitkan sebagai:</p>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    {selectedBusiness.name}
                    <CheckCircle2Icon className="h-3.5 w-3.5 text-emerald-600" />
                  </p>
                </div>
              </div>
              <p className="hidden sm:block text-xs text-slate-500 max-w-xs text-right">
                Setiap artikel akan menampilkan profil bisnis Anda sebagai author resmi di blog publik.
              </p>
            </div>
          )}

          {/* Search bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="w-full sm:w-80">
              <SearchInput
                placeholder="Cari artikel..."
                value={search}
                onChange={(val) => setSearch(val)}
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => setRefreshTick((t) => t + 1)}>
              <RotateCcwIcon className="h-3.5 w-3.5 mr-1.5" />
              Refresh
            </Button>
          </div>

          {/* Table */}
          <ResourceTable<CmsContent>
            columns={columns}
            data={articles}
            getRowId={(r) => r.id}
            isLoading={isLoading}
            emptyTitle="Belum ada artikel."
            emptyDescription="Mulai tulis artikel edukasi atau panduan pertama untuk meningkatkan branding bisnis Anda."
            emptyAction={
              <Button onClick={handleOpenCreate} size="sm" className="bg-[#008767] text-white">
                <FilePlusIcon className="h-4 w-4 mr-1.5" /> Tulis Artikel
              </Button>
            }
          />
        </>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingArticle ? "Edit Artikel Bisnis" : "Tulis Artikel Baru"}</DialogTitle>
            <DialogDescription>
              Artikel ini akan diterbitkan atas nama <strong>{selectedBusiness?.name || "Profil Bisnis Anda"}</strong>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Judul Artikel *</label>
              <Input
                placeholder="Contoh: 5 Tips Memilih Rental Mobil Nyaman di Bandung"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (!editingArticle) setSlug(slugify(e.target.value))
                }}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Slug URL</label>
              <Input
                placeholder="tips-memilih-rental-mobil"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
              />
              <span className="text-[11px] text-muted-foreground mt-0.5 block">
                Alamat URL: katamereka.id/blogs/{slug || "slug-artikel"}
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Ringkasan Singkat (Excerpt)</label>
              <Textarea
                placeholder="Penjelasan ringkas tentang isi artikel untuk preview (1-2 kalimat)..."
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Isi Artikel *</label>
              <Textarea
                placeholder="Tuliskan isi artikel Anda di sini..."
                rows={8}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              />
              <span className="text-[11px] text-muted-foreground mt-0.5 block">
                Mendukung format paragraf dan HTML standar.
              </span>
            </div>

            {categories.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Kategori</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const isSelected = selectedCategoryIds.includes(cat.id)
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategoryIds((prev) =>
                            isSelected ? prev.filter((id) => id !== cat.id) : [...prev, cat.id]
                          )
                        }}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          isSelected
                            ? "bg-[#008767] text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {cat.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Status Publikasi</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="articleStatus"
                    value="PUBLISHED"
                    checked={status === "PUBLISHED"}
                    onChange={() => setStatus("PUBLISHED")}
                  />
                  <span>Publikasikan Langsung</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="articleStatus"
                    value="DRAFT"
                    checked={status === "DRAFT"}
                    onChange={() => setStatus("DRAFT")}
                  />
                  <span>Simpan sebagai Draft</span>
                </label>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting} className="bg-[#008767] hover:bg-[#007055] text-white">
                {submitting ? "Menyimpan..." : editingArticle ? "Perbarui Artikel" : "Terbitkan Artikel"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Artikel?</DialogTitle>
            <DialogDescription>
              Artikel “<strong>{deleteTarget?.title}</strong>” akan dihapus dan tidak lagi tampil di blog KataMereka.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Batal
            </Button>
            <Button variant="destructive" disabled={deleting} onClick={handleDelete}>
              {deleting ? "Menghapus..." : "Hapus Artikel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

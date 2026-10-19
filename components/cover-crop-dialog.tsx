"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  ZoomInIcon,
  ZoomOutIcon,
  RotateCcwIcon,
  CheckIcon,
  MoveIcon,
  Loader2Icon,
} from "lucide-react"

interface CoverCropDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageSrc: string | null
  onSave: (croppedFile: File) => Promise<void> | void
  isSaving?: boolean
}

export function CoverCropDialog({
  open,
  onOpenChange,
  imageSrc,
  onSave,
  isSaving = false,
}: CoverCropDialogProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const imageRef = React.useRef<HTMLImageElement>(null)

  const [activeImageSrc, setActiveImageSrc] = React.useState<string | null>(null)
  const [naturalSize, setNaturalSize] = React.useState<{ width: number; height: number } | null>(null)
  const [zoom, setZoom] = React.useState<number>(1)
  const [pan, setPan] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragStart, setDragStart] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [initialPan, setInitialPan] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isLoadingImage, setIsLoadingImage] = React.useState(false)

  // Load image safely using proxy when remote, preventing tainted canvas SecurityError
  React.useEffect(() => {
    let isSubscribed = true

    if (!open || !imageSrc) {
      setActiveImageSrc(null)
      setNaturalSize(null)
      return
    }

    setIsLoadingImage(true)
    setZoom(1)
    setPan({ x: 0, y: 0 })

    // If external/remote URL (http/https), route through /api/proxy-image to guarantee same-origin CORS
    const normalizedUrl =
      imageSrc.startsWith("http://") || imageSrc.startsWith("https://")
        ? `/api/proxy-image?url=${encodeURIComponent(imageSrc)}`
        : imageSrc

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      if (!isSubscribed) return
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight })
      setActiveImageSrc(normalizedUrl)
      setIsLoadingImage(false)
    }
    img.onerror = () => {
      if (!isSubscribed) return
      // Fallback: try raw imageSrc directly
      const fallbackImg = new Image()
      fallbackImg.onload = () => {
        if (!isSubscribed) return
        setNaturalSize({ width: fallbackImg.naturalWidth, height: fallbackImg.naturalHeight })
        setActiveImageSrc(imageSrc)
        setIsLoadingImage(false)
      }
      fallbackImg.onerror = () => {
        if (!isSubscribed) return
        setActiveImageSrc(imageSrc)
        setIsLoadingImage(false)
      }
      fallbackImg.src = imageSrc
    }
    img.src = normalizedUrl

    return () => {
      isSubscribed = false
    }
  }, [open, imageSrc])

  // Calculate container and image geometry
  const getMetrics = React.useCallback(() => {
    if (!containerRef.current || !naturalSize) return null
    const containerWidth = containerRef.current.clientWidth
    const containerHeight = containerRef.current.clientHeight

    const nw = naturalSize.width
    const nh = naturalSize.height

    // Base scale to cover 16:9 container completely
    const baseScale = Math.max(containerWidth / nw, containerHeight / nh)
    const currentScale = baseScale * zoom

    const displayedWidth = nw * currentScale
    const displayedHeight = nh * currentScale

    // Range of allowed pan so image always covers container
    const minPanX = containerWidth - displayedWidth
    const maxPanX = 0
    const minPanY = containerHeight - displayedHeight
    const maxPanY = 0

    return {
      containerWidth,
      containerHeight,
      baseScale,
      currentScale,
      displayedWidth,
      displayedHeight,
      minPanX,
      maxPanX,
      minPanY,
      maxPanY,
    }
  }, [naturalSize, zoom])

  // Center the image initially or on demand
  const handleCenter = React.useCallback(() => {
    const metrics = getMetrics()
    if (!metrics) return
    const centerX = (metrics.containerWidth - metrics.displayedWidth) / 2
    const centerY = (metrics.containerHeight - metrics.displayedHeight) / 2
    setPan({ x: centerX, y: centerY })
  }, [getMetrics])

  // Center whenever naturalSize or zoom changes
  React.useEffect(() => {
    if (naturalSize) {
      handleCenter()
    }
  }, [naturalSize, zoom, handleCenter])

  // Clamp pan to keep viewport completely covered
  const clampPan = React.useCallback(
    (x: number, y: number) => {
      const metrics = getMetrics()
      if (!metrics) return { x, y }
      const clampedX = Math.min(metrics.maxPanX, Math.max(metrics.minPanX, x))
      const clampedY = Math.min(metrics.maxPanY, Math.max(metrics.minPanY, y))
      return { x: clampedX, y: clampedY }
    },
    [getMetrics]
  )

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    setInitialPan(pan)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const dx = e.clientX - dragStart.x
    const dy = e.clientY - dragStart.y
    const newPan = clampPan(initialPan.x + dx, initialPan.y + dy)
    setPan(newPan)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Touch drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true)
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY })
      setInitialPan(pan)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return
    const dx = e.touches[0].clientX - dragStart.x
    const dy = e.touches[0].clientY - dragStart.y
    const newPan = clampPan(initialPan.x + dx, initialPan.y + dy)
    setPan(newPan)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY * -0.001
    setZoom((prev) => Math.min(3, Math.max(1, Number((prev + delta).toFixed(2)))))
  }

  // Crop and Save
  const handleConfirmCrop = async () => {
    if (!naturalSize || !imageRef.current) return
    const metrics = getMetrics()
    if (!metrics) return

    // High quality 16:9 output resolution (1600x900)
    const outWidth = 1600
    const outHeight = 900

    // Coordinates in original image space
    const sourceX = Math.max(0, -pan.x / metrics.currentScale)
    const sourceY = Math.max(0, -pan.y / metrics.currentScale)
    const sourceWidth = metrics.containerWidth / metrics.currentScale
    const sourceHeight = metrics.containerHeight / metrics.currentScale

    const canvas = document.createElement("canvas")
    canvas.width = outWidth
    canvas.height = outHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"

    ctx.drawImage(
      imageRef.current,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      outWidth,
      outHeight
    )

    canvas.toBlob(
      async (blob) => {
        if (!blob) return
        const croppedFile = new File([blob], "cover-cropped.jpg", {
          type: "image/jpeg",
          lastModified: Date.now(),
        })
        await onSave(croppedFile)
      },
      "image/jpeg",
      0.92
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MoveIcon className="size-5 text-[#008767]" />
            Sesuaikan &amp; Crop Cover Header
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Geser foto dan atur perbesaran untuk menentukan bagian gambar yang akan ditampilkan pada header profil bisnis (rasio 16:9).
          </DialogDescription>
        </DialogHeader>

        {/* Viewport Frame */}
        <div className="space-y-4">
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
            className={`relative w-full aspect-video rounded-xl overflow-hidden bg-slate-950 border-2 border-slate-300 shadow-inner select-none ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
          >
            {isLoadingImage ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80 gap-2">
                <Loader2Icon className="size-7 animate-spin text-emerald-400" />
                <span className="text-xs font-medium">Menyiapkan gambar...</span>
              </div>
            ) : activeImageSrc ? (
              <img
                ref={imageRef}
                src={activeImageSrc}
                crossOrigin="anonymous"
                alt="Crop preview"
                draggable={false}
                className="absolute pointer-events-none max-w-none transition-none"
                style={{
                  transform: `translate3d(${pan.x}px, ${pan.y}px, 0)`,
                  width: getMetrics()?.displayedWidth,
                  height: getMetrics()?.displayedHeight,
                }}
              />
            ) : null}

            {/* Grid overlay (rule of thirds) */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/40">
              <div className="border-r border-b border-white/25" />
              <div className="border-r border-b border-white/25" />
              <div className="border-b border-white/25" />
              <div className="border-r border-b border-white/25" />
              <div className="border-r border-b border-white/25" />
              <div className="border-b border-white/25" />
              <div className="border-r border-b border-white/25" />
              <div className="border-r border-b border-white/25" />
              <div />
            </div>

            {/* Corner Framing Marks */}
            <div className="absolute top-2 left-2 size-4 border-t-2 border-l-2 border-white pointer-events-none" />
            <div className="absolute top-2 right-2 size-4 border-t-2 border-r-2 border-white pointer-events-none" />
            <div className="absolute bottom-2 left-2 size-4 border-b-2 border-l-2 border-white pointer-events-none" />
            <div className="absolute bottom-2 right-2 size-4 border-b-2 border-r-2 border-white pointer-events-none" />

            {/* Drag hint badge */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 shadow-md">
              <MoveIcon className="size-3 text-emerald-400" />
              Tarik untuk menggeser posisi gambar
            </div>
          </div>

          {/* Controls: Zoom & Center */}
          <div className="flex items-center justify-between gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3 flex-1">
              <ZoomOutIcon className="size-4 text-slate-500 shrink-0" />
              <input
                type="range"
                min="1"
                max="3"
                step="0.02"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-[#008767] cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
              />
              <ZoomInIcon className="size-4 text-slate-500 shrink-0" />
              <span className="text-xs font-mono text-slate-600 font-semibold w-12 text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            <div className="h-6 w-px bg-slate-200" />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setZoom(1)
                handleCenter()
              }}
              className="text-xs gap-1.5 shrink-0"
              title="Reset ke posisi tengah"
            >
              <RotateCcwIcon className="size-3.5" />
              Tengahkan
            </Button>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between w-full pt-2 border-t border-slate-100">
          <p className="text-[11px] text-slate-500 hidden sm:block">
            Hasil crop otomatis dioptimasi beresolusi tinggi 16:9 (1600x900).
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSaving}
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isSaving || isLoadingImage || !naturalSize}
              onClick={handleConfirmCrop}
              className="bg-[#008767] hover:bg-[#007458] text-white min-w-[120px]"
            >
              {isSaving ? (
                <>
                  <Loader2Icon className="mr-1.5 size-3.5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <CheckIcon className="mr-1.5 size-3.5" />
                  Simpan Cover
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

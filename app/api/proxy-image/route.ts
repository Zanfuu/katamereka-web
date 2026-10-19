import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const urlParam = request.nextUrl.searchParams.get("url")
  if (!urlParam) {
    return new NextResponse("Missing url parameter", { status: 400 })
  }

  try {
    const targetUrl = decodeURIComponent(urlParam)

    // Security check: only allow http and https protocols
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      return new NextResponse("Invalid URL protocol", { status: 400 })
    }

    const res = await fetch(targetUrl, {
      cache: "force-cache",
    })

    if (!res.ok) {
      return new NextResponse(`Failed to fetch image: ${res.statusText}`, {
        status: res.status,
      })
    }

    const contentType = res.headers.get("content-type") || "image/jpeg"
    const buffer = await res.arrayBuffer()

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=86400",
      },
    })
  } catch (err: any) {
    return new NextResponse(err?.message || "Internal server error proxying image", {
      status: 500,
    })
  }
}

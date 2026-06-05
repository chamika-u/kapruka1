import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url || !url.startsWith("https://www.kapruka.com/")) {
    return new NextResponse("Invalid Kapruka URL", { status: 400 });
  }

  try {
    // Fetch the product page with caching (revalidate every 24 hours)
    const response = await fetch(url, {
      next: { revalidate: 86400 },
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status}`);
    }

    const html = await response.text();
    
    // Extract the Open Graph image
    const ogMatch = html.match(/property="og:image"\s+content="([^"]+)"/i);
    let imageUrl = ogMatch ? ogMatch[1] : null;

    if (imageUrl) {
      // Return a redirect to the actual image
      // Set cache-control so the browser doesn't hit this API repeatedly
      return NextResponse.redirect(imageUrl, {
        status: 302,
        headers: {
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
        },
      });
    }

    return new NextResponse("Image not found on page", { status: 404 });
  } catch (error) {
    console.error("Error fetching product image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// app/api/news/filters/route.ts
import { NextResponse } from "next/server";
import { Client, Databases, Query, Models } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!);

const databases = new Databases(client);

export async function GET() {
  if (
    !process.env.APPWRITE_ENDPOINT ||
    !process.env.APPWRITE_PROJECT_ID ||
    !process.env.APPWRITE_DATABASE_ID ||
    !process.env.APPWRITE_COLLECTION_ID
  ) {
    console.error("Missing environment variables");
    return NextResponse.json(
      { error: "تنظیمات سرور ناقص است" },
      { status: 500 }
    );
  }

  try {
    const [categories, sources, tags] = await Promise.all([
      databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_COLLECTION_ID!,
        [Query.select(["category"]), Query.limit(100)]
      ),
      databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_COLLECTION_ID!,
        [Query.select(["source"]), Query.limit(100)]
      ),
      databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_COLLECTION_ID!,
        [Query.select(["tags"]), Query.limit(100)]
      ),
    ]);

    return NextResponse.json({
      categories: [
        ...new Set(
          categories.documents.map((doc: Models.Document) => doc.category)
        ),
      ].filter(Boolean),
      sources: [
        ...new Set(sources.documents.map((doc: Models.Document) => doc.source)),
      ].filter(Boolean),
      tags: [
        ...new Set(
          tags.documents.flatMap((doc: Models.Document) => doc.tags as string[])
        ),
      ].filter(Boolean),
    });
  } catch (error) {
    console.error("Error fetching filters:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "خطا در دریافت فیلترها" },
      { status: 500 }
    );
  }
}

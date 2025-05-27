// app/api/news/search/route.ts
import { NextResponse } from "next/server";
import { Client, Databases, Query, Models } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!);

const databases = new Databases(client);

interface NewsArticle {
  $id: string;
  title: string;
  summary: string;
  citations: string[];
  full_explanation: string;
  date: string;
  source: string;
  tags: string[];
  category: string;
  $createdAt: string;
}

export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim();
  const category = searchParams.getAll("category").filter((c) => c.trim());
  const source = searchParams.getAll("source").filter((s) => s.trim());
  const tags = searchParams.getAll("tags").filter((t) => t.trim());

  if (!query) {
    return NextResponse.json({ articles: [] });
  }

  try {
    const queries = [
      Query.search("full_explanation", query),
      Query.limit(50),
      Query.orderDesc("$createdAt"),
    ];

    if (category.length) queries.push(Query.equal("category", category));
    if (source.length) queries.push(Query.equal("source", source));
    if (tags.length)
      tags.forEach((tag) => queries.push(Query.contains("tags", tag)));

    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_COLLECTION_ID!,
      queries
    );

    const articles: NewsArticle[] = response.documents
      .filter(
        (doc: Models.Document) =>
          typeof doc.title === "string" &&
          typeof doc.summary === "string" &&
          typeof doc.category === "string" &&
          typeof doc.source === "string" &&
          Array.isArray(doc.tags) &&
          doc.tags.every((tag: unknown) => typeof tag === "string") &&
          Array.isArray(doc.citations) &&
          doc.citations.every(
            (citation: unknown) => typeof citation === "string"
          ) &&
          typeof doc.full_explanation === "string" &&
          typeof doc.date === "string" &&
          typeof doc.$createdAt === "string"
      )
      .map((doc: Models.Document) => ({
        $id: doc.$id,
        title: doc.title,
        summary: doc.summary,
        citations: doc.citations,
        full_explanation: doc.full_explanation,
        date: doc.date,
        source: doc.source,
        tags: doc.tags,
        category: doc.category,
        $createdAt: doc.$createdAt,
      }));

    return NextResponse.json({ articles });
  } catch (error) {
    console.error("Error searching articles:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json({ error: "خطا در جستجوی اخبار" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { Client, Databases, Query, Models } from "node-appwrite";
import { AppwriteException } from "node-appwrite";

// Extend Models.Document for Appwrite document properties
interface Standing extends Models.Document {
  competition_code: string;
  position: number;
  team_name: string;
  points: number;
  played_games: number;
}

interface Match extends Models.Document {
  match_id: number;
  competition_code: string;
  home_team_name: string;
  away_team_name: string;
  score_home: number | null;
  score_away: number | null;
  status: string;
  utc_date: string;
}

interface Competition extends Models.Document {
  code: string;
  name: string;
  area_name: string;
}

export async function GET(req: NextRequest) {
  const { nextUrl } = req;
  const endpoint = nextUrl.pathname.replace("/api/football/", "");
  console.log(`[DEBUG] Processing endpoint: ${endpoint}`);

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);
  const databases = new Databases(client);

  const databaseId = process.env.APPWRITE_DATABASE_ID!;
  const collections = {
    competitions: process.env.COMPETITIONS_COLLECTION_ID!,
    standings: process.env.STANDINGS_COLLECTION_ID!,
    matches: process.env.MATCHES_COLLECTION_ID!,
  };

  try {
    let responseData;

    if (
      endpoint.startsWith("competitions/") &&
      endpoint.endsWith("/standings")
    ) {
      const compCode = endpoint.split("/")[1];
      console.log(`[DEBUG] Fetching standings for ${compCode}`);
      const standings = await databases.listDocuments<Standing>(
        databaseId,
        collections.standings,
        [Query.equal("competition_code", compCode), Query.limit(10)]
      );
      responseData = {
        standings: [
          {
            table: standings.documents.map((doc) => ({
              position: doc.position,
              team: { name: doc.team_name },
              points: doc.points,
              playedGames: doc.played_games,
            })),
          },
        ],
      };
    } else if (
      endpoint.startsWith("competitions/") &&
      endpoint.includes("/matches")
    ) {
      const compCode = endpoint.split("/")[1];
      console.log(`[DEBUG] Fetching matches for ${compCode}`);
      const matches = await databases.listDocuments<Match>(
        databaseId,
        collections.matches,
        [
          Query.equal("competition_code", compCode),
          Query.equal("status", "FINISHED"),
          Query.orderDesc("utc_date"),
          Query.limit(10),
        ]
      );
      responseData = {
        matches: matches.documents.map((doc) => ({
          id: doc.match_id,
          homeTeam: { name: doc.home_team_name },
          awayTeam: { name: doc.away_team_name },
          score: { fullTime: { home: doc.score_home, away: doc.score_away } },
          status: doc.status,
          utcDate: doc.utc_date,
        })),
      };
    } else if (endpoint.startsWith("competitions/")) {
      const compCode = endpoint.split("/")[1];
      console.log(`[DEBUG] Fetching competition ${compCode}`);
      const comps = await databases.listDocuments<Competition>(
        databaseId,
        collections.competitions,
        [Query.equal("code", compCode), Query.limit(1)]
      );
      if (comps.documents.length === 0) {
        console.log(`[ERROR] Competition ${compCode} not found`);
        return NextResponse.json(
          { error: `Competition ${compCode} not found` },
          { status: 404 }
        );
      }
      const comp = comps.documents[0];
      responseData = {
        id: comp.code,
        name: comp.name,
        area: { name: comp.area_name },
      };
    } else {
      console.log(`[ERROR] Unsupported endpoint: ${endpoint}`);
      return NextResponse.json(
        { error: "Unsupported endpoint" },
        { status: 400 }
      );
    }

    console.log(
      `[DEBUG] Returning data: ${JSON.stringify(
        responseData,
        null,
        2
      ).substring(0, 500)}...`
    );
    return NextResponse.json(responseData, { status: 200 });
  } catch (error: unknown) {
    let errorMessage = "An unexpected error occurred";
    let statusCode = 500;

    if (error instanceof AppwriteException) {
      errorMessage = error.message;
      statusCode = error.code || 500;
      console.log(
        `[ERROR] AppwriteException: ${errorMessage}, Code: ${statusCode}`
      );
    } else if (error instanceof Error) {
      errorMessage = error.message;
      console.log(`[ERROR] Error: ${errorMessage}`);
    } else {
      console.log(`[ERROR] Unknown error: ${JSON.stringify(error)}`);
    }

    return NextResponse.json(
      {
        error: errorMessage,
        response: error instanceof AppwriteException ? error.response : null,
      },
      { status: statusCode }
    );
  }
}

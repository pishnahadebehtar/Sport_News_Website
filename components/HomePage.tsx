"use client";

import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Box,
  styled,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axios, { AxiosError } from "axios";
import Image from "next/image";
import { Ubuntu } from "next/font/google";
// Import league logos
import cl from "../public/images/cl.png";
import ec from "../public/images/ec.png";
import pl from "../public/images/pl.jpg";

const ubuntu = Ubuntu({
  weight: ["400", "700"], // Specify desired weights (e.g., regular and bold)
  subsets: ["latin"], // Specify subsets (latin is usually sufficient)
  display: "swap", // Optimize font loading to avoid layout shift
});
// Random vibrant border color generator
const getRandomVibrantColor = () => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEEAD",
    "#D4A5A5",
    "#9B59B6",
    "#3498DB",
    "#E74C3C",
    "#2ECC71",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Styled card with random border
const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: "16px",
  border: `4px solid ${getRandomVibrantColor()}`,
  transition: "border-color 0.3s ease",
  width: "100%",
  minHeight: "150px",
  padding: theme.spacing(2),
}));

// Styled card content to ensure full width
const StyledCardContent = styled(CardContent)(({ theme }) => ({
  width: "100%",
  padding: theme.spacing(2),
  "&:last-child": { paddingBottom: theme.spacing(2) },
}));

// Styled component for story circle
const StoryCircle = styled(Box)<{ selected: boolean }>`
  width: 10vw;
  height: 10vw;
  min-width: 80px;
  min-height: 80px;
  max-width: 120px;
  max-height: 120px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justifycontent: center;
  padding: 4px;
  background: #fff;
  background-clip: padding-box;
  ${({ selected }) =>
    selected
      ? `
        background: linear-gradient(45deg, #f09433, #dc2743);
        background-clip: border-box;
        box-shadow: 0 0 10px rgba(220, 39, 67, 0.5);
        animation: subtleHeartbeat 1.8s ease-in-out infinite;
        @keyframes subtleHeartbeat {
          0% { transform: scale(1); }
          10% { transform: scale(1.05); }
          20% { transform: scale(1); }
          30% { transform: scale(1.05); }
          40% { transform: scale(1); }
          100% { transform: scale(1); }
        }
      `
      : `border: 3px solid #dbdbdb;`}
  .story-image {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
`;

// News ticker band
const NewsTicker = styled(Box)`
  background: #e53935;
  color: #fff;
  padding: 8px 16px;
  overflow: hidden;
  white-space: nowrap;
  font-weight: bold;
  font-size: 1rem;
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: 100%;
  .ticker-content {
    display: inline-block;
    animation: ticker 65s linear infinite;
  }
  &:hover .ticker-content {
    animation-play-state: paused;
  }
  @keyframes ticker {
    0% {
      transform: translateX(100%);
    }
    100% {
      transform: translateX(-100%);
    }
  }
`;

// Interfaces for API responses
interface Match {
  id: number;
  $id: string;
  homeTeam: { name: string };
  awayTeam: { name: string };
  score: { fullTime: { home: number | null; away: number | null } };
  status: string;
  utcDate: string;
}

interface Standing {
  position: number;
  team: { name: string };
  points: number;
  playedGames: number;
}

interface Competition {
  id: string;
  name: string;
  area: { name: string };
}

// Mock data
const mockStandings: Standing[] = Array(10)
  .fill(0)
  .map((_, i) => ({
    position: i + 1,
    team: { name: `تیم ${i + 1}` },
    points: 0,
    playedGames: 0,
  }));

const mockCompetition: Competition = {
  id: "PL",
  name: "لیگ برتر",
  area: { name: "انگلیس" },
};

const mockMatches: Match[] = Array(10)
  .fill(0)
  .map((_, i) => ({
    id: i + 1,
    $id: `mock-${i + 1}`,
    homeTeam: { name: `تیم الف${i + 1}` },
    awayTeam: { name: `تیم ب${i + 1}` },
    score: { fullTime: { home: 0, away: 0 } },
    status: "FINISHED",
    utcDate: "2025-05-26T16:00:00Z",
  }));

// Available competitions
const competitions = [
  { code: "PL", name: "لیگ برتر", logo: pl },
  { code: "CL", name: "لیگ قهرمانان اروپا", logo: cl },
  { code: "EC", name: "قهرمانی اروپا", logo: ec },
];

export default function FootballDashboard() {
  const [selectedCompetition, setSelectedCompetition] = useState("PL");
  const [standings, setStandings] = useState<Standing[]>([]);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [tickerMatches, setTickerMatches] = useState<Match[]>([]);
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedStandings, setExpandedStandings] = useState(false);
  const [expandedMatches, setExpandedMatches] = useState(false);

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch competition
        const compRes = await axios.get(
          `/api/football/competitions/${selectedCompetition}`
        );
        setCompetition(compRes.data || mockCompetition);
        await delay(1000);

        // Fetch standings
        const standingsRes = await axios.get(
          `/api/football/competitions/${selectedCompetition}/standings`
        );
        setStandings(
          standingsRes.data.standings?.[0]?.table.slice(0, 10) || mockStandings
        );
        await delay(1000);

        // Fetch recent matches
        const matchesRes = await axios.get(
          `/api/football/competitions/${selectedCompetition}/matches`
        );
        setRecentMatches(matchesRes.data.matches?.slice(0, 10) || mockMatches);
        await delay(1000);
      } catch (err) {
        const axiosError = err as AxiosError;
        const errorMessage = `خطا در دریافت داده‌ها: ${
          axiosError.message
        }. پاسخ: ${
          axiosError.response
            ? JSON.stringify(axiosError.response.data)
            : "بدون پاسخ"
        }`;
        setError(errorMessage);
        setStandings(mockStandings);
        setCompetition(mockCompetition);
        setRecentMatches(mockMatches);
      } finally {
        setLoading(false);
      }
    };

    const fetchTickerMatches = async () => {
      try {
        const matches = [];
        for (const comp of competitions) {
          const res = await axios.get(
            `/api/football/competitions/${comp.code}/matches`
          );
          matches.push(...(res.data.matches || []));
        }
        const shuffled = matches.sort(() => Math.random() - 0.5).slice(0, 20);
        setTickerMatches(shuffled);
      } catch (err) {
        setTickerMatches(mockMatches);
        console.log(err);
      }
    };

    fetchData();
    fetchTickerMatches();
    const tickerInterval = setInterval(fetchTickerMatches, 60000);
    return () => clearInterval(tickerInterval);
  }, [selectedCompetition]);

  const handleCompetitionSelect = (code: string) => {
    if (code !== selectedCompetition) {
      setSelectedCompetition(code);
      setLoading(true);
      setExpandedStandings(true);
      setExpandedMatches(true);
    }
  };

  return (
    <Container maxWidth="lg">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* News Ticker */}
      <NewsTicker>
        <Box className="ticker-content">
          {tickerMatches.map((match) => (
            <span key={`ticker-${match.$id}`} style={{ marginRight: "40px" }}>
              {match.homeTeam.name} {match.score.fullTime.home ?? "N/A"} :{" "}
              {match.score.fullTime.away ?? "N/A"} {match.awayTeam.name}
            </span>
          ))}
        </Box>
      </NewsTicker>

      {/* League Selection Circles */}
      <Box
        display="flex"
        justifyContent="space-between"
        width="100%"
        mb={4}
        px={2}
      >
        {competitions.map((comp) => (
          <StoryCircle
            key={comp.code}
            selected={selectedCompetition === comp.code}
            onClick={() => handleCompetitionSelect(comp.code)}
          >
            <Image
              src={comp.logo}
              alt={`لوگوی ${comp.name}`}
              className="story-image"
              width={100}
              height={100}
              priority
            />
          </StoryCircle>
        ))}
      </Box>

      {/* Competition Overview */}
      <StyledCard>
        <StyledCardContent>
          {loading ? (
            <Box display="flex" alignItems="center">
              <CircularProgress size={40} />
              <Typography variant="subtitle1" sx={{ mr: 8 }}>
                در حال بارگذاری
              </Typography>
            </Box>
          ) : (
            competition && (
              <Box
                sx={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="h3"
                  className={ubuntu.className}
                  sx={{
                    margin: 0,
                    textAlign: "center",
                  }}
                >
                  {competition.name}
                </Typography>
              </Box>
            )
          )}
        </StyledCardContent>
      </StyledCard>

      {/* Competition Standings */}
      <Accordion
        expanded={expandedStandings}
        onChange={() => setExpandedStandings(!expandedStandings)}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">جدول رده‌بندی</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <StyledCard>
            <StyledCardContent>
              {loading ? (
                <Box display="flex" alignItems="center">
                  <CircularProgress size={40} />
                  <Typography variant="subtitle1" sx={{ mr: 8 }}>
                    در حال بارگذاری جدول رده‌بندی
                  </Typography>
                </Box>
              ) : (
                <Table sx={{ width: "100%" }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>موقعیت</TableCell>
                      <TableCell>تیم</TableCell>
                      <TableCell>امتیاز</TableCell>
                      <TableCell>بازی‌های انجام شده</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {standings.slice(0, 10).map((standing) => (
                      <TableRow key={`standing-${standing.position}`}>
                        <TableCell>{standing.position}</TableCell>
                        <TableCell>{standing.team.name}</TableCell>
                        <TableCell>{standing.points}</TableCell>
                        <TableCell>{standing.playedGames}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </StyledCardContent>
          </StyledCard>
        </AccordionDetails>
      </Accordion>

      {/* Recent Matches */}
      <Accordion
        expanded={expandedMatches}
        onChange={() => setExpandedMatches(!expandedMatches)}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">مسابقات اخیر</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <StyledCard>
            <StyledCardContent>
              {loading ? (
                <Box display="flex" alignItems="center">
                  <CircularProgress size={40} />
                  <Typography variant="subtitle1" sx={{ mr: 8 }}>
                    در حال بارگذاری مسابقات اخیر
                  </Typography>
                </Box>
              ) : (
                <Table sx={{ width: "100%" }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>تیم میزبان</TableCell>
                      <TableCell>تیم میهمان</TableCell>
                      <TableCell>امتیاز</TableCell>
                      <TableCell>تاریخ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentMatches.map((match) => (
                      <TableRow key={`recent-match-${match.$id}`}>
                        <TableCell>{match.homeTeam.name}</TableCell>
                        <TableCell>{match.awayTeam.name}</TableCell>
                        <TableCell>{`${
                          match.score.fullTime.home ?? "نامشخص"
                        } - ${
                          match.score.fullTime.away ?? "نامشخص"
                        }`}</TableCell>
                        <TableCell>
                          {new Date(match.utcDate).toLocaleString("fa-IR")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </StyledCardContent>
          </StyledCard>
        </AccordionDetails>
      </Accordion>
    </Container>
  );
}

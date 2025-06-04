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
import cl from "../public/images/cl.png";
import ec from "../public/images/ec.png";
import pl from "../public/images/pl.jpg";

// Font setup
const ubuntu = Ubuntu({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
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

// Styled card with full width and minimal padding on mobile
const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: "16px",
  border: `4px solid ${getRandomVibrantColor()}`,
  transition: "border-color 0.3s ease",
  width: "100%",
  minHeight: "150px",
  padding: theme.spacing(1),
  boxSizing: "border-box",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(0.5),
  },
}));

// Styled card content with full width
const StyledCardContent = styled(CardContent)(({ theme }) => ({
  width: "100%",
  padding: theme.spacing(1),
  "&:last-child": { paddingBottom: theme.spacing(1) },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(0.5),
  },
}));

// Responsive StoryCircle with clamped sizing
const StoryCircle = styled(Box)<{ selected: boolean }>`
  width: clamp(60px, 12vw, 90px);
  height: clamp(60px, 12vw, 90px);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
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

// Responsive NewsTicker with full width and fixed boxShadow
const NewsTicker = styled(Box)(({ theme }) => ({
  background: "#e53935",
  color: "#fff",
  padding: theme.spacing(1),
  overflow: "hidden",
  whiteSpace: "nowrap",
  fontWeight: "bold",
  fontSize: "1rem",
  marginBottom: theme.spacing(2),
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Fixed: Removed invalid "Semgrep"
  width: "100%",
  boxSizing: "border-box",
  [theme.breakpoints.down("sm")]: {
    fontSize: "0.9rem",
    padding: theme.spacing(0.5),
  },
  "& .ticker-content": {
    display: "inline-block",
    animation: "ticker 65s linear infinite",
    [theme.breakpoints.down("sm")]: {
      animation: "ticker 45s linear infinite",
    },
  },
  "&:hover .ticker-content": {
    animationPlayState: "paused",
  },
  "@keyframes ticker": {
    "0%": { transform: "translateX(100%)" },
    "100%": { transform: "translateX(-100%)" },
  },
}));

// Responsive Typography with 1.2x text size on mobile
const ResponsiveTypography = styled(Typography)(({ theme }) => ({
  fontSize: "inherit",
  [theme.breakpoints.down("sm")]: {
    fontSize: `calc(1rem * 1.2)`,
  },
}));

// Interfaces (unchanged)
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

// Mock data (unchanged)
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

// Available competitions (unchanged)
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
        const compRes = await axios.get(
          `/api/football/competitions/${selectedCompetition}`
        );
        setCompetition(compRes.data || mockCompetition);
        await delay(1000);

        const standingsRes = await axios.get(
          `/api/football/competitions/${selectedCompetition}/standings`
        );
        setStandings(
          standingsRes.data.standings?.[0]?.table.slice(0, 10) || mockStandings
        );
        await delay(1000);

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
    <Container
      maxWidth={false}
      sx={{
        px: { xs: 0.5, sm: 1 },
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2, mx: { xs: 0.5, sm: 1 } }}>
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
        justifyContent="space-around"
        flexWrap="wrap"
        gap={1}
        mb={3}
        px={{ xs: 0.5, sm: 1 }}
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
              width={90}
              height={90}
              priority
            />
          </StoryCircle>
        ))}
      </Box>

      {/* Competition Overview */}
      <StyledCard>
        <StyledCardContent>
          {loading ? (
            <Box display="flex" alignItems="center" justifyContent="center">
              <CircularProgress size={40} />
              <ResponsiveTypography variant="subtitle1" sx={{ mr: 2 }}>
                در حال بارگذاری
              </ResponsiveTypography>
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
                <ResponsiveTypography
                  variant="h3"
                  className={ubuntu.className}
                  sx={{
                    margin: 0,
                    textAlign: "center",
                    fontSize: { xs: "2rem", sm: "3rem" },
                  }}
                >
                  {competition.name}
                </ResponsiveTypography>
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
          <ResponsiveTypography variant="h6">
            جدول رده‌بندی
          </ResponsiveTypography>
        </AccordionSummary>
        <AccordionDetails>
          <StyledCard>
            <StyledCardContent>
              {loading ? (
                <Box display="flex" alignItems="center" justifyContent="center">
                  <CircularProgress size={40} />
                  <ResponsiveTypography variant="subtitle1" sx={{ mr: 2 }}>
                    در حال بارگذاری جدول رده‌بندی
                  </ResponsiveTypography>
                </Box>
              ) : (
                <Box sx={{ overflowX: "auto", width: "100%" }}>
                  <Table sx={{ minWidth: { xs: 300, sm: 600 }, width: "100%" }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <ResponsiveTypography>موقعیت</ResponsiveTypography>
                        </TableCell>
                        <TableCell>
                          <ResponsiveTypography>تیم</ResponsiveTypography>
                        </TableCell>
                        <TableCell>
                          <ResponsiveTypography>امتیاز</ResponsiveTypography>
                        </TableCell>
                        <TableCell>
                          <ResponsiveTypography>
                            بازی‌های انجام شده
                          </ResponsiveTypography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {standings.slice(0, 10).map((standing) => (
                        <TableRow key={`standing-${standing.position}`}>
                          <TableCell>
                            <ResponsiveTypography>
                              {standing.position}
                            </ResponsiveTypography>
                          </TableCell>
                          <TableCell>
                            <ResponsiveTypography>
                              {standing.team.name}
                            </ResponsiveTypography>
                          </TableCell>
                          <TableCell>
                            <ResponsiveTypography>
                              {standing.points}
                            </ResponsiveTypography>
                          </TableCell>
                          <TableCell>
                            <ResponsiveTypography>
                              {standing.playedGames}
                            </ResponsiveTypography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
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
          <ResponsiveTypography variant="h6">مسابقات اخیر</ResponsiveTypography>
        </AccordionSummary>
        <AccordionDetails>
          <StyledCard>
            <StyledCardContent>
              {loading ? (
                <Box display="flex" alignItems="center" justifyContent="center">
                  <CircularProgress size={40} />
                  <ResponsiveTypography variant="subtitle1" sx={{ mr: 2 }}>
                    در حال بارگذاری مسابقات اخیر
                  </ResponsiveTypography>
                </Box>
              ) : (
                <Box sx={{ overflowX: "auto", width: "100%" }}>
                  <Table sx={{ minWidth: { xs: 300, sm: 600 }, width: "100%" }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <ResponsiveTypography>
                            تیم میزبان
                          </ResponsiveTypography>
                        </TableCell>
                        <TableCell>
                          <ResponsiveTypography>
                            تیم میهمان
                          </ResponsiveTypography>
                        </TableCell>
                        <TableCell>
                          <ResponsiveTypography>امتیاز</ResponsiveTypography>
                        </TableCell>
                        <TableCell>
                          <ResponsiveTypography>تاریخ</ResponsiveTypography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentMatches.map((match) => (
                        <TableRow key={`recent-match-${match.$id}`}>
                          <TableCell>
                            <ResponsiveTypography>
                              {match.homeTeam.name}
                            </ResponsiveTypography>
                          </TableCell>
                          <TableCell>
                            <ResponsiveTypography>
                              {match.awayTeam.name}
                            </ResponsiveTypography>
                          </TableCell>
                          <TableCell>
                            <ResponsiveTypography>
                              {`${match.score.fullTime.home ?? "نامشخص"} - ${
                                match.score.fullTime.away ?? "نامشخص"
                              }`}
                            </ResponsiveTypography>
                          </TableCell>
                          <TableCell>
                            <ResponsiveTypography>
                              {new Date(match.utcDate).toLocaleString("fa-IR")}
                            </ResponsiveTypography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </StyledCardContent>
          </StyledCard>
        </AccordionDetails>
      </Accordion>
    </Container>
  );
}

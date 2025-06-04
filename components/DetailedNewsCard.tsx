import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  VolumeUp as VolumeUpIcon,
  Stop as StopIcon,
} from "@mui/icons-material";
import { styled } from "@mui/system";

interface DetailedNewsCardProps {
  title: string;
  summary: string;
  category: string;
  source: string;
  date: string;
  tags: string[];
  citations: string[];
  full_explanation: string;
}

const StyledIconButton = styled(IconButton)(() => ({
  transition: "background-color 0.3s, transform 0.3s",
  "&:hover": {
    transform: "scale(1.1)",
  },
}));

const DetailedNewsCard: React.FC<DetailedNewsCardProps> = ({
  title,
  summary,
  category,
  source,
  date,
  tags,
  citations,
  full_explanation,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Validate if a string is a URL
  const isValidUrl = (str: string) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  // Truncate the explanation for the accordion summary
  const truncatedExplanation =
    full_explanation.length > 50
      ? full_explanation.slice(0, 50) + "..."
      : full_explanation;

  // Clean up audio resources when component unmounts or audioUrl changes
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      }
    };
  }, [audioUrl]);

  // Handle audio end or stop
  const handleAudioEnd = () => {
    setIsPlaying(false);
    setAudioUrl(null); // Reset audio URL to allow replay
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reset playback position
    }
  };

  // Handle the Play/Stop Audio button click
  const handleAudioToggle = async () => {
    if (isPlaying) {
      // Stop playback
      if (audioRef.current) {
        audioRef.current.pause();
        handleAudioEnd();
      }
      return;
    }

    // If audio is already fetched, play it
    if (audioUrl) {
      try {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.addEventListener("ended", handleAudioEnd);
        audio.addEventListener("error", (e) => {
          console.error("Audio playback error:", e);
          handleAudioEnd();
        });
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Error playing audio:", error);
        handleAudioEnd();
      }
      return;
    }

    // Fetch new audio
    setIsLoading(true);
    console.log(
      "Initiating audio fetch for text length:",
      full_explanation.length
    );
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: full_explanation }),
      });
      console.log(
        "Fetch response status:",
        response.status,
        response.statusText
      );
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(
          "Fetch failed with error:",
          JSON.stringify(errorData, null, 2)
        );
        // Fallback to SpeechSynthesis if API fails
        console.log(
          "Falling back to browser SpeechSynthesis due to API failure"
        );
        const utterance = new SpeechSynthesisUtterance(full_explanation);
        utterance.lang = "fa-IR";
        utterance.onend = handleAudioEnd;
        utterance.onerror = (e) => {
          console.error("SpeechSynthesis error:", e);
          handleAudioEnd();
        };
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
        setIsLoading(false);
        return;
      }

      const audioBlob = await response.blob();
      console.log(
        "Audio blob received, size:",
        audioBlob.size,
        "type:",
        audioBlob.type
      );
      const newAudioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(newAudioUrl);

      const audio = new Audio(newAudioUrl);
      audioRef.current = audio;
      audio.addEventListener("ended", handleAudioEnd);
      audio.addEventListener("error", (e) => {
        console.error("Audio playback error:", e);
        handleAudioEnd();
      });
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Error in handlePlayAudio:", error);
      console.log(
        "Falling back to browser SpeechSynthesis due to network error"
      );
      const utterance = new SpeechSynthesisUtterance(full_explanation);
      utterance.lang = "fa-IR";
      utterance.onend = handleAudioEnd;
      utterance.onerror = (e) => {
        console.error("SpeechSynthesis error:", e);
        handleAudioEnd();
      };
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    } finally {
      console.log("Audio fetch completed, isLoading set to false");
      setIsLoading(false);
    }
  };

  return (
    <Card
      sx={{
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "12px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
        transition: "transform 0.3s",
        "&:hover": { transform: "scale(1.02)" },
        "@supports not (backdrop-filter: blur(10px))": {
          background: "rgba(30, 30, 30, 0.8)",
        },
      }}
      dir="rtl"
    >
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h3"
          sx={{
            fontSize: { xs: "1.5625rem", sm: "1.25rem" }, // 1.25rem * 1.25 for mobile
            fontWeight: "bold",
            color: "text.primary",
          }}
        >
          {title}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
          <Typography
            variant="body2"
            color="success.main"
            sx={{ fontSize: { xs: "1.09375rem", sm: "0.875rem" } }} // 0.875rem * 1.25
          >
            {category}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: { xs: "1.09375rem", sm: "0.875rem" } }}
          >
            • {source}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: { xs: "1.09375rem", sm: "0.875rem" } }}
          >
            • {new Date(date).toLocaleDateString("fa-IR")}
          </Typography>
        </Box>
        <Typography
          variant="body1"
          sx={{
            color: "text.primary",
            mt: 2,
            fontSize: { xs: "1.25rem", sm: "1rem" }, // 1rem * 1.25
          }}
        >
          {summary}
        </Typography>
        <Accordion
          expanded={expanded}
          onChange={() => setExpanded(!expanded)}
          sx={{
            mt: 2,
            bgcolor: "#2E1A47",
            color: "text.primary",
            "&:hover": { bgcolor: "#3F2A5C" },
            boxShadow: "none",
            borderRadius: "8px",
            "&:before": { display: "none" },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "text.primary" }} />}
            sx={{
              "& .MuiAccordionSummary-content": {
                justifyContent: "space-between",
                alignItems: "center",
              },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: "bold",
                color: "text.primary",
                fontSize: { xs: "1.09375rem", sm: "0.875rem" }, // 0.875rem * 1.25
              }}
            >
              خواندن توضیحات کامل
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body2"
              sx={{
                color: "text.primary",
                fontSize: { xs: "1.09375rem", sm: "0.875rem" }, // 0.875rem * 1.25
              }}
            >
              {expanded ? full_explanation : truncatedExplanation}
            </Typography>
          </AccordionDetails>
        </Accordion>
        <StyledIconButton
          onClick={handleAudioToggle}
          disabled={isLoading}
          sx={{
            mt: 2,
            backgroundColor: isLoading
              ? "#1976D2" // Blue for loading
              : isPlaying
              ? "#D32F2F" // Red for playing (stop)
              : "#F57C00", // Orange for initial state
            color: "white",
            "&:hover": {
              backgroundColor: isLoading
                ? "#1565C0"
                : isPlaying
                ? "#C62828"
                : "#EF6C00",
            },
            "&:disabled": {
              backgroundColor: "#B0BEC5",
              color: "white",
            },
          }}
        >
          {isLoading ? (
            <CircularProgress size={24} sx={{ color: "white" }} />
          ) : isPlaying ? (
            <StopIcon />
          ) : (
            <VolumeUpIcon />
          )}
        </StyledIconButton>
        {tags.length > 0 && (
          <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mr: 1, fontSize: { xs: "1.09375rem", sm: "0.875rem" } }} // 0.875rem * 1.25
            >
              برچسب‌ها:
            </Typography>
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                color="secondary"
                size="small"
                sx={{ fontSize: { xs: "1.015625rem", sm: "0.8125rem" } }} // 0.8125rem * 1.25
              />
            ))}
          </Box>
        )}
        {citations.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: "1.09375rem", sm: "0.875rem" } }} // 0.875rem * 1.25
            >
              منابع:
            </Typography>
            <List sx={{ listStyleType: "disc", pl: 4 }}>
              {citations.map((citation, index) => (
                <ListItem sx={{ display: "list-item", p: 0 }} key={index}>
                  <ListItemText
                    primary={
                      isValidUrl(citation) ? (
                        <a
                          href={citation}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "#1976D9",
                            textDecoration: "underline",
                            fontSize: "inherit", // Ensure link inherits parent font size
                          }}
                        >
                          {citation}
                        </a>
                      ) : (
                        citation
                      )
                    }
                    primaryTypographyProps={{
                      variant: "body2",
                      sx: { fontSize: { xs: "1.09375rem", sm: "0.875rem" } }, // 0.875rem * 1.25
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default DetailedNewsCard;

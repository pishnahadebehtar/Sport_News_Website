// components/DetailedNewsCard.tsx
import React, { useState } from "react";
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
} from "@mui/material";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";

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

  const isValidUrl = (str: string) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  // Truncate full_explanation to 50 characters (Persian) when collapsed
  const truncatedExplanation =
    full_explanation.length > 50
      ? full_explanation.slice(0, 50) + "..."
      : full_explanation;

  return (
    <Card
      sx={{
        background: "rgba(255, 255, 255, 0.1)", // Semi-transparent white
        backdropFilter: "blur(10px)", // Frosted glass effect
        WebkitBackdropFilter: "blur(10px)", // Safari support
        border: "1px solid rgba(255, 255, 255, 0.2)", // Subtle border
        borderRadius: "12px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.3)", // Softer shadow
        transition: "transform 0.3s",
        "&:hover": { transform: "scale(1.02)" },
        // Fallback for browsers without backdrop-filter
        "@supports not (backdrop-filter: blur(10px))": {
          background: "rgba(30, 30, 30, 0.8)", // Darker fallback
        },
      }}
      dir="rtl"
    >
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h3"
          sx={{
            fontSize: "1.25rem",
            fontWeight: "bold",
            color: "text.primary",
          }}
        >
          {title}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
          <Typography variant="body2" color="success.main">
            {category}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • {source}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • {new Date(date).toLocaleDateString("fa-IR")}
          </Typography>
        </Box>
        <Typography
          variant="body1"
          sx={{
            color: "text.primary",
            mt: 2,
          }}
        >
          {summary}
        </Typography>
        <Accordion
          expanded={expanded}
          onChange={() => setExpanded(!expanded)}
          sx={{
            mt: 2,
            bgcolor: "#2E1A47", // Very dark purple
            color: "text.primary", // White text
            "&:hover": { bgcolor: "#3F2A5C" }, // Lighter purple on hover
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
              sx={{ fontWeight: "bold", color: "text.primary" }}
            >
              خواندن توضیحات کامل
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" sx={{ color: "text.primary" }}>
              {expanded ? full_explanation : truncatedExplanation}
            </Typography>
          </AccordionDetails>
        </Accordion>
        {tags.length > 0 && (
          <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              برچسب‌ها:
            </Typography>
            {tags.map((tag) => (
              <Chip key={tag} label={tag} color="secondary" size="small" />
            ))}
          </Box>
        )}
        {citations.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
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
                          }}
                        >
                          {citation}
                        </a>
                      ) : (
                        citation
                      )
                    }
                    primaryTypographyProps={{ variant: "body2" }}
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

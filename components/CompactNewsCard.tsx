// components/CompactNewsCard.tsx
import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  Collapse,
  IconButton,
  useTheme,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

interface CompactNewsCardProps {
  title: string;
  category: string;
  source: string;
  date: string;
  summary?: string;
  full_explanation?: string;
  tags?: string[];
  citations?: string[];
  isExpanded?: boolean;
  onClick?: () => void;
  onClose?: () => void;
}

const CompactNewsCard: React.FC<CompactNewsCardProps> = ({
  title,
  category,
  source,
  date,
  summary = "",
  full_explanation = "",
  tags = [],
  citations = [],
  isExpanded = false,
  onClick,
  onClose,
}) => {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();

  const isValidUrl = (str: string) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <Card
      sx={{
        width: isExpanded ? "100%" : 300,
        flexShrink: isExpanded ? 0 : undefined,
        bgcolor: "background.paper",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        border: `2px solid ${isExpanded ? "transparent" : "#F57C00"}`, // Orange border
        transition: "transform 0.3s",
        "&:hover": !isExpanded ? { transform: "scale(1.05)" } : undefined,
        cursor: !isExpanded ? "pointer" : "default",
      }}
      dir="rtl"
      onClick={!isExpanded ? onClick : undefined}
    >
      <CardContent sx={{ p: isExpanded ? 3 : 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant={isExpanded ? "h3" : "body1"}
            sx={{
              fontWeight: "bold",
              fontSize: isExpanded ? "1.25rem" : "1rem",
              color: "text.primary",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {title}
          </Typography>
          {isExpanded && onClose && (
            <IconButton onClick={onClose} sx={{ color: "text.primary" }}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>
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
        {isExpanded && (
          <>
            <Typography
              variant="body1"
              sx={{
                color: "text.primary",
                mt: 2,
                display: "-webkit-box",
                WebkitLineClamp: expanded ? undefined : 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {summary}
            </Typography>
            <Collapse in={expanded} collapsedSize={80}>
              <Typography
                variant="body2"
                sx={{
                  color: "text.primary",
                  mt: 2,
                }}
              >
                {full_explanation}
              </Typography>
            </Collapse>
            <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                {expanded ? "نمایش کمتر" : "نمایش بیشتر"}
              </Typography>
              <IconButton
                onClick={() => setExpanded(!expanded)}
                sx={{ color: "primary.main" }}
              >
                <ExpandMoreIcon
                  sx={{
                    transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s",
                  }}
                />
              </IconButton>
            </Box>
            {tags.length > 0 && (
              <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mr: 1 }}
                >
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
                                color: theme.palette.primary.main,
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
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CompactNewsCard;

"use client";
import { Box, Typography, Link, IconButton } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import YouTubeIcon from "@mui/icons-material/YouTube";
import FavoriteIcon from "@mui/icons-material/Favorite";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        backgroundColor: "transparent", // Transparent background
        padding: "2rem 1rem",
        textAlign: "center",
        minHeight: "200px", // Ensure enough space for content
      }}
    >
      {/* Main Text */}
      <Typography
        variant="body1"
        sx={{
          fontSize: { xs: "0.9rem", sm: "1rem" }, // Responsive font size
          maxWidth: "600px", // Limit text width for readability
          marginBottom: "1.5rem",
          color: "#fff", // White text for visibility (adjust based on background)
        }}
      >
        این وب سایت یک پروژه اپن سورس تمام اتوماتیک با استفاده از ایجنت هوش
        مصنوعی بوده و تمامی محتواها تولید شده توسط هوش مصنوعی می باشد جهت دانلود
        سورس کد پروژه و مشاهده ویدیو آموزشی به لینک های زیر مراجعه کنید
      </Typography>

      {/* GitHub Icon Link */}
      <Link
        href="https://github.com/pishnahadebehtar/Sport_News_Website"
        target="_blank"
        rel="noopener noreferrer"
        sx={{ marginBottom: "1rem" }}
      >
        <IconButton
          sx={{
            color: "#fff", // White icon (adjust as needed)
            "&:hover": { color: "#e0e0e0" }, // Lighter on hover
          }}
        >
          <GitHubIcon sx={{ fontSize: { xs: "2.5rem", sm: "3rem" } }} />{" "}
          {/* Large icon */}
        </IconButton>
      </Link>

      {/* YouTube Icon Link */}
      <Link
        href="https://www.youtube.com"
        target="_blank"
        rel="noopener noreferrer"
        sx={{ marginBottom: "1rem" }}
      >
        <IconButton
          sx={{
            color: "#ff0000", // YouTube red (adjust as needed)
            "&:hover": { color: "#cc0000" }, // Darker red on hover
          }}
        >
          <YouTubeIcon sx={{ fontSize: { xs: "2.5rem", sm: "3rem" } }} />{" "}
          {/* Large icon */}
        </IconButton>
      </Link>

      {/* Text with Heart Icon */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Typography
          variant="body2"
          sx={{
            fontSize: { xs: "0.8rem", sm: "0.9rem" },
            color: "#fff", // White text
          }}
        >
          مید ویز لاو
        </Typography>
        <FavoriteIcon sx={{ fontSize: "1.2rem", color: "#ff0000" }} />{" "}
        {/* Heart icon */}
      </Box>
    </Box>
  );
}

// app/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import CompactNewsCard from "@/components/CompactNewsCard";
import DetailedNewsCard from "@/components/DetailedNewsCard";
import { debounce } from "@/utils/debounce";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Box,
  TextField,
  Chip,
  Button,
  CircularProgress,
  Typography,
  IconButton,
  CssBaseline,
} from "@mui/material";
import {
  Search as SearchIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import HomePage from "@/components/HomePage";
import hodhod from "../public/images/hodhod.png";
import Footer from "@/components/Footer";

// Custom dark theme
const theme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#121212", paper: "#1E1E1E" },
    text: { primary: "#FFFFFF", secondary: "#B0B0B0" },
    primary: { main: "#1976D9" },
    secondary: { main: "#AB47BC" },
    error: { main: "#D32F2F" },
    success: { main: "#388E3C" },
  },
  typography: {
    fontFamily: '"Far Nazanin", "IRANSans", Roboto, Arial, sans-serif',
    h2: {
      fontWeight: 700,
      fontFamily: '"Far Nazanin", "IRANSans", Roboto, Arial, sans-serif',
    },
    h3: {
      fontWeight: 700,
      fontFamily: '"Far Nazanin", "IRANSans", Roboto, Arial, sans-serif',
    },
    h4: {
      fontWeight: 700,
      fontFamily: '"Far Nazanin", "IRANSans", Roboto, Arial, sans-serif',
    },
    body1: {
      fontSize: "1rem",
      fontFamily: '"Far Nazanin", "IRANSans", Roboto, Arial, sans-serif',
    },
    body2: {
      fontSize: "0.875rem",
      fontFamily: '"Far Nazanin", "IRANSans", Roboto, Arial, sans-serif',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          textTransform: "none",
          transition: "background-color 0.3s",
          "&:hover": { backgroundColor: "#1565C0" },
          fontFamily: '"Far Nazanin", "IRANSans", Roboto, Arial, sans-serif',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          margin: "0 4px",
          "&:hover": { backgroundColor: "#7B1FA2" },
          fontFamily: '"Far Nazanin", "IRANSans", Roboto, Arial, sans-serif',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: '"Far Nazanin", "IRANSans", Roboto, Arial, sans-serif',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          fontFamily: '"Far Nazanin", "IRANSans", Roboto, Arial, sans-serif',
        },
      },
    },
  },
});

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

const Home: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<NewsArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<{
    category: string[];
    tags: string[];
    source: string[];
  }>({
    category: [],
    tags: [],
    source: [],
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHeadline, setSelectedHeadline] = useState<string | null>(null);
  const pageSize = 10;

  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);

  const categoryFilterRef = useRef<HTMLDivElement>(null);
  const tagsFilterRef = useRef<HTMLDivElement>(null);
  const sourceFilterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setError(null);
        const response = await fetch("/api/news/filters");
        if (!response.ok) throw new Error("خطا در دریافت فیلترها");
        const { categories, tags, sources } = await response.json();
        setCategories(categories);
        setTags(tags);
        setSources(sources);
      } catch (error) {
        console.error("Error fetching filters:", error);
        setError("خطا در دریافت فیلترها");
      }
    };
    fetchFilters();
  }, []);

  const fetchArticles = async (pageNum: number, reset = false) => {
    try {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: pageNum.toString(),
        pageSize: pageSize.toString(),
      });
      filters.category.forEach((cat) => params.append("category", cat));
      filters.tags.forEach((tag) => params.append("tags", tag));
      filters.source.forEach((src) => params.append("source", src));

      const response = await fetch(`/api/news?${params}`);
      if (!response.ok) throw new Error("خطا در دریافت اخبار");
      const data: { articles: NewsArticle[]; hasMore: boolean } =
        await response.json();

      setArticles((prev) =>
        reset ? data.articles : [...prev, ...data.articles]
      );
      setHasMore(data.hasMore);

      if (reset) {
        const featuredResponse = await fetch(`/api/news?page=1&pageSize=5`);
        if (!featuredResponse.ok) throw new Error("خطا در دریافت اخبار ویژه");
        const featuredData: { articles: NewsArticle[]; hasMore: boolean } =
          await featuredResponse.json();
        setFeaturedArticles(featuredData.articles);
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
      setError("خطا در دریافت اخبار");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSearchResults = async () => {
    if (!searchQuery) {
      fetchArticles(1, true);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams({ query: searchQuery });
      filters.category.forEach((cat) => params.append("category", cat));
      filters.tags.forEach((tag) => params.append("tags", tag));
      filters.source.forEach((src) => params.append("source", src));

      const response = await fetch(`/api/news/search?${params}`);
      if (!response.ok) throw new Error("خطا در جستجوی اخبار");
      const data: { articles: NewsArticle[] } = await response.json();
      setArticles(data.articles);
      setHasMore(false);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setError("خطا در جستجوی اخبار");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      fetchSearchResults();
    } else {
      fetchArticles(page, page === 1);
    }
  }, [page, searchQuery, filters]);

  const handleSearch = debounce((value: string) => {
    setSearchQuery(value);
    setPage(1);
  }, 300);

  const handleFilter = (
    type: "category" | "tags" | "source",
    value: string
  ) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      const current = newFilters[type];
      if (current.includes(value)) {
        newFilters[type] = current.filter((item) => item !== value);
      } else {
        newFilters[type] = [...current, value];
      }
      return newFilters;
    });
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ category: [], tags: [], source: [] });
    setPage(1);
  };

  const scrollFilters = (
    ref: React.RefObject<HTMLDivElement | null>,
    direction: "left" | "right"
  ) => {
    if (ref.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          color: "text.primary",
          direction: "rtl",
          p: 2,
        }}
      >
        {/* Error Display */}
        {error && (
          <Typography color="error.main" sx={{ p: 2, textAlign: "center" }}>
            {error}
          </Typography>
        )}

        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            mb: 2,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: "#F28C38",
              fontSize: { xs: "1.5rem", md: "2rem" },
            }}
          >
            به هدهد خوش آمدید
          </Typography>
          <Image
            src={hodhod}
            alt="لوگوی هدهد"
            width={100}
            height={100}
            priority
          />
        </Box>
        <HomePage />
        {/* Featured News (Breaking News Flexbox) */}
        {selectedHeadline ? (
          <Box
            sx={{
              px: 2,
              py: 1,
              display: "flex",
              justifyContent: "center",
              width: "100%",
            }}
          >
            {featuredArticles
              .filter((article) => article.$id === selectedHeadline)
              .map((article) => (
                <CompactNewsCard
                  key={article.$id}
                  title={article.title}
                  category={article.category}
                  source={article.source}
                  date={article.date}
                  summary={article.summary}
                  full_explanation={article.full_explanation}
                  tags={article.tags}
                  citations={article.citations}
                  isExpanded
                  onClose={() => setSelectedHeadline(null)}
                />
              ))}
          </Box>
        ) : (
          <Box sx={{ px: 2, py: 1 }}>
            <Typography
              variant="h3"
              sx={{
                fontSize: "1.25rem",
                fontWeight: "bold",
                color: "text.primary",
                bgcolor: "error.main",
                p: 1,
                borderRadius: "8px",
                mb: 2,
                textAlign: "center",
              }}
            >
              اخبار فوری
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                flexWrap: { xs: "nowrap", sm: "wrap" },
                gap: 3,
                justifyContent: "center",
              }}
            >
              {featuredArticles.length > 0 ? (
                featuredArticles.slice(0, 3).map((article, index) => (
                  <Box
                    key={article.$id}
                    sx={{
                      flexBasis: { xs: "100%", sm: "calc(33.33% - 16px)" },
                      maxWidth: { xs: "100%", sm: "calc(33.33% - 16px)" },
                      display: {
                        xs: index < 2 ? "block" : "none",
                        sm: index < 3 ? "block" : "none",
                      },
                    }}
                  >
                    <CompactNewsCard
                      title={article.title}
                      category={article.category}
                      source={article.source}
                      date={article.date}
                      onClick={() => setSelectedHeadline(article.$id)}
                    />
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary">
                  در حال بارگذاری اخبار ویژه...
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {/* Quick Filters: Categories */}
        <Box sx={{ px: 2, py: 1 }}>
          <Typography
            variant="h4"
            sx={{ fontSize: "1.1rem", fontWeight: "bold", mb: 1 }}
          >
            دسته‌بندی‌ها
          </Typography>
          <Box
            sx={{
              border: "1px solid #B0B0B0",
              borderRadius: "8px",
              p: 1,
            }}
          >
            <Box
              ref={categoryFilterRef}
              sx={{
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: 1,
                py: 1,
              }}
            >
              <Chip
                label="حذف فیلترها"
                onClick={clearFilters}
                color="primary"
                sx={{ bgcolor: "#388E3C" }}
              />
              {categories.map((category) => (
                <Chip
                  key={category}
                  label={category}
                  onClick={() => handleFilter("category", category)}
                  color={
                    filters.category.includes(category)
                      ? "secondary"
                      : "default"
                  }
                />
              ))}
            </Box>
          </Box>
        </Box>

        {/* Quick Filters: Tags */}
        <Box sx={{ px: 2, py: 1 }}>
          <Typography
            variant="h4"
            sx={{ fontSize: "1.1rem", fontWeight: "bold", mb: 1 }}
          >
            برچسب‌ها
          </Typography>
          <Box
            sx={{
              border: "1px solid #B0B0B0",
              borderRadius: "8px",
              p: 1,
              display: "flex",
              alignItems: "center",
            }}
          >
            <IconButton
              onClick={() => scrollFilters(tagsFilterRef, "left")}
              sx={{
                color: "#FFFFFF",
                bgcolor: "rgba(0, 0, 0, 0.5)",
                "&:hover": { bgcolor: "rgba(0, 0, 0, 0.7)" },
                mr: 1,
              }}
            >
              <ChevronRightIcon />
            </IconButton>
            <Box
              ref={tagsFilterRef}
              sx={{
                display: "flex",
                flexWrap: "nowrap",
                overflowX: "auto",
                flex: 1,
                gap: 1,
                py: 1,
                "&::-webkit-scrollbar": { display: "none" },
                scrollBehavior: "smooth",
              }}
            >
              <Chip
                label="حذف فیلترها"
                onClick={clearFilters}
                color="primary"
                sx={{ bgcolor: "#388E3C", flexShrink: 0 }}
              />
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onClick={() => handleFilter("tags", tag)}
                  color={filters.tags.includes(tag) ? "secondary" : "default"}
                  sx={{ flexShrink: 0 }}
                />
              ))}
            </Box>
            <IconButton
              onClick={() => scrollFilters(tagsFilterRef, "right")}
              sx={{
                color: "#FFFFFF",
                bgcolor: "rgba(0, 0, 0, 0.5)",
                "&:hover": { bgcolor: "rgba(0, 0, 0, 0.7)" },
                ml: 1,
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Quick Filters: Sources */}
        <Box sx={{ px: 2, py: 1 }}>
          <Typography
            variant="h4"
            sx={{ fontSize: "1.1rem", fontWeight: "bold", mb: 1 }}
          >
            منابع
          </Typography>
          <Box
            sx={{
              border: "1px solid #B0B0B0",
              borderRadius: "8px",
              p: 1,
              display: "flex",
              alignItems: "center",
            }}
          >
            <IconButton
              onClick={() => scrollFilters(sourceFilterRef, "left")}
              sx={{
                color: "#FFFFFF",
                bgcolor: "rgba(0, 0, 0, 0.5)",
                "&:hover": { bgcolor: "rgba(0, 0, 0, 0.7)" },
                mr: 1,
              }}
            >
              <ChevronRightIcon />
            </IconButton>
            <Box
              ref={sourceFilterRef}
              sx={{
                display: "flex",
                flexWrap: "nowrap",
                overflowX: "auto",
                flex: 1,
                gap: 1,
                py: 1,
                "&::-webkit-scrollbar": { display: "none" },
                scrollBehavior: "smooth",
              }}
            >
              <Chip
                label="حذف فیلترها"
                onClick={clearFilters}
                color="primary"
                sx={{ bgcolor: "#388E3C", flexShrink: 0 }}
              />
              {sources.map((source) => (
                <Chip
                  key={source}
                  label={source}
                  onClick={() => handleFilter("source", source)}
                  color={
                    filters.source.includes(source) ? "secondary" : "default"
                  }
                  sx={{ flexShrink: 0 }}
                />
              ))}
            </Box>
            <IconButton
              onClick={() => scrollFilters(sourceFilterRef, "right")}
              sx={{
                color: "#FFFFFF",
                bgcolor: "rgba(0, 0, 0, 0.5)",
                "&:hover": { bgcolor: "rgba(0, 0, 0, 0.7)" },
                ml: 1,
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Search Bar */}
        <Box sx={{ px: 2, py: 1 }}>
          <TextField
            id="search-input"
            label="جستجوی اخبار"
            variant="outlined"
            fullWidth
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
              ),
            }}
            onChange={(e) => handleSearch(e.target.value)}
            sx={{ bgcolor: "background.paper", borderRadius: "8px" }}
          />
        </Box>

        {/* Latest News */}
        <Typography variant="h2" sx={{ px: 2, py: 2, fontSize: "1.75rem" }}>
          آخرین اخبار
        </Typography>
        <Box sx={{ px: 2 }}>
          {articles.length > 0 ? (
            articles.map((article) => (
              <Box key={article.$id} sx={{ mb: 2 }}>
                <DetailedNewsCard
                  title={article.title}
                  summary={article.summary}
                  category={article.category}
                  source={article.source}
                  date={article.date}
                  tags={article.tags}
                  citations={article.citations}
                  full_explanation={article.full_explanation}
                />
              </Box>
            ))
          ) : (
            <Typography color="text.secondary">
              در حال بارگذاری اخبار...
            </Typography>
          )}
        </Box>

        {/* Load More Button */}
        {hasMore && !searchQuery && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? "در حال بارگذاری..." : "بارگذاری بیشتر"}
            </Button>
          </Box>
        )}

        {/* Footer Navigation */}
      </Box>
      <Footer />
    </ThemeProvider>
  );
};

export default Home;

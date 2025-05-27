import React from "react";

interface NewsCardProps {
  title: string;
  summary: string;
  category: string;
  imageUrl?: string;
  variant: "compact" | "detailed";
}

const NewsCard: React.FC<NewsCardProps> = ({
  title,
  summary,
  category,
  imageUrl,
  variant,
}) => {
  return (
    <div
      className={`flex ${
        variant === "compact"
          ? "flex-col w-24"
          : "items-stretch justify-between gap-4 rounded-lg"
      }`}
    >
      <div
        className={`w-full bg-center bg-no-repeat bg-cover rounded-lg ${
          variant === "compact" ? "aspect-[3/5]" : "aspect-video flex-1"
        }`}
        style={{
          backgroundImage: imageUrl
            ? `url(${imageUrl})`
            : "url(/placeholder.jpg)",
        }}
      />
      <div
        className={
          variant === "compact"
            ? "text-left mt-2"
            : "flex flex-col gap-1 flex-[2_2_0px]"
        }
      >
        <p className="text-darkSecondary text-sm font-normal leading-normal">
          {category}
        </p>
        <p
          className={`text-darkText ${
            variant === "compact"
              ? "text-[13px] font-normal"
              : "text-base font-bold"
          } leading-tight`}
        >
          {title}
        </p>
        {variant === "detailed" && (
          <p className="text-darkSecondary text-sm font-normal leading-normal">
            {summary}
          </p>
        )}
      </div>
    </div>
  );
};

export default NewsCard;

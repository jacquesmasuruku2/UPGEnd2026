import { motion } from "framer-motion";
import { CalendarIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { memo } from "react";

interface NewsCardProps {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  image?: string;
  slug: string;
}

const NewsCard = memo(({ id, title, excerpt, date, image, slug }: NewsCardProps) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
      transition={{ duration: 0.3 }}
      className="bg-card border border-border overflow-hidden shadow-sm hover:border-[hsl(var(--upg-orange))] transition-all duration-300 group h-full flex flex-col"
    >
      {image && (
        <div className="relative overflow-hidden h-48">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <CalendarIcon className="w-3 h-3" />
          <span>{date}</span>
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-[hsl(var(--upg-orange))] transition-colors duration-300 line-clamp-2">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">{excerpt}</p>
        <Link           to={`/blog/${slug}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:text-[hsl(var(--upg-orange))] transition-colors duration-300 hover:gap-3"
        >
          <span>Lire la suite</span>
          <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </motion.article>
  );
};

});

export default NewsCard;

import { motion } from "framer-motion";
import { AcademicCap, UsersIcon, ClockIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { memo } from "react";

interface CourseCardProps {
  id: string;
  name: string;
  description: string;
  duration?: string;
  capacity?: string;
  slug: string;
}

const CourseCard = memo(({ id, name, description, duration, capacity, slug }: CourseCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
      transition={{ duration: 0.3 }}
      className="bg-card border border-border overflow-hidden shadow-sm hover:border-[hsl(var(--upg-orange))] transition-all duration-300 group h-full flex flex-col"
    >
      <div className="p-6 flex-1 flex flex-col">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-[hsl(var(--upg-orange))]/20 transition-colors duration-300">
          <AcademicCapIcon className="w-6 h-6 text-primary group-hover:text-[hsl(var(--upg-orange))] transition-colors duration-300" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-[hsl(var(--upg-orange))] transition-colors duration-300 line-clamp-2">
          {name}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">{description}</p>
        
        {(duration || capacity) && (
          <div className="flex flex-wrap gap-3 mb-4">
            {duration && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ClockIcon className="w-3 h-3" />
                <span>{duration}</span>
              </div>
            )}
            {capacity && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <UsersIcon className="w-3 h-3" />
                <span>{capacity}</span>
              </div>
            )}
          </div>
        )}
        
        <Link           to={`/faculte/${slug}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:text-[hsl(var(--upg-orange))] transition-colors duration-300 hover:gap-3"
        >
          <span>Découvrir</span>
          <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </motion.div>
  );
});

export default CourseCard;

import { useState, useEffect, useRef } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
  delay?: number;
  onComplete?: () => void;
}

const TypewriterText = ({
  text,
  speed = 40,
  className = "",
  delay = 0,
  onComplete,
}: TypewriterTextProps) => {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const indexRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDisplayText("");
    indexRef.current = 0;
    setIsTyping(false);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const delayTimeout = setTimeout(() => {
      setIsTyping(true);
    }, delay);

    return () => {
      clearTimeout(delayTimeout);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, delay]);

  useEffect(() => {
    if (!isTyping) return;

    if (indexRef.current < text.length) {
      timeoutRef.current = setTimeout(() => {
        indexRef.current += 1;
        setDisplayText(text.slice(0, indexRef.current));
      }, speed);
    } else {
      onComplete?.();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [displayText, isTyping, text, speed, onComplete]);

  return (
    <span className={className}>
      {displayText}
      {isTyping && indexRef.current < text.length && (
        <span className="inline-block w-[2px] h-[1em] bg-current ml-[1px] animate-pulse align-middle" />
      )}
    </span>
  );
};

export default TypewriterText;

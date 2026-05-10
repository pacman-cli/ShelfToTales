import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className = "", hoverable = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-border bg-card p-4 ${hoverable ? "transition-all hover:shadow-lg hover:border-primary-light hover:-translate-y-1 cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

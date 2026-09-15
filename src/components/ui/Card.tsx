import React, { forwardRef } from "react";
import { cn } from "../../lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "subtle" | "interactive" | "ai";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variantStyles = {
      default:
        "bg-white dark:bg-[#161c28] border border-gray-200/90 dark:border-gray-800 shadow-xs",
      subtle:
        "bg-gray-50/80 dark:bg-[#131923] border border-gray-200/60 dark:border-gray-800/80",
      interactive:
        "bg-white dark:bg-[#161c28] border border-gray-200/90 dark:border-gray-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm cursor-pointer transition-all duration-150",
      ai: "bg-white dark:bg-[#161c28] border border-purple-200/80 dark:border-purple-900/50 shadow-xs ring-1 ring-purple-100/60 dark:ring-purple-900/20",
    };

    return (
      <div
        ref={ref}
        className={cn("rounded-xl transition-colors", variantStyles[variant], className)}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

export const CardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-between p-5 pb-3 border-b border-gray-100 dark:border-gray-800/60 gap-4",
      className
    )}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-bold text-sm tracking-tight text-gray-900 dark:text-white flex items-center gap-2",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs text-gray-500 dark:text-gray-400 mt-0.5", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-5", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-between p-4 px-5 pt-3 border-t border-gray-100 dark:border-gray-800/60 text-xs text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-transparent rounded-b-xl",
      className
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

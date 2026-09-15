import React, { forwardRef } from "react";
import { cn } from "../../lib/utils";

export const Table = forwardRef<
  HTMLTableElement,
  React.TableHTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto rounded-lg border border-gray-200/90 dark:border-gray-800">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-xs text-left", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      "bg-gray-50/90 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700/80 uppercase text-[11px] font-bold text-gray-500 dark:text-gray-400 tracking-wider",
      className
    )}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

export const TableBody = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("divide-y divide-gray-100 dark:divide-gray-800/80 bg-white dark:bg-[#161c28]", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

export const TableFooter = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "bg-gray-50 dark:bg-gray-800/50 font-medium border-t border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

export const TableRow = forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-800/60 data-[state=selected]:bg-blue-50 dark:data-[state=selected]:bg-blue-950/40",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

export const TableHead = forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn("h-9 px-4 text-left font-semibold align-middle select-none", className)}
    {...props}
  />
));
TableHead.displayName = "TableHead";

export const TableCell = forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle text-gray-700 dark:text-gray-300", className)}
    {...props}
  />
));
TableCell.displayName = "TableCell";

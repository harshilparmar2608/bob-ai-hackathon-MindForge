import React, { createContext, useContext, useState } from "react";
import { cn } from "../../lib/utils";

interface TabsContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className,
  ...props
}) => {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue || "");
  const isControlled = controlledValue !== undefined;
  const activeTab = isControlled ? controlledValue : uncontrolledValue;

  const setActiveTab = (val: string) => {
    if (!isControlled) {
      setUncontrolledValue(val);
    }
    onValueChange?.(val);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn("w-full space-y-3", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="tablist"
    className={cn(
      "inline-flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800/80 rounded-lg border border-gray-200/80 dark:border-gray-700/80 text-gray-500 dark:text-gray-400 select-none",
      className
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, children, ...props }, ref) => {
    const context = useContext(TabsContext);
    if (!context) throw new Error("TabsTrigger must be used within Tabs");

    const isActive = context.activeTab === value;

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={isActive}
        onClick={() => context.setActiveTab(value)}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          isActive
            ? "bg-white dark:bg-[#161c28] text-gray-900 dark:text-white shadow-2xs font-bold"
            : "hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200/50 dark:hover:bg-gray-700/40 text-gray-600 dark:text-gray-400",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";

export interface TabsContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const context = useContext(TabsContext);
    if (!context) throw new Error("TabsContent must be used within Tabs");

    if (context.activeTab !== value) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        tabIndex={0}
        className={cn("focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 rounded-lg animate-in fade-in-50 duration-150", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabsContent.displayName = "TabsContent";

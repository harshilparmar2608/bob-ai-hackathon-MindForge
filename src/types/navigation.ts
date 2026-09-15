import { LucideIcon } from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  path: string;
  iconName: string;
  badge?: string | number;
  badgeVariant?: "blue" | "green" | "purple" | "amber" | "red";
  description?: string;
}

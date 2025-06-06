import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import styles from "./badge.module.scss";

const badgeVariants = cva(styles.badgeBase, {
  variants: {
    variant: {
      default: styles.badgeDefault,
      secondary: styles.badgeSecondary,
      destructive: styles.badgeDestructive,
      outline: styles.badgeOutline,
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}
function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

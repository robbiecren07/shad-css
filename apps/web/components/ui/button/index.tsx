import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import styles from "./button.module.scss";

const buttonVariants = cva(styles.buttonBase, {
  variants: {
    variant: {
      default: styles.buttonDefault,
      destructive: styles.buttonDestructive,
      outline: styles.buttonOutline,
      secondary: styles.buttonSecondary,
      ghost: styles.buttonGhost,
      link: styles.buttonLink,
    },
    size: {
      default: styles.buttonSizeDefault,
      sm: styles.buttonSizeSm,
      lg: styles.buttonSizeLg,
      icon: styles.buttonSizeIcon,
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

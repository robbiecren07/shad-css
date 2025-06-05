"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import { cn } from "@/lib/utils";
import styles from "./sooner.module.css";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster"
      toastOptions={{
        classNames: {
          toast: cn('toast', styles.toast),
          description: styles.toastDescription,
          actionButton: styles.toastActionButton,
          cancelButton: styles.toastCancelButton,
        },
      }}
      {...props}
    />
  )
};

export { Toaster };

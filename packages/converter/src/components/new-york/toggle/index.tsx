'use client';

import * as React from 'react';
import * as TogglePrimitive from '@radix-ui/react-toggle';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import styles from './toggle.module.css';

const toggleVariants = cva(styles.toggleBase, {
  variants: {
    variant: {
      default: styles.toggleDefault,
      outline: styles.toggleOutline,
    },
    size: {
      default: styles.toggleDefault,
      sm: styles.toggleSm,
      lg: styles.toggleLg,
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
));
Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };

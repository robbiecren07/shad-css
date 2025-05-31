'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';
import styles from './slider.module.css';

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(styles.slider, className)}
    {...props}
  >
    <SliderPrimitive.Track className={styles.sliderTrack}>
      <SliderPrimitive.Range className={styles.sliderRange} />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className={styles.sliderThumb} />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };

import { cn } from '@/lib/utils';
import styles from './skeleton.module.css';
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(styles.componentDiv, className)} {...props} />;
}

export { Skeleton };

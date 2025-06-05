import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { cn } from '@/lib/utils';
import buttonStyles from '@/components/ui/button/button.module.css';
import styles from './calendar.module.css';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(styles.calendar, className)}
      classNames={{
        months: styles.calendarMonths,
        month: styles.calendarMonth,
        caption: styles.calendarCaption,
        caption_label: styles.calendarCaptionLabel,
        nav: cn(
          buttonStyles.buttonOutline,
          styles.calendarNac
        ),
        nav_button: styles.calendarNavButton,
        nav_button_previous: styles.calendarNavButtonPrevious,
        nav_button_next: styles.calendarNavButtonNext,
        table: styles.calendarTable,
        head_row: styles.calendarHeadRow,
        head_cell: styles.calendarHeadCell,
        row: styles.calendarRow,
        cell: styles.calendarCell,
        day: cn(
          buttonStyles.buttonGhost,
          styles.calendarDay
        ),
        day_range_end: styles.calendarDayRangeEnd,
        day_selected: styles.calendarDaySelected,
        day_today: styles.calendarDayToday,
        day_outside: styles.calendarDayOutside,
        day_disabled: styles.calendarDayDisabled,
        day_range_middle: styles.calendarDayRangeMiddle,
        day_hidden: styles.calendarDayHidden,
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn(className, styles.calendarChevronLeft)} {...props} />
        ),
        IconRight: ({ ...props }) => (
          <ChevronRight className={cn(className, styles.calendarChevronLeft)} {...props} />
        ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };

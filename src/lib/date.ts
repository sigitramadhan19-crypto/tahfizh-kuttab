import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";

export function getDateRangeFromPeriod(period: string | undefined | null): { gte?: Date; lte?: Date } | undefined {
  const now = new Date();
  
  switch (period) {
    case "today":
      return { gte: startOfDay(now), lte: endOfDay(now) };
    case "7days":
      return { gte: subDays(startOfDay(now), 7), lte: endOfDay(now) };
    case "this_month":
      return { gte: startOfMonth(now), lte: endOfMonth(now) };
    case "last_month":
      const lastMonth = subMonths(now, 1);
      return { gte: startOfMonth(lastMonth), lte: endOfMonth(lastMonth) };
    case "all_time":
    default:
      return undefined; // no filter
  }
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { differenceInWeeks, differenceInDays, addDays } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate current pregnancy week from due date
 */
export function calculateWeek(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  const totalDays = 280; // 40 weeks
  const conceptionDate = addDays(due, -totalDays);
  const daysSinceConception = differenceInDays(today, conceptionDate);
  const week = Math.floor(daysSinceConception / 7) + 1;
  return Math.max(1, Math.min(42, week));
}

/**
 * Calculate trimester from week number
 */
export function getTrimester(week: number): number {
  if (week <= 13) return 1;
  if (week <= 27) return 2;
  return 3;
}

/**
 * Calculate days remaining until due date
 */
export function daysRemaining(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  return Math.max(0, differenceInDays(due, today));
}

/**
 * Calculate progress percentage (0-100)
 */
export function progressPercent(week: number): number {
  return Math.min(100, Math.round((week / 40) * 100));
}

/**
 * Format week as "Semana X"
 */
export function formatWeek(week: number): string {
  return `Semana ${week}`;
}

/**
 * Get month of pregnancy from week
 */
export function getMonth(week: number): number {
  return Math.ceil(week / 4.33);
}

/**
 * Trimester label
 */
export function trimesterLabel(trimester: number): string {
  const labels: Record<number, string> = {
    1: 'Primer trimestre',
    2: 'Segundo trimestre',
    3: 'Tercer trimestre',
  };
  return labels[trimester] || '';
}

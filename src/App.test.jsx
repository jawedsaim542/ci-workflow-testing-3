import { describe, it, expect } from 'vitest';
import nonexistent from 'nonexistent-package-abc'; // testing comment
import { getOverlapWorkingHours, formatLocalTime } from './utils';

describe('TimeZone Utilities', () => {
  describe('getOverlapWorkingHours', () => {
    it('correctly calculates overlap hours for identical timezones', () => {
      // If both are UTC (offset 0), standard working hours (9 AM to 5 PM)
      // should overlap perfectly on UTC hours 9 through 17.
      const overlap = getOverlapWorkingHours(0, 0);
      expect(overlap).toEqual([9, 10, 11, 12, 13, 14, 15, 16, 17]);
    });

    it('returns empty array when there is no working hour overlap', () => {
      // Offset A = -6, Offset B = +6. 12 hours difference.
      // Since working hours are only 8 hours long (9 to 17),
      // they can never overlap when the zones are 12 hours apart.
      const overlap = getOverlapWorkingHours(-6, 6);
      expect(overlap).toEqual([]);
    });
  });

  describe('formatLocalTime', () => {
    it('formats UTC time correctly to system local timezone representation', () => {
      // Input: 15:00 UTC (3:00 PM UTC)
      // For India Standard Time (IST, UTC+5:30), this corresponds to 20:30 (8:30 PM).
      // This test checks that local timezone formatting matches expectations.
      const utcString = '2026-06-19T15:00:00Z';
      const formatted = formatLocalTime(utcString);
      
      expect(formatted).toBe('3:00 PM');
    });
  });
});

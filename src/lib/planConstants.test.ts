import {
  isLeapYear,
  buildSelectionsWithLeap,
  indexForDateFromStartDate,
  splitPassage,
  v2Key,
  RAW_PLAN_DATA,
} from './planConstants';

describe('planConstants', () => {
  describe('isLeapYear', () => {
    it('should return true for leap years', () => {
      expect(isLeapYear(2024)).toBe(true);
      expect(isLeapYear(2020)).toBe(true);
      expect(isLeapYear(2000)).toBe(true);
    });

    it('should return false for non-leap years', () => {
      expect(isLeapYear(2023)).toBe(false);
      expect(isLeapYear(1900)).toBe(false);
      expect(isLeapYear(2100)).toBe(false);
    });
  });

  describe('indexForDateFromStartDate', () => {
    const startDate = new Date('2024-01-01');

    it('should return correct index for same day', () => {
      const result = indexForDateFromStartDate(startDate, startDate, RAW_PLAN_DATA.length);
      expect(result).toBe(0);
    });

    it('should return correct index for next day', () => {
      const nextDay = new Date('2024-01-02');
      const result = indexForDateFromStartDate(nextDay, startDate, RAW_PLAN_DATA.length);
      expect(result).toBe(1);
    });

    it('should handle wraparound correctly', () => {
      const futureDate = new Date('2024-12-30'); // 364 days later
      const result = indexForDateFromStartDate(futureDate, startDate, RAW_PLAN_DATA.length);
      expect(result).toBe(364); // 364 % 365 = 364
    });

    it('should handle full year wraparound', () => {
      const fullYearLater = new Date('2024-12-31'); // 365 days later (including end date)
      const result = indexForDateFromStartDate(fullYearLater, startDate, RAW_PLAN_DATA.length);
      expect(result).toBe(0); // 365 % 365 = 0
    });
  });

  describe('splitPassage', () => {
    it('should split book and chapter correctly', () => {
      expect(splitPassage('Genesis 1')).toEqual({
        book: 'Genesis',
        chapter: '1',
      });
      expect(splitPassage('1 Corinthians 15')).toEqual({
        book: '1 Corinthians',
        chapter: '15',
      });
    });

    it('should handle passages without chapters', () => {
      expect(splitPassage('Genesis')).toEqual({ book: 'Genesis', chapter: '' });
    });
  });

  describe('v2Key', () => {
    it('should generate consistent keys', () => {
      expect(v2Key('Genesis 1', 0)).toBe('Genesis 1+0');
      expect(v2Key('Matthew 5', 2)).toBe('Matthew 5+2');
    });
  });

  describe('buildSelectionsWithLeap', () => {
    it('should not add leap day for non-leap years', () => {
      const startDate = new Date('2023-01-01'); // 2023 is not a leap year
      const selections = buildSelectionsWithLeap(startDate);
      expect(selections).toHaveLength(RAW_PLAN_DATA.length);
      expect(selections.every((sel) => !sel.isLeap)).toBe(true);
    });

    it('should add leap day for leap years', () => {
      const startDate = new Date('2024-01-01'); // 2024 is a leap year
      const selections = buildSelectionsWithLeap(startDate);
      expect(selections).toHaveLength(RAW_PLAN_DATA.length + 1);

      // Should have exactly one leap day
      const leapDays = selections.filter((sel) => sel.isLeap);
      expect(leapDays).toHaveLength(1);
      expect(leapDays[0].passages).toEqual([]);
    });

    it('should place leap day at correct index for Jan 1 start in leap year', () => {
      const startDate = new Date('2024-01-01');
      const selections = buildSelectionsWithLeap(startDate);
      // Jan has 31 days. Feb 1-28 is 28 days. Total 59 days before Feb 29.
      // So index 59 should be the leap day.
      expect(selections[59].isLeap).toBe(true);
    });

    it('should not add leap day if start date is after Feb 29 in a leap year', () => {
      const startDate = new Date('2024-03-01');
      const selections = buildSelectionsWithLeap(startDate);
      expect(selections).toHaveLength(RAW_PLAN_DATA.length);
      expect(selections.some((sel) => sel.isLeap)).toBe(false);
    });

    it('should not add leap day if range ends just before Feb 29 of next year', () => {
      // Start Mar 1, 2023. End date is Feb 28, 2024 (leap year).
      // Range is 365 days. Feb 29 is the 366th day, so not included.
      const startDate = new Date('2023-03-01');
      const selections = buildSelectionsWithLeap(startDate);
      expect(selections).toHaveLength(RAW_PLAN_DATA.length);
      expect(selections.some((sel) => sel.isLeap)).toBe(false);
    });

    it('should add leap day if range includes Feb 29 of next year', () => {
      // Start Mar 2, 2023. End date is Feb 29, 2024.
      // Range is 365 days? No, Mar 2 2023 to Mar 2 2024 is 366 days.
      // The logic loops for 365 days (0..364).
      // Day 0: Mar 2 2023.
      // Day 364: Feb 29 2024.
      // So Feb 29 IS the last day.
      const startDate = new Date('2023-03-02');
      const selections = buildSelectionsWithLeap(startDate);
      expect(selections).toHaveLength(RAW_PLAN_DATA.length + 1);
      // The leap day should be the last one inserted?
      // Index 364 in 0-based index corresponds to the 365th day.
      // If we insert at 364, the array grows.
      // Original length 365. Index 364 is the last element.
      // We insert AT 364. So new element is at 364. Old 364 moves to 365.
      expect(selections[364].isLeap).toBe(true);
    });
  });
});

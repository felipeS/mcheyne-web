import {
  isLeapYear,
  buildSelectionsWithLeap,
  indexForDateFromStartDate,
  splitPassage,
  v2Key,
  RAW_PLAN_DATA,
} from "./planConstants";

describe("planConstants", () => {
  describe("isLeapYear", () => {
    it("should return true for leap years", () => {
      expect(isLeapYear(2024)).toBe(true);
      expect(isLeapYear(2020)).toBe(true);
      expect(isLeapYear(2000)).toBe(true);
    });

    it("should return false for non-leap years", () => {
      expect(isLeapYear(2023)).toBe(false);
      expect(isLeapYear(1900)).toBe(false);
      expect(isLeapYear(2100)).toBe(false);
    });
  });

  describe("indexForDateFromStartDate", () => {
    const startDate = new Date("2024-01-01");

    it("should return correct index for same day", () => {
      const result = indexForDateFromStartDate(
        startDate,
        startDate,
        RAW_PLAN_DATA.length
      );
      expect(result).toBe(0);
    });

    it("should return correct index for next day", () => {
      const nextDay = new Date("2024-01-02");
      const result = indexForDateFromStartDate(
        nextDay,
        startDate,
        RAW_PLAN_DATA.length
      );
      expect(result).toBe(1);
    });

    it("should handle wraparound correctly", () => {
      const futureDate = new Date("2024-12-30"); // 364 days later
      const result = indexForDateFromStartDate(
        futureDate,
        startDate,
        RAW_PLAN_DATA.length
      );
      expect(result).toBe(364); // 364 % 365 = 364
    });

    it("should handle full year wraparound", () => {
      const fullYearLater = new Date("2024-12-31"); // 365 days later (including end date)
      const result = indexForDateFromStartDate(
        fullYearLater,
        startDate,
        RAW_PLAN_DATA.length
      );
      expect(result).toBe(0); // 365 % 365 = 0
    });
  });

  describe("splitPassage", () => {
    it("should split book and chapter correctly", () => {
      expect(splitPassage("Genesis 1")).toEqual({
        book: "Genesis",
        chapter: "1",
      });
      expect(splitPassage("1 Corinthians 15")).toEqual({
        book: "1 Corinthians",
        chapter: "15",
      });
    });

    it("should handle passages without chapters", () => {
      expect(splitPassage("Genesis")).toEqual({ book: "Genesis", chapter: "" });
    });
  });

  describe("v2Key", () => {
    it("should generate consistent keys", () => {
      expect(v2Key("Genesis 1", 0)).toBe("Genesis 1+0");
      expect(v2Key("Matthew 5", 2)).toBe("Matthew 5+2");
    });
  });

  describe("buildSelectionsWithLeap", () => {
    it("should not add leap day for non-leap years", () => {
      const startDate = new Date("2023-01-01"); // 2023 is not a leap year
      const selections = buildSelectionsWithLeap(startDate);
      expect(selections).toHaveLength(RAW_PLAN_DATA.length);
      expect(selections.every((sel) => !sel.isLeap)).toBe(true);
    });

    it("should add leap day for leap years", () => {
      const startDate = new Date("2024-01-01"); // 2024 is a leap year
      const selections = buildSelectionsWithLeap(startDate);
      expect(selections).toHaveLength(RAW_PLAN_DATA.length + 1);

      // Should have exactly one leap day
      const leapDays = selections.filter((sel) => sel.isLeap);
      expect(leapDays).toHaveLength(1);
      expect(leapDays[0].passages).toEqual([]);
    });
  });
});

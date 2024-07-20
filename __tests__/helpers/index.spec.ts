import { isLeapYear } from "../../src/utils/helpers";

describe("Leap Year Utility", () => {
    it("should return true for a leap year", () => {
        expect(isLeapYear(2024)).toBeTruthy();
    });

    it("should return true for a non-leap year", () => {
        expect(isLeapYear(2027)).toBeFalsy();
    });
});

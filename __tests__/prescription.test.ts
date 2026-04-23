import { describe, it, expect } from 'vitest';
import {
  calculatePrescriptionDate,
  isPrescribed,
  getDaysRemaining,
  getStatus,
} from '@/lib/prescription';

describe('Prescription', () => {
  describe('calculatePrescriptionDate', () => {
    it('should add exactly 3 years to fecha de ingreso', () => {
      const ingreso = new Date('2021-06-15');
      const expected = new Date('2024-06-15');
      const result = calculatePrescriptionDate(ingreso);

      expect(result.getFullYear()).toBe(expected.getFullYear());
      expect(result.getMonth()).toBe(expected.getMonth());
      expect(result.getDate()).toBe(expected.getDate());
    });

    it('should handle leap years correctly', () => {
      const ingreso = new Date('2020-02-29');
      const result = calculatePrescriptionDate(ingreso);

      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(1); // February
      expect(result.getDate()).toBe(28); // Non-leap year
    });
  });

  describe('isPrescribed', () => {
    it('should return true for multa 4 years old', () => {
      const fourYearsAgo = new Date();
      fourYearsAgo.setFullYear(fourYearsAgo.getFullYear() - 4);

      expect(isPrescribed(fourYearsAgo)).toBe(true);
    });

    it('should return false for multa 1 year old', () => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      expect(isPrescribed(oneYearAgo)).toBe(false);
    });

    it('should return true for multa exactly 3 years and 1 day old', () => {
      const threeYearsAgo = new Date();
      threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
      threeYearsAgo.setDate(threeYearsAgo.getDate() - 1);

      expect(isPrescribed(threeYearsAgo)).toBe(true);
    });

    it('should return false for multa exactly 3 years old', () => {
      const threeYearsAgo = new Date();
      threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

      expect(isPrescribed(threeYearsAgo)).toBe(false);
    });
  });

  describe('getDaysRemaining', () => {
    it('should return 0 for prescribed multa', () => {
      const fourYearsAgo = new Date();
      fourYearsAgo.setFullYear(fourYearsAgo.getFullYear() - 4);

      expect(getDaysRemaining(fourYearsAgo)).toBe(0);
    });

    it('should return approximately 365 days for 2-year-old multa', () => {
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

      const days = getDaysRemaining(twoYearsAgo);
      // 2-year-old multa with 3-year prescription should have ~1 year remaining
      // Allow ±5 days margin for leap years
      expect(days).toBeGreaterThan(360);
      expect(days).toBeLessThan(370);
    });

    it('should return positive value for non-prescribed multa', () => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      expect(getDaysRemaining(oneYearAgo)).toBeGreaterThan(0);
    });
  });

  describe('getStatus', () => {
    it('should return PRESCRITA for old multa', () => {
      const fourYearsAgo = new Date();
      fourYearsAgo.setFullYear(fourYearsAgo.getFullYear() - 4);

      expect(getStatus(fourYearsAgo)).toBe('PRESCRITA');
    });

    it('should return VIGENTE for recent multa', () => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      expect(getStatus(oneYearAgo)).toBe('VIGENTE');
    });
  });
});

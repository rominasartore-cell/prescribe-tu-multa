import { describe, it, expect } from 'vitest';
import {
  validateRUT,
  validatePatente,
  validateFecha,
  validateMonto,
  validateArticulo,
  validateExtraction,
  normalizeExtraction,
} from '@/lib/validator';

describe('Validator', () => {
  describe('validateRUT', () => {
    it('should validate correct RUT with check digit', () => {
      expect(validateRUT('12345678-9')).toBe(true);
    });

    it('should accept RUT without hyphen', () => {
      expect(validateRUT('123456789')).toBe(true);
    });

    it('should reject invalid RUT', () => {
      expect(validateRUT('12345678-0')).toBe(false);
    });

    it('should reject empty RUT', () => {
      expect(validateRUT('')).toBe(false);
    });

    it('should validate RUT with K check digit', () => {
      // 51111111-K is a valid Chilean RUT with K (10) check digit
      expect(validateRUT('51111111-K')).toBe(true);
    });
  });

  describe('validatePatente', () => {
    it('should validate ABC-1234 format', () => {
      expect(validatePatente('ABC-1234')).toBe(true);
    });

    it('should validate ABC1234 format (no hyphen)', () => {
      expect(validatePatente('ABC1234')).toBe(true);
    });

    it('should validate ABCD-12 format', () => {
      expect(validatePatente('ABCD-12')).toBe(true);
    });

    it('should reject invalid format', () => {
      expect(validatePatente('1234-ABC')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(validatePatente('abc-1234')).toBe(true);
    });
  });

  describe('validateFecha', () => {
    it('should validate past date', () => {
      const pastDate = new Date('2021-01-15');
      expect(validateFecha(pastDate)).toBe(true);
    });

    it('should validate string date', () => {
      expect(validateFecha('2021-01-15')).toBe(true);
    });

    it('should reject future date', () => {
      const futureDate = new Date('2099-01-15');
      expect(validateFecha(futureDate)).toBe(false);
    });

    it('should reject date before 2000', () => {
      expect(validateFecha('1999-01-15')).toBe(false);
    });

    it('should reject invalid date string', () => {
      expect(validateFecha('invalid')).toBe(false);
    });
  });

  describe('validateMonto', () => {
    it('should accept positive amount', () => {
      expect(validateMonto(450000)).toBe(true);
    });

    it('should accept string amount', () => {
      expect(validateMonto('450000')).toBe(true);
    });

    it('should reject zero', () => {
      expect(validateMonto(0)).toBe(false);
    });

    it('should reject negative', () => {
      expect(validateMonto(-100)).toBe(false);
    });

    it('should reject amount > 10M', () => {
      expect(validateMonto(10000001)).toBe(false);
    });

    it('should accept max valid amount', () => {
      expect(validateMonto(9999999)).toBe(true);
    });
  });

  describe('validateArticulo', () => {
    it('should validate "Artículo 196"', () => {
      expect(validateArticulo('Artículo 196')).toBe(true);
    });

    it('should validate lowercase "artículo"', () => {
      expect(validateArticulo('artículo 189')).toBe(true);
    });

    it('should validate "Art. 123" format', () => {
      expect(validateArticulo('Art. 123')).toBe(true);
    });

    it('should reject missing number', () => {
      expect(validateArticulo('Artículo')).toBe(false);
    });

    it('should reject random text', () => {
      expect(validateArticulo('Something else')).toBe(false);
    });
  });

  describe('validateExtraction', () => {
    it('should return no errors for valid data', () => {
      const data: any = {
        rut: '12345678-9',
        patente: 'ABC-1234',
        monto: 450000,
        fechaIngreso: '2021-01-15',
      };
      const errors = validateExtraction(data);
      expect(errors).toHaveLength(0);
    });

    it('should identify invalid RUT', () => {
      const data: any = {
        rut: 'invalid',
        patente: 'ABC-1234',
        monto: 450000,
        fechaIngreso: '2021-01-15',
      };
      const errors = validateExtraction(data);
      expect(errors.some((e) => e.field === 'rut')).toBe(true);
    });

    it('should identify multiple errors', () => {
      const data: any = {
        rut: 'invalid',
        patente: 'invalid',
        monto: 0,
        fechaIngreso: '2099-01-15',
      };
      const errors = validateExtraction(data);
      expect(errors.length).toBeGreaterThan(2);
    });
  });

  describe('normalizeExtraction', () => {
    it('should uppercase RUT and remove spaces', () => {
      const data: any = {
        rut: '12345678 - 9',
        patente: 'abc-1234',
        monto: '450000',
        fechaIngreso: '2021-01-15',
      };
      const normalized = normalizeExtraction(data);
      expect(normalized.rut).toBe('123456789');
      expect(normalized.patente).toBe('ABC-1234');
      expect(normalized.monto).toBe(450000);
    });
  });
});

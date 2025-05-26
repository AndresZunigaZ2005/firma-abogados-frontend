// useEmailValidator.js
import { useMemo } from 'react';

export function useEmailValidator(email) {
  return useMemo(() => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }, [email]);
}
import { useState, useCallback } from "react";

/**
 * Custom hook for making API requests with error handling
 * @param {string} apiUrl - Base API URL
 * @param {Function} onError - Callback to handle errors
 */
export const useFetch = (apiUrl, onError) => {
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(
    async (endpoint, options = {}) => {
      setLoading(true);
      try {
        const response = await fetch(`${apiUrl}${endpoint}`, {
          headers: { "Content-Type": "application/json" },
          ...options,
        });

        if (!response.ok) {
          throw new Error(
            `API Error: ${response.status} ${response.statusText}`,
          );
        }

        return await response.json();
      } catch (error) {
        const errorMessage = error.message || "Ismeretlen hiba történt";
        onError?.(errorMessage);
        console.error("API Error:", error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiUrl, onError],
  );

  return { fetchData, loading };
};

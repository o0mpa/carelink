// // api.ts
// const BASE_URL = 'http://localhost:5000'; // Your Express Port

// export const fetchData = async (endpoint: string) => {
//   try {
//     const response = await fetch(`${BASE_URL}${endpoint}`);
//     if (!response.ok) throw new Error('Network response was not ok');
//     return await response.json();
//   } catch (error) {
//     console.error("Fetch error:", error);
//     throw error;
//   }
// };
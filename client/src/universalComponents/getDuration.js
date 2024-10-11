// lib/getDuration.js
export const getDuration = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const durationInMillis = endDate - startDate;

  const seconds = Math.floor((durationInMillis / 1000) % 60);
  const minutes = Math.floor((durationInMillis / (1000 * 60)) % 60);
  const hours = Math.floor((durationInMillis / (1000 * 60 * 60)) % 24);
  const days = Math.floor(durationInMillis / (1000 * 60 * 60 * 24));

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

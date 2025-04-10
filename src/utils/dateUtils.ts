export const isUpcomingEvent = (date: string) => {
  return new Date(date) > new Date();
};

export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
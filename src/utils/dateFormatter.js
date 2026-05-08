export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  // Day
  const day = String(date.getDate()).padStart(2, '0');
  // Month (0-indexed)
  const month = String(date.getMonth() + 1).padStart(2, '0');
  // Year
  const year = date.getFullYear();
  
  // Hours
  let hours = date.getHours();
  // Minutes
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  // AM/PM
  const ampm = hours >= 12 ? 'pm' : 'am';
  
  // Convert to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const formattedHours = String(hours).padStart(2, '0');
  
  return `${day}/${month}/${year} ${formattedHours}:${minutes} ${ampm}`;
};

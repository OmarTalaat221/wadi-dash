


const formattedDate = (date = new Date()) => {
  if (!(date instanceof Date) || isNaN(date)) return "Invalid Date"; // Handle invalid date
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
   });
  };

export default formattedDate;

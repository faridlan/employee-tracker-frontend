function getMonthName(month?: number): string {
  if (!month || month < 1 || month > 12) return "—";
  const names = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return names[month - 1];
}

export default getMonthName;

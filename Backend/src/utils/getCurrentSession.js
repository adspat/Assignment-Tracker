export const getCurrentSession = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0 = Jan, 6 = July

  if (month >= 6) {
    // July to December
    return `${year}-${(year + 1).toString().slice(-2)}`;
  } else {
    // January to June
    return `${year - 1}-${year.toString().slice(-2)}`;
  }
};
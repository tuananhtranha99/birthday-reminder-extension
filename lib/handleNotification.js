export const isBirthdayComing = (info) => {
  var birthDate = info.birthDate.split("-");
  // Get the current date
  const currentDate = new Date();

  // Get the birthdate for the current year
  const birthdateThisYear = new Date(
    currentDate.getFullYear(),
    birthDate[1] - 1,
    birthDate[2]
  );

  // Calculate the time difference between the current date and the upcoming birthday
  const timeDiff = birthdateThisYear - currentDate;

  // Convert the time difference to days
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  // Check if the upcoming birthday is within 7 days
  if (daysDiff >= 0 && daysDiff <= 7) {
    return true;
  } else {
    return false;
  }
};

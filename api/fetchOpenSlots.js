import { handleNotification } from "../lib/handleNotification.js";

export const fetchOpenSlots = (result) => {
  const { locationId, startDate, endDate } = result;
  const appointmentUrl = `https://ttp.cbp.dhs.gov/schedulerapi/locations/${locationId}/slots?startTimestamp=${startDate}T00:00:00&endTimestamp=${endDate}T00:00:00`;
  fetch(appointmentUrl)
    .then((response) => response.json())
    .then((data) => data.filter((slot) => slot.active > 0))
    .then((data) => handleNotification(data))
    .catch((error) => {
      console.log(error);
    });
};

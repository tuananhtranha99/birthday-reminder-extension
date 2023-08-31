const BIRTHDAY_ALARM = "BIRTHDAY_ALARM";
const RESET_STATUS_ALARM = "RESET_STATUS_ALARM";
const AUTO_BACKUP_ALARM = "AUTO_BACKUP_ALARM";

chrome.runtime.onInstalled.addListener(() => {
  handleOnStop();
});

chrome.runtime.onMessage.addListener((data) => {
  const { event, newInfo, infos } = data;
  switch (event) {
    case "onStop":
      handleOnStop();
      break;
    case "onSave":
      handleOnSave(newInfo, infos);
      break;
    case "onImport":
      createAlarm(BIRTHDAY_ALARM, 1.0);
      break;
    default:
      break;
  }
});

const handleOnStop = () => {
  stopAlarm();
  chrome.storage.local.clear();
};

const handleOnSave = (newInfo, infos) => {
  infos.push(newInfo);
  chrome.storage.local.set({ infos });
  createAlarm(BIRTHDAY_ALARM, 1.0);
};

const createAlarm = (alarmName, interval) => {
  chrome.alarms.get(alarmName, (existingAlarm) => {
    if (!existingAlarm) {
      chrome.alarms.create(alarmName, { periodInMinutes: interval });
    }
  });
};

createAlarm(RESET_STATUS_ALARM, 1440.0);

const stopAlarm = () => {
  chrome.alarms.clearAll();
};

chrome.alarms.onAlarm.addListener((alarm) => {
  chrome.storage.local.get(["infos"], ({ infos }) => {
    if (!infos || infos.length === 0) return;

    if (BIRTHDAY_ALARM === alarm.name) {
      handleBirthdayAlarm(infos);
    } else if (
      RESET_STATUS_ALARM === alarm.name ||
      AUTO_BACKUP_ALARM === alarm.name
    ) {
      resetStatus(infos);
    }
  });
});

const resetStatus = (infos) => {
  if (!infos || infos.length === 0) return;

  const updatedInfos = infos.map((info) =>
    !isActive(info) ? { ...info, status: 1 } : info
  );
  chrome.storage.local.set({ infos: updatedInfos });
};

const handleBirthdayAlarm = (infos) => {
  const filteredItems = infos.filter(
    (info) => isBirthdayComing(info) && isActive(info)
  );

  if (filteredItems.length > 0) {
    createNotification(filteredItems[0], filteredItems);
  }
};

let fbLink = "";
const createNotification = (activeAppointment, birthdayList) => {
  console.log("Jump into createNotification", activeAppointment);
  // fbLink = activeAppointment.fbLink;
  // const { name, birthDate } = activeAppointment;
  // const formattedDate = birthDate.replaceAll("-", "/");
  const message = `There ${birthdayList.length > 1 ? "are" : "is"} ${
    birthdayList.length
  } incoming ${birthdayList.length > 1 ? "birthdays" : "birthday"}:`;
  const items = birthdayList.map((b) => {
    return { title: b.name, message: b.birthDate.replaceAll("-", "/") };
  });

  chrome.notifications.create({
    type: "list",
    title: message,
    message: "",
    priority: 1,
    items: items,
    iconUrl: "./images/thumbnail/icon-48.png",
  });
};

const isBirthdayComing = (info) => {
  const birthDate = new Date(info.birthDate);
  const currentDate = new Date();
  birthDate.setFullYear(currentDate.getFullYear());
  const timeDiff = birthDate - currentDate;
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  return daysDiff >= 0 && daysDiff <= 7;
};

const isActive = (info) => {
  return info.status == 1;
};

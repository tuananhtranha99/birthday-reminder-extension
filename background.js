const BIRTHDAY_ALARM = "BIRTHDAY_ALARM";
const RESET_STATUS_ALARM = "RESET_STATUS_ALARM";
const AUTO_BACKUP_ALARM = "AUTO_BACKUP_ALARM";

chrome.runtime.onInstalled.addListener((details) => {
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
  chrome.storage.local.set({ infos: infos });
  createAlarm(BIRTHDAY_ALARM, 60.0);
};

const createAlarm = (alarmName, interval) => {
  chrome.alarms.get(alarmName, (existingAlarm) => {
    if (!existingAlarm) {
      chrome.alarms.create(alarmName, { periodInMinutes: interval });
    }
  });
};

createAlarm(RESET_STATUS_ALARM, 1440.0);
// createAlarm(AUTO_BACKUP_ALARM, 2.0);

const stopAlarm = () => {
  chrome.alarms.clearAll();
};

chrome.alarms.onAlarm.addListener((alarm) => {
  if (BIRTHDAY_ALARM == alarm.name) {
    chrome.storage.local.get(["infos"], (result) => {
      const { infos } = result;
      if (infos && infos.length > 0) {
        handleNotification(infos);
      }
    });
  } else if (RESET_STATUS_ALARM == alarm.name) {
    chrome.storage.local.get(["infos"], (result) => {
      const { infos } = result;
      resetStatus(infos);
    });
  } else if (AUTO_BACKUP_ALARM == alarm.name) {
    chrome.storage.local.get(["infos"], (result) => {
      const { infos } = result;
      resetStatus(infos);
    });
  }
});

// writeFile();

const resetStatus = (infos) => {
  if (!infos || infos.length == 0) return;
  infos.forEach((info) => {
    if (!isActive(info)) {
      info.status = 1;
    }
  });
  chrome.storage.local.set({ infos: infos });
};

const backupToFile = () => {
  if (!infos || infos.length == 0) return;
  infos.forEach((info) => {
    if (!isActive(info)) {
      info.status = 1;
    }
  });
};

const handleNotification = (infos) => {
  if (infos.length > 0) {
    const filteredItems = infos.filter(
      (info) => isBirthdayComing(info) && isActive(info)
    );
    console.log("filteredItems: ", filteredItems);
    if (filteredItems.length > 0)
      createNotification(filteredItems[0], filteredItems.length - 1);
  }
};

let fbLink;
const createNotification = (activeAppointment) => {
  chrome.notifications.create({
    type: "basic",
    title: "There will have a birthday soon!",
    message: `${
      activeAppointment.name
    }'s birthday - ${activeAppointment.birthDate.replaceAll(
      "-",
      "/"
    )} is coming. Let's prepare something for this lovely one`,
    iconUrl: "./images/icon-48.png",
  });
  fbLink = activeAppointment.fbLink;
};

chrome.notifications.onClicked.addListener(() => {
  chrome.tabs.create({ url: fbLink });
  chrome.storage.local.get(["infos"], (result) => {
    const { infos } = result;
    if (infos && infos.length > 0) {
      infos.find((info) => info.fbLink == fbLink).status = 0;
      chrome.storage.local.set({ infos: infos });
    }
  });
});

const isBirthdayComing = (info) => {
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

const isActive = (info) => {
  return info.status == 1;
};

const nameInput = document.getElementById("nameInput");
const birthDateInput = document.getElementById("birthDate");
const fbLinkInput = document.getElementById("fbLinkInput");

const saveInfoButton = document.getElementById("saveInfoButton");

const nameInputError = document.getElementById("nameInputError");
const birthDateError = document.getElementById("birthDateError");
const fbError = document.getElementById("fbError");

let cachedInfos;

const hideElement = (elem) => {
  elem.style.display = "none";
};

const showElement = (elem) => {
  elem.style.display = "";
};

const disableElement = (elem) => {
  elem.disabled = true;
};

const enableElement = (elem) => {
  elem.disabled = false;
};

const validateStartDate = () => {
  if (!birthDateInput.value) {
    showDateError(birthDateError, "Oops, you forgot to enter birth date");
  } else {
    hideElement(birthDateError);
  }
  return birthDateInput.value;
};

const validateEndDate = () => {
  if (!fbLinkInput.value) {
    showDateError(fbError, "Oh no! You haven't entered a facebook url");
  } else {
    hideElement(fbError);
  }
  return fbLinkInput.value;
};

const showDateError = (dateErrorElem, errorMessage) => {
  dateErrorElem.innerHTML = errorMessage;
  showElement(dateErrorElem);
};

const validateDates = () => {
  const isStartDateValid = validateStartDate();
  const isEndDateValid = validateEndDate();

  return isStartDateValid && isEndDateValid;
};

const performOnStartValidations = () => {
  const isDateValid = validateDates();
  if (!nameInput.value) {
    showElement(nameInputError);
  } else {
    hideElement(nameInputError);
  }
  return nameInput.value && isDateValid;
};

const isExistInList = (fbLink) => {
  getInfos();
  return cachedInfos.find((currentInfo) => currentInfo.fbLink == fbLink) ==
    undefined
    ? false
    : true;
};

saveInfoButton.onclick = () => {
  const allFieldsValid = performOnStartValidations();
  const isExist = isExistInList(fbLinkInput.value);
  if (!allFieldsValid) {
    return;
  }
  if (isExist) {
    showDangerToast();
    return;
  }
  const newInfo = {
    name: nameInput.value,
    birthDate: birthDateInput.value,
    fbLink: fbLinkInput.value,
    status: 1,
  };

  chrome.runtime.sendMessage({
    event: "onSave",
    newInfo: newInfo,
    infos: cachedInfos,
  });
  showSuccessToast();
  nameInput.value = "";
  birthDateInput.value = "";
  fbLinkInput.value = "";
};

const getInfos = () => {
  chrome.storage.local.get(["infos"], (result) => {
    const { infos } = result;

    if (infos && infos.length > 0) {
      cachedInfos = infos;
    } else {
      cachedInfos = [];
    }
  });
};

getInfos();

const showSuccessToast = () => {
  bulmaToast.toast({
    message: "🐱 Add successfully!",
    duration: 2000,
    type: "is-success",
    pauseOnHover: true,
    animate: { in: "fadeIn", out: "fadeOut" },
  });
};

const showDangerToast = () => {
  bulmaToast.toast({
    message: "🐵 This person is already existed",
    duration: 2000,
    type: "is-danger",
    pauseOnHover: true,
    animate: { in: "fadeIn", out: "fadeOut" },
  });
};

const today = spacetime.now().startOf("day").format();
birthDateInput.setAttribute("max", today);

import { isBirthdayComing } from "../lib/handleNotification.js";
const nameInput = document.getElementById("nameInput");
const birthDateInput = document.getElementById("birthDate");
const fbLinkInput = document.getElementById("fbLinkInput");

const saveInfoButton = document.getElementById("saveInfoButton");

const nameInputError = document.getElementById("nameInputError");
const birthDateError = document.getElementById("birthDateError");
const fbError = document.getElementById("fbError");

const warningIcon = document.getElementById("warning-icon");
const warningTooltip = document.getElementById("warningTooltip");
const badge = document.getElementById("badge");

let cachedInfos = [];

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
  const isEmpty = !birthDateInput.value;
  showErrorOrHide(
    birthDateError,
    isEmpty,
    "Oops, you forgot to enter birth date"
  );
  return !isEmpty ? birthDateInput.value : "";
};

const validateEndDate = () => {
  const isEmpty = !fbLinkInput.value;
  const isInvalid = !isEmpty && !isFacebookURL(fbLinkInput.value);
  showErrorOrHide(
    fbError,
    isEmpty || isInvalid,
    isInvalid
      ? "Oh no! The URL you are entering is not a facebook url!"
      : "Oh no! You haven't entered a facebook url"
  );
  return !isEmpty && !isInvalid ? fbLinkInput.value : "";
};

const showErrorOrHide = (errorElem, condition, errorMessage) => {
  if (condition) {
    errorElem.innerHTML = errorMessage;
    showElement(errorElem);
  } else {
    hideElement(errorElem);
  }
};

const validateDates = () => {
  const isStartDateValid = validateStartDate();
  const isEndDateValid = validateEndDate();

  return isStartDateValid && isEndDateValid;
};

const performOnStartValidations = () => {
  const isDateValid = validateDates();
  showErrorOrHide(
    nameInputError,
    !nameInput.value,
    "Ah shiet, you don't know their name"
  );
  return !!nameInput.value && isDateValid;
};

const isExistInList = (fbLink) => {
  return cachedInfos.some((currentInfo) => currentInfo.fbLink === fbLink);
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
  window.location.href = `popup.html?type=${SUCCESS_ADD}`;
};

var type = null;
const SUCCESS_ADD = "addSuccessfully";
document.addEventListener("DOMContentLoaded", (event) => {
  const parameters = new URLSearchParams(window.location.search);
  type = parameters.get("type");
  event.preventDefault();
  getInfos();
});

const getInfos = () => {
  if (type === SUCCESS_ADD) {
    showSuccessToast();
  }
  chrome.storage.local.get(["infos"], ({ infos }) => {
    cachedInfos = infos || [];
    let numberIncoming = cachedInfos.filter(
      (info) => isActive(info) && isBirthdayComing(info)
    ).length;
    warningTooltip.textContent = `${numberIncoming} birthdays are coming!!!`;
    badge.textContent = `${numberIncoming}`;
    if (numberIncoming == 0) {
      warningIcon.src = "../images/notification/success.gif";
      badge.style.backgroundColor = "green";
    }
  });
};

const showSuccessToast = () =>
  showNotificationToast("🐱 Add successfully!", "is-success");
const showDangerToast = () =>
  showNotificationToast("🐵 This person is already existed", "is-danger");

const showNotificationToast = (message, type) => {
  bulmaToast.toast({
    message,
    duration: 2000,
    type,
    pauseOnHover: true,
    animate: { in: "fadeIn", out: "fadeOut" },
  });
};

const isFacebookURL = (inputURL) =>
  /^https?:\/\/(www\.)?(facebook\.com|fb\.com)/.test(inputURL);

const today = spacetime.now().startOf("day").format();
birthDateInput.setAttribute("max", today);

warningIcon.onclick = () => {
  window.location.href = "birthday-list.html?type=onlyComingBirthdays";
};

const isActive = (info) => {
  return info.status == 1;
};

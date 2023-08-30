const nameInput = document.getElementById("nameInput");
const birthDateInput = document.getElementById("birthDate");
const fbLinkInput = document.getElementById("fbLinkInput");

const saveInfoButton = document.getElementById("saveInfoButton");

const nameInputError = document.getElementById("nameInputError");
const birthDateError = document.getElementById("birthDateError");
const fbError = document.getElementById("fbError");

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
  showSuccessToast();
  nameInput.value = "";
  birthDateInput.value = "";
  fbLinkInput.value = "";
};

const getInfos = () => {
  chrome.storage.local.get(["infos"], ({ infos }) => {
    cachedInfos = infos || [];
  });
};

getInfos();

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

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
    showDateError(birthDateError, "Please enter a valid start date");
  } else {
    hideElement(birthDateError);
  }
  return birthDateInput.value;
};

const validateEndDate = () => {
  if (!fbLinkInput.value) {
    showDateError(fbError, "Please enter a valid end date");
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
  const today = spacetime.now().startOf("day");

  const startDate = spacetime(birthDateInput.value).startOf("day");

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

saveInfoButton.onclick = () => {
  const allFieldsValid = performOnStartValidations();
  if (allFieldsValid) {
    const newInfo = {
      name: nameInput.value,
      birthDate: birthDateInput.value,
      fbLink: fbLinkInput.value,
      //   tzData:
      //     nameInput.options[nameInput.selectedIndex].getAttribute("data-tz"),
    };
    chrome.runtime.sendMessage({
      event: "onSave",
      newInfo: newInfo,
      infos: cachedInfos,
    });
  }
};

chrome.storage.local.get(["infos"], (result) => {
  const { infos } = result;

  if (infos && infos.length > 0) {
    cachedInfos = infos;
  } else {
    cachedInfos = [];
  }
});

// const setLocations = (locations) => {
//   locations.forEach((location) => {
//     let optionElement = document.createElement("option");
//     optionElement.value = location.id;
//     optionElement.innerHTML = location.name;
//     optionElement.setAttribute("data-tz", location.tzData);
//     nameInput.appendChild(optionElement);
//   });
// };

const today = spacetime.now().startOf("day").format();
birthDateInput.setAttribute("max", today);

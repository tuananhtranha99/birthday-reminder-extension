import { isBirthdayComing } from "../lib/handleNotification.js";

const tableBody = document.getElementById("tableBody");
const exportBtn = document.getElementById("exportBtn");

let isActiveTitle = "One important birthday is coming !!!!";
let isInactiveTitle =
  "You already said happy birthday to this lovely person. Hurray!";

const generateHTML = () => {
  chrome.storage.local.get(["infos"], (result) => {
    let { infos } = result;
    let populatedList;

    if (isEmptyList(infos)) {
      exportBtn.disabled = true;
      return;
    }
    if (type === COMING_BIRTHDAY) {
      populatedList = infos.filter(
        (info) => isActive(info) && isBirthdayComing(info)
      );
    } else {
      populatedList = infos;
    }
    let map = convertObjectToOrderedMap(
      groupBy(populatedList, (info) => info.birthDate.split("-")[1]) // group birth dates by month
    );

    populateDataFromMap(map, populatedList);
  });
};

generateHTML();

const isEmptyList = (list) => {
  return !list || list.length == 0;
};

const convertObjectToOrderedMap = (object) => {
  return new Map([...Object.entries(object)].sort());
};

const groupBy = (x, f) =>
  x.reduce((a, b, i) => ((a[f(b, i, x)] ||= []).push(b), a), {});

const populateDataFromMap = (map, allBirthdays) => {
  map.forEach((birthDaysByMonth, month) => {
    let trElement = document.createElement("tr");

    handleMonthTitle(month, trElement, tableBody);

    handleBirthdaysByMonth(
      birthDaysByMonth.sort((a, b) =>
        new Date(a.birthDate).getDate() > new Date(b.birthDate).getDate()
          ? 1
          : -1
      ),
      allBirthdays
    );
  });
};

const handleMonthTitle = (month, relatedTrElement, relatedTable) => {
  let monthData = getMonth(month); //Example: monthData = [January, ../images/january.jpg, color-white text-right]
  let tdForMonth = createElementWithAttribute(
    "td",
    monthData[0],
    [["colspan", 5]],
    relatedTrElement
  );
  tdForMonth.className = `tdMonth ${monthData[2]}`;
  tdForMonth.style.backgroundImage = `url(${monthData[1]})`;
  relatedTable.appendChild(relatedTrElement);
};

// according to the birthday's month to show title - background - and some formats
const getMonth = (month) => {
  switch (month) {
    case "01":
      return [
        "January",
        "../images/month-background/january.jpg",
        "color-white text-right",
      ];
    case "02":
      return ["February", "../images/month-background/february.jpg", ""];
    case "03":
      return ["March", "../images/month-background/march.jpg", "text-right"];
    case "04":
      return ["April", "../images/month-background/april.jpg", ""];
    case "05":
      return [
        "May",
        "../images/month-background/may.avif",
        "color-white text-right",
      ];
    case "06":
      return ["June", "../images/month-background/june.png", ""];
    case "07":
      return [
        "July",
        "../images/month-background/july.png",
        "color-white text-right",
      ];
    case "08":
      return ["August", "../images/month-background/august.avif", ""];
    case "09":
      return [
        "September",
        "../images/month-background/september.webp",
        "color-white text-right",
      ];
    case "10":
      return [
        "October",
        "../images/month-background/october.jpg",
        "color-white",
      ];
    case "11":
      return [
        "November",
        "../images/month-background/november.jpg",
        "color-white text-right",
      ];
    case "12":
      return [
        "December",
        "../images/month-background/december.jpg",
        "color-white",
      ];
  }
};

const handleBirthdaysByMonth = (infosInMonth, allInfos) => {
  let i = 0;
  while (i < infosInMonth.length) {
    let info = infosInMonth[i];
    let trElement = document.createElement("tr");
    createElementWithoutAttribute("td", i + 1, trElement);

    const tdForName = createElementWithoutAttribute("td", "", trElement);
    createElementWithAttribute(
      "span",
      info.name,
      [["id", "nameSpan-" + info.fbLink]],
      tdForName
    );
    const nameInput = createElementWithAttribute(
      "input",
      "",
      [
        ["value", info.name],
        ["id", "nameInput-" + info.fbLink],
      ],
      tdForName
    );
    setStyleForElement(nameInput, "display", "none");

    const tdForBirthdate = createElementWithoutAttribute("td", "", trElement);
    createElementWithAttribute(
      "span",
      info.birthDate,
      [["id", "birthdateSpan-" + info.fbLink]],
      tdForBirthdate
    );
    const birthdateInput = createElementWithAttribute(
      "input",
      "",
      [
        ["value", info.birthDate],
        ["type", "date"],
        ["id", "birthdateInput-" + info.fbLink],
      ],
      tdForBirthdate
    );
    setStyleForElement(birthdateInput, "display", "none");

    handleTdTagForFacebookUrl(info, trElement);
    handleTdTagForOption(info, allInfos, trElement);

    if (!isActive(info)) {
      setClassForElement(trElement, "inActive");
    }
    tableBody.appendChild(trElement);
    i++;
  }
};

const handleTdTagForFacebookUrl = (personalInfo, relatedTrElement) => {
  let tdForFbLink = createElementWithoutAttribute("td", "", relatedTrElement);
  setStyleForElement(tdForFbLink, "maxWidth", "200px");

  tdForFbLink.onclick = () => {
    chrome.tabs.create({ url: personalInfo.fbLink });
  };

  const aTagForFbUrl = createElementWithAttribute(
    "a",
    personalInfo.fbLink,
    [["href", personalInfo.fbLink]],
    tdForFbLink
  );
  setClassForElement(aTagForFbUrl, "aElement");
};

const handleTdTagForOption = (personalInfo, allBirthdays, relatedTrElement) => {
  let tdElement = createElementWithoutAttribute("td", "", relatedTrElement);

  if (!isActive(personalInfo)) {
    showFinishedIcon(personalInfo, tdElement, allBirthdays);
  } else if (isActive(personalInfo) && isBirthdayComing(personalInfo)) {
    showUnfinishedIcon(personalInfo, tdElement, allBirthdays);
  }
  showDeleteIcon(personalInfo, tdElement, allBirthdays);
  showEditIcon(personalInfo, tdElement, allBirthdays);
  createSaveIconForUpdate(personalInfo, tdElement, allBirthdays);
};

const createSaveIconForUpdate = (
  personalInfo,
  relatedTdElement,
  allBirthdays
) => {
  let saveButton = createElementWithAttribute(
    "img",
    "",
    [
      ["src", "../images/save-icons/static-saveIcon.png"],
      ["title", "Save"],
    ],
    relatedTdElement
  );
  setStyleForElement(saveButton, "width", "22px");
  setStyleForElement(saveButton, "cursor", "pointer");
  setStyleForElement(saveButton, "display", "none");
  setAttributeForElement(
    saveButton,
    "id",
    "saveAfterEdit-" + personalInfo.fbLink
  );
  saveButton.onclick = () => {
    const editButton = document.getElementById("edit-" + personalInfo.fbLink);
    setStyleForElement(editButton, "display", "inline-block");
    setStyleForElement(saveButton, "display", "none");
    const nameSpan = document.getElementById("nameSpan-" + personalInfo.fbLink);
    const nameInput = document.getElementById(
      "nameInput-" + personalInfo.fbLink
    );
    setStyleForElement(nameInput, "display", "none");
    setStyleForElement(nameSpan, "display", "inline-block");
    const deleteButton = document.getElementById(
      "deleteIcon-" + personalInfo.fbLink
    );
    setStyleForElement(deleteButton, "display", "inline-block");
    const birthdateInput = document.getElementById(
      "birthdateInput-" + personalInfo.fbLink
    );
    setStyleForElement(birthdateInput, "display", "none");
    const birthdateSpan = document.getElementById(
      "birthdateSpan-" + personalInfo.fbLink
    );
    setStyleForElement(birthdateSpan, "display", "inline-block");
    nameSpan.textContent = nameInput.value;
    birthdateSpan.textContent = birthdateInput.value;
  };
  saveButton.onmouseover = () => {
    setAttributeForElement(
      saveButton,
      "src",
      "../images/save-icons/animated-saveIcon.gif"
    );
  };
  saveButton.onmouseleave = () => {
    setAttributeForElement(
      saveButton,
      "src",
      "../images/save-icons/static-saveIcon.png"
    );
  };
};

const showEditIcon = (personalInfo, relatedTdElement, allBirthdays) => {
  let editButton = createElementWithAttribute(
    "img",
    "",
    [["src", "../images/editIcon.png"]],
    relatedTdElement
  );
  setStyleForElement(editButton, "width", "22px");
  setStyleForElement(editButton, "cursor", "pointer");
  setAttributeForElement(editButton, "id", "edit-" + personalInfo.fbLink);
  editButton.onclick = () => {
    const saveButton = document.getElementById(
      "saveAfterEdit-" + personalInfo.fbLink
    );
    const nameSpan = document.getElementById("nameSpan-" + personalInfo.fbLink);
    const nameInput = document.getElementById(
      "nameInput-" + personalInfo.fbLink
    );
    const deleteButton = document.getElementById(
      "deleteIcon-" + personalInfo.fbLink
    );
    const birthdateInput = document.getElementById(
      "birthdateInput-" + personalInfo.fbLink
    );
    const birthdateSpan = document.getElementById(
      "birthdateSpan-" + personalInfo.fbLink
    );
    setStyleForElement(nameInput, "display", "inline-block");
    setStyleForElement(birthdateInput, "display", "inline-block");
    setStyleForElement(saveButton, "display", "inline-block");

    setStyleForElement(nameSpan, "display", "none");
    setStyleForElement(birthdateSpan, "display", "none");
    setStyleForElement(deleteButton, "display", "none");
    setStyleForElement(editButton, "display", "none");
  };
};

const showDeleteIcon = (personalInfo, relatedTdElement, allBirthdays) => {
  let deleteButton = createElementWithAttribute(
    "img",
    "",
    [
      ["src", "../images/deleteIcon.webp"],
      ["id", "deleteIcon-" + personalInfo.fbLink],
    ],
    relatedTdElement
  );
  setStyleForElement(deleteButton, "width", "22px");
  setStyleForElement(deleteButton, "cursor", "pointer");
  deleteButton.onclick = () => {
    let deleteIndex = allBirthdays.findIndex(
      (item) => item.fbLink == personalInfo.fbLink
    );

    allBirthdays.splice(deleteIndex, 1);
    chrome.storage.local.set({ infos: allBirthdays });
    window.location.reload();
  };
};

const showFinishedIcon = (personalInfo, relatedTdElement, allBirthdays) => {
  let finishIcon = createElementWithAttribute(
    "img",
    "",
    [
      ["src", "../images/finishIcon.png"],
      ["title", isInactiveTitle],
      ["fbLink", personalInfo.fbLink],
    ],
    relatedTdElement
  );
  setStyleForElement(finishIcon, "width", "20px");
  finishIcon.onclick = () => {
    let fbLink = finishIcon.getAttribute("fbLink");
    let selectedPerson = allBirthdays.find((info) => info.fbLink == fbLink);
    selectedPerson.status = 1;
    chrome.storage.local.set({ infos: allBirthdays });
    window.location.reload();
  };
};

const showUnfinishedIcon = (personalInfo, relatedTdElement, allBirthdays) => {
  let imgElement = createElementWithAttribute(
    "img",
    "",
    [
      ["src", "../images/exclamation-0.webp"],
      ["title", isActiveTitle],
      ["fbLink", personalInfo.fbLink],
    ],
    relatedTdElement
  );
  setStyleForElement(imgElement, "width", "20px");

  imgElement.onclick = () => {
    let fbLink = imgElement.getAttribute("fbLink");
    let selectedPerson = allBirthdays.find((info) => info.fbLink == fbLink);
    selectedPerson.status = 0;
    chrome.storage.local.set({ infos: allBirthdays });
    window.location.reload();
  };
};

const isActive = (info) => {
  return info.status == 1;
};

const createElementWithoutAttribute = (tagName, value, parentElement) => {
  let element = document.createElement(tagName);
  element.innerHTML = value;
  parentElement.appendChild(element);
  return element;
};

const createElementWithAttribute = (
  tagName,
  value,
  attributes,
  parentElement
) => {
  let element = document.createElement(tagName);
  element.innerHTML = value;
  attributes.forEach((attribute) => {
    let attributeName = attribute[0];
    let attributeValue = attribute[1];
    element.setAttribute(attributeName, attributeValue);
  });
  parentElement.appendChild(element);
  return element;
};

const setClassForElement = (element, className) => {
  element.className = className;
};

const setStyleForElement = (element, styleName, styleValue) => {
  element.style[styleName] = styleValue;
};

const setAttributeForElement = (element, attributeName, attributeValue) => {
  element.setAttribute(attributeName, attributeValue);
};

//function to use when import a file
const fileSelector = document.getElementById("fileUpload");
fileSelector.addEventListener("change", (event) => {
  const file = event.target.files[0];
  var fr = new FileReader();
  fr.readAsText(file);
  fr.onload = () => {
    chrome.storage.local.get(["infos"], (result) => {
      let { infos } = result;
      if (!infos) {
        infos = JSON.parse(fr.result);
      } else {
        infos = [...infos, ...JSON.parse(fr.result)];
      }
      chrome.storage.local.set({ infos: infos });
      chrome.runtime.sendMessage({
        event: "onImport",
      });
    });
  };
  window.location.reload();
});

document.getElementById("importBtn").onclick = () => {
  fileSelector.click();
};

exportBtn.onclick = () => {
  exportFile();
};

const exportFile = () => {
  chrome.storage.local.get(["infos"], (result) => {
    let { infos } = result;
    if (!infos || infos.length == 0) {
      return;
    }
    const link = document.createElement("a");
    const file = new Blob([JSON.stringify(infos)], { type: "text/plain" });
    link.href = URL.createObjectURL(file);
    link.download = "Export-Birthday.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  });
};

var type = null;
const COMING_BIRTHDAY = "onlyComingBirthdays";
document.addEventListener("DOMContentLoaded", (event) => {
  const parameters = new URLSearchParams(window.location.search);
  type = parameters.get("type");
  console.log("type", type);
  event.preventDefault();
});


thêm mấy dòng lỗi vào để test cherry pick

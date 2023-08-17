import { isBirthdayComing } from "../lib/handleNotification.js";

const tableBody = document.getElementById("tableBody");
const exportBtn = document.getElementById("exportBtn");

let isActiveTitle = "One important birthday is coming !!!!";
let isInactiveTitle =
  "You already said happy birthday to this lovely person. Hurray!";

const getInfos = () => {
  chrome.storage.local.get(["infos"], (result) => {
    let { infos } = result;

    if (isEmptyList(infos)) {
      exportBtn.disabled = true;
      return;
    }
    let map = convertObjectToOrderedMap(
      groupBy(infos, (info) => info.birthDate.split("-")[1]) // group birth dates by month
    );

    populateDataFromMap(map, infos);
  });
};
getInfos();

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
      return ["January", "../images/january.jpg", "color-white text-right"];
    case "02":
      return ["February", "../images/february.jpg", ""];
    case "03":
      return ["March", "../images/march.jpg", "text-right"];
    case "04":
      return ["April", "../images/april.jpg", ""];
    case "05":
      return ["May", "../images/may.avif", "color-white text-right"];
    case "06":
      return ["June", "../images/june.png", ""];
    case "07":
      return ["July", "../images/july.png", "color-white text-right"];
    case "08":
      return ["August", "../images/august.avif", ""];
    case "09":
      return [
        "September",
        "../images/september.webp",
        "color-white text-right",
      ];
    case "10":
      return ["October", "../images/october.jpg", "color-white"];
    case "11":
      return ["November", "../images/november.jpg", "color-white text-right"];
    case "12":
      return ["December", "../images/december.jpg", "color-white"];
  }
};

const handleBirthdaysByMonth = (infosInMonth, allInfos) => {
  let i = 0;
  while (i < infosInMonth.length) {
    let info = infosInMonth[i];
    let trElement = document.createElement("tr");
    createElementWithoutAttribute("td", i + 1, trElement);
    createElementWithoutAttribute("td", info.name, trElement);
    createElementWithoutAttribute("td", info.birthDate, trElement);
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
};

const showDeleteIcon = (personalInfo, relatedTdElement, allBirthdays) => {
  let deleteButton = createElementWithAttribute(
    "img",
    "",
    [["src", "../images/deleteIcon.webp"]],
    relatedTdElement
  );
  setStyleForElement(deleteButton, "width", "22px");
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

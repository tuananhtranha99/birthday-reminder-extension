import { isBirthdayComing } from "../lib/handleNotification.js";

const tableBody = document.getElementById("tableBody");

let isActiveTitle = "One important birthday is coming !!!!";
let isInactiveTitle =
  "You already said happy birthday to this lovely person. Hurray!";

const getInfos = () => {
  chrome.storage.local.get(["infos"], (result) => {
    let { infos } = result;

    if (!infos || infos.length == 0) {
      document.getElementById("exportBtn").disabled = true;
      return;
    }
    let map = new Map(
      [
        ...Object.entries(
          groupBy(infos, (info) => info.birthDate.split("-")[1])
        ),
      ].sort()
    );
    map.forEach((value, key) => {
      let trElement = document.createElement("tr");

      let monthData = getMonth(key);
      let tdForMonth = createElementWithAttribute(
        "td",
        monthData[0],
        [["colspan", 5]],
        trElement
      );
      tdForMonth.className = `tdMonth ${monthData[2]}`;
      tdForMonth.style.backgroundImage = `url(${monthData[1]})`;
      tableBody.appendChild(trElement);

      populateDataByMonth(
        value.sort((a, b) =>
          new Date(a.birthDate).getDate() > new Date(b.birthDate).getDate()
            ? 1
            : -1
        ),
        infos
      );
    });
  });
};

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

const populateDataByMonth = (infosInMonth, allInfos) => {
  let i = 0;
  while (i < infosInMonth.length) {
    let info = infosInMonth[i];
    let trElement = document.createElement("tr");
    createElementWithoutAttribute("td", i + 1, trElement);
    createElementWithoutAttribute("td", info.name, trElement);
    createElementWithoutAttribute("td", info.birthDate, trElement);

    let tdForFbLink = createElementWithoutAttribute("td", "", trElement);
    tdForFbLink.style.maxWidth = "200px";
    tdForFbLink.onclick = () => {
      chrome.tabs.create({ url: info.fbLink });
    };

    createElementWithAttribute(
      "a",
      info.fbLink,
      [["href", info.fbLink]],
      tdForFbLink
    ).className = "aElement";

    let tdElement = createElementWithoutAttribute("td", "", trElement);

    if (info.status != 1) {
      let finishIcon = createElementWithAttribute(
        "img",
        "",
        [
          ["src", "../images/finishIcon.png"],
          ["title", isInactiveTitle],
          ["fbLink", info.fbLink],
        ],
        tdElement
      );
      finishIcon.style.width = "20px";
      finishIcon.onclick = () => {
        let fbLink = finishIcon.getAttribute("fbLink");
        let selectedPerson = infos.find((info) => info.fbLink == fbLink);
        selectedPerson.status = 1;
        chrome.storage.local.set({ infos: infos });
        window.location.reload();
      };
      setClassForElement(trElement, "inActive");
    } else if (info.status == 1 && isBirthdayComing(info)) {
      let imgElement = createElementWithAttribute(
        "img",
        "",
        [
          ["src", "../images/exclamation-0.webp"],
          ["title", isActiveTitle],
          ["fbLink", info.fbLink],
        ],
        tdElement
      );
      imgElement.style.width = "20px";

      imgElement.onclick = () => {
        let fbLink = imgElement.getAttribute("fbLink");
        let selectedPerson = infos.find((info) => info.fbLink == fbLink);
        selectedPerson.status = 0;
        chrome.storage.local.set({ infos: infos });
        window.location.reload();
      };
    }

    let deleteButton = createElementWithAttribute(
      "img",
      "",
      [["src", "../images/deleteIcon.webp"]],
      tdElement
    );
    deleteButton.style.width = "22px";
    deleteButton.onclick = () => {
      let deleteIndex = allInfos.findIndex(
        (item) => item.fbLink == info.fbLink
      );

      allInfos.splice(deleteIndex, 1);
      chrome.storage.local.set({ infos: allInfos });
      window.location.reload();
    };
    tableBody.appendChild(trElement);
    i++;
  }
};

getInfos();

const groupBy = (x, f) =>
  x.reduce((a, b, i) => ((a[f(b, i, x)] ||= []).push(b), a), {});

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

document.getElementById("exportBtn").onclick = () => {
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

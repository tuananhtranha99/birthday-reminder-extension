const tableBody = document.getElementById("tableBody");

let isActiveIcon = "😅";
let isActiveTitle = "You haven't said happy birthday to this lovely person";
let isInactiveIcon = "😄";
let isInactiveTitle =
  "You already said happy birthday to this lovely person. Hurray!";

const getInfos = () => {
  chrome.storage.local.get(["infos"], (result) => {
    let { infos } = result;

    if (!infos || infos.length == 0) {
      document.getElementById("exportBtn").disabled = true;
      return;
    }
    let i = 0;
    while (i < infos.length) {
      let info = infos[i];
      let trElement = document.createElement("tr");
      createElementWithoutAttribute("td", i + 1, trElement);
      createElementWithoutAttribute("td", info.name, trElement);
      createElementWithoutAttribute("td", info.birthDate, trElement);

      let tdForFbLink = createElementWithoutAttribute("td", "", trElement);
      createElementWithAttribute(
        "a",
        info.fbLink,
        [["href", info.fbLink]],
        tdForFbLink
      );
      tdForFbLink.onclick = () => {
        chrome.tabs.create({ url: info.fbLink });
      };

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
      } else {
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
      deleteButton.onclick = (i) => {
        infos.splice(i, 1);
        chrome.storage.local.set({ infos: infos });
        window.location.reload();
      };
      tableBody.appendChild(trElement);
      i++;
    }
  });
};

getInfos();

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
        console.log("what is this: ", infos);
      } else {
        infos = [...infos, ...JSON.parse(fr.result)];
        console.log("what is this2: ", infos);
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

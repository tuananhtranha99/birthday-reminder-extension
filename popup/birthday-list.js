const tableBody = document.getElementById("tableBody");

let isActiveIcon = "😅";
let isActiveTitle = "You haven't said happy birthday to this lovely person";
let isInactiveIcon = "😄";
let isInactiveTitle =
  "You already said happy birthday to this lovely person. Hurray!";
let deleteIcon = "❌";

// let cachedInfos;
chrome.storage.local.get(["infos"], (result) => {
  const { infos } = result;
  // cachedInfos = result;

  if (infos && infos.length > 0) {
    infos.forEach((info, i) => {
      let trElement = document.createElement("tr");
      createElement("td", i + 1, trElement);
      createElement("td", info.name, trElement);
      createElement("td", info.birthDate, trElement);

      let tdForFbLink = createElement("td", "", trElement);
      createElementWithAttribute(
        "a",
        info.fbLink,
        [["href", info.fbLink]],
        tdForFbLink
      );
      tdForFbLink.onclick = () => {
        chrome.tabs.create({ url: info.fbLink });
      };

      let tdElement = createElement("td", "", trElement);

      if (info.status != 1) {
        let spanElement = createElementWithAttribute(
          "span",
          info.status == 1 ? "" : isInactiveIcon,
          [
            ["title", isInactiveTitle],
            ["fbLink", info.fbLink],
          ],
          tdElement
        );
        spanElement.onclick = () => {
          let fbLink = spanElement.getAttribute("fbLink");
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
        [["src", "../images/deleteIcon.jpg"]],
        tdElement
      );
      deleteButton.style.width = "25px";
      deleteButton.onclick = () => {
        infos.splice(i, 1);
      };
      tableBody.appendChild(trElement);
    });
  }
});

const createElement = (tagName, value, parentElement) => {
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

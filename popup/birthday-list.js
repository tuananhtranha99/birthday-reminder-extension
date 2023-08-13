const tableBody = document.getElementById("tableBody");
chrome.storage.local.get(["infos"], (result) => {
  const { infos } = result;

  if (infos && infos.length > 0) {
    infos.forEach((info, i) => {
      let trElement = document.createElement("tr");
      createElement("td", i + 1, trElement);
      createElement("td", info.name, trElement);

      createElementWithAttribute("a", info.fbLink, "href", info.fbLink, trElement);
      createElement("td", info.birthDate, trElement);
      createElement("td", "", trElement);
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
  attributeName,
  attributeValue,
  parentElement
) => {
  let element = document.createElement(tagName);
  element.innerHTML = value;
  element.setAttribute(attributeName, attributeValue),
  parentElement.appendChild(element);
};

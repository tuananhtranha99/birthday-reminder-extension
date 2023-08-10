const tableBody = document.getElementById("tableBody");
chrome.storage.local.get(["infos"], (result) => {
  const { infos } = result;

  if (infos && infos.length > 0) {
    infos.forEach((info, i) => {
      let trElement = document.createElement("tr");
      createTdElement("td", i + 1, trElement);
      createTdElement("td", info.name, trElement);

      createTdElement("a");
      createTdElement("td", info.birthDate, trElement);
      createTdElement("td", info.fbLink, trElement);
      tableBody.appendChild(trElement);
    });
  }
});

const createElement = (tagName, value, parentElement) => {
  let tdElement = document.createElement(tagName);
  tdElement.innerHTML = value;
  parentElement.appendChild(tdElement);
};

const createElementWithAttribute = (
  tagName,
  value,
  attributes,
  parentElement
) => {
  let tdElement = document.createElement(tagName);
  tdElement.innerHTML = value;
  parentElement.appendChild(tdElement);
};

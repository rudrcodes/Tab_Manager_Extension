const tabName = document.getElementById("tabname");
const groupName = document.getElementById("groupname");

const getTabs = document.getElementById("getTabs");
let tabs = [];
getTabs.addEventListener("click", async () => {
  tabs = await chrome.tabs.query({
    url: [
      `https://www.${tabName.value}.com/*`,
      `https://www.${tabName.value}/*`,
      `https://${tabName.value}.com/*`,
      `https://${tabName.value}.org/*`,
    ],
  });
  const tabsUrl = tabs.map((tab) => tab.url);
  console.log("unique tabs: ", new Set(tabs));
  // tabs = [...new Set(tabs)];
  console.log(tabs.length)

  const collator = new Intl.Collator();

  console.log(
    "Tabs: ",
    tabs.map((tab) => tab.url)
  );
  tabs.sort((a, b) => collator.compare(a.title, b.title));

  const tabsMap = new Map();

  const template = document.getElementById("li_template");

  // TODO: Only unique sites show krni h list mein and no duplicate site should be present.

  // console.log("Template: ", template.content);
  // template.innerText = "";
  const elements = new Set();
  for (const tab of tabs) {
    tabsMap.set(tab.url, tab);
    console.log("TabsMap: ", tabsMap);

    const element = template.content.firstElementChild.cloneNode(true);
    if (tab.title === "Page Not Found") continue;
    const title = tab.title.split("-")[0].trim();
    const pathname = new URL(tab.url).pathname.slice("/docs".length) || "/";

    element.querySelector(".title").textContent = title;
    element.querySelector(".pathname").textContent = pathname;
    element.querySelector("a").addEventListener("click", async () => {
      await chrome.tabs.update(tab.id, { active: true });
      await chrome.windows.update(tab.windowId, { focused: true });
    });

    elements.add(element);
  }
  document.querySelector("ul").append(...elements);


});



// Grouping logic
const groupTabsBtn = document.getElementById("groupTabs");

groupTabsBtn.addEventListener("click", async () => {
  const tabIds = tabs.map(({ id }) => id);
  if (tabIds.length) {
    const group = await chrome.tabs.group({ tabIds });
    await chrome.tabGroups.update(group, {
      title: groupName.value.length !== 0 ? groupName.value + " 📁" : "Group 📁 ",
    });
  }
});
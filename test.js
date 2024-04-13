//take the name of the tab to be grouped and also the name of the Group

// Getting the name of the tab to be grouped
const tabName = document.getElementById("tabname");
// console.log("tabName: ", tabName);
const groupName = document.getElementById("groupname");
// console.log("groupName: ", groupName);

const getTabs = document.getElementById("getTabs");
getTabs.addEventListener("click", async () => {
  // console.log("Tabname: ", tabName.value);

  // Set tabs to be an empty array , so that duplicate tabs are not shown in the Tab list
  let tabs = await chrome.tabs.query({
    url: [
      // `https://www.${tabName.value}.com`,
      `https://www.${tabName.value}.com/*`,
      `https://www.${tabName.value}/*`,
      `https://${tabName.value}.com/*`,

      // `${tabName.value}/*`,
      // brave://extensions/
    ],
  });
  // get an array of only urls
  const tabsUrl = tabs.map((tab) => tab.url);
  // console.log("tabsUrl: ", tabsUrl);
  console.log("unique tabs: ", new Set(tabs));
  tabs = [...new Set(tabs)];

  //tabs should only contain unique values , hence make it a set and then again a set
  const collator = new Intl.Collator();

  console.log(
    "Tabs: ",
    tabs.map((tab) => tab.url)
  );
  tabs.sort((a, b) => collator.compare(a.title, b.title));

  // console.log(
  //   "Sorted Tabs: ",
  //   tabs.map((tab) => tab.url)
  // );
  //find the main link name

  const tabsMap = new Map();

  const template = document.getElementById("li_template");
  // template.innerText = "";
  const elements = new Set();
  for (const tab of tabs) {
    // yhan we can do that , create a map of already occured links and then , if any link is not in the map we will add it else if the link is present in the map , we will just continue and not take that link again

    if (tabsMap.has(tab.url)) {
      // console.log("present");
      continue;
    }

    tabsMap.set(tab.url, tab);
    console.log("TabsMap: ", tabsMap);
    // let linkName = tab.url.includes("rudranshaggarwal");
    // console.log("rudranshaggarwal ka link hai");

    const element = template.content.firstElementChild.cloneNode(true);
    if (tab.title === "Page Not Found") continue;
    // console.log("Initial Tab title: ", tab.title);
    const title = tab.title.split("-")[0].trim();
    const pathname = new URL(tab.url).pathname.slice("/docs".length) || "/";
    // console.log("Pathname: ", pathname);

    element.querySelector(".title").textContent = title;
    element.querySelector(".pathname").textContent = pathname;
    element.querySelector("a").addEventListener("click", async () => {
      // need to focus window as well as the active tab
      await chrome.tabs.update(tab.id, { active: true });
      await chrome.windows.update(tab.windowId, { focused: true });
    });

    elements.add(element);
  }
  document.querySelector("ul").append(...elements);

  // Grouping logic
  const groupTabsBtn = document.getElementById("groupTabs");
  // const button = document.querySelector("button");
  groupTabsBtn.addEventListener("click", async () => {
    const tabIds = tabs.map(({ id }) => id);
    if (tabIds.length) {
      const group = await chrome.tabs.group({ tabIds });
      await chrome.tabGroups.update(group, {
        title: groupName.value + " 📁" ?? "Group 📁 ",
      });
    }
  });
});


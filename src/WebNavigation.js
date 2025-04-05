import websitesData from "./WebNavigation.json" assert { type: "json" };

// 用来记录重复项的对象
const nameCount = {};

// 用来保存重复项的数组
const duplicates = [];

// 遍历数据，检查重复
websitesData.forEach((item) => {
  if (nameCount[item.name]) {
    duplicates.push(item); // 如果重复，加入重复项数组
  } else {
    nameCount[item.name] = true; // 如果没有重复，记录该项
  }
});

console.log("重复项:", duplicates);

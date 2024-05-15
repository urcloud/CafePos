import loki from "lokijs";

const db = new loki("./cafe.db", {
  autoload: true,
  autoloadCallback: databaseInitialize,
  autosave: true,
  autosaveInterval: 4000,
});

function databaseInitialize() {
  initializeCollection("users");
  initializeCollection("menuItems");

  // kick off any program logic or start listening to external events
  runProgramLogic();
}

// example method with any bootstrap logic to run after database initialized
function runProgramLogic() {
  var userCount = db.getCollection("users").count();
  console.log("number of users in database : " + userCount);

  var menuItemCount = db.getCollection("menuItems").count();
  console.log("number of menu items in database : " + menuItemCount);
}

function initializeCollection(collectionName) {
  const collection = db.getCollection(collectionName);
  if (collection === null) {
    db.addCollection(collectionName);
  }
}

export const insertUser = (email, password) => {
  const users = db.getCollection("users");
  const result = users.insert({ email, password });
  console.log("insert result:", result);
  console.log(result);
  return result;
};

export const findUserByEmail = (email) => {
    const users = db.getCollection("users");
    const user = users.findOne({ email });
    return user;
  };

export const insertMenuItem = (name, price, imageFileName) => {
    const menuItems = db.getCollection("menuItems");
    const result = menuItems.insert({ name, price, imageFileName });
    console.log("insert result:", result);
    return result;
  };
  
export const findMenuItemByName = (name) => {
  const menuItems = db.getCollection("menuItems");
  const menuItem = menuItems.findOne({ name });
  return menuItem;
};

export function getMenuItemsFromDatabase() {
  const menuItemsCollection = db.getCollection("menuItems");

  if (menuItemsCollection) {
    const menuItems = menuItemsCollection.find();
    return menuItems;
  } else {
    return [];
  }
}

export const deleteMenuItemFromDatabase = (name) => {
  const menuItems = db.getCollection("menuItems");
  const menuItem = menuItems.findOne({ name });

  if (menuItem) {
    const { name, price, imageFileName } = menuItem;
    menuItems.remove(menuItem);
    console.log(`메뉴 아이템 '${name}'(가격: ${price}, 이미지 파일: ${imageFileName})이(가) 데이터베이스에서 삭제되었습니다.`);
  } else {
    console.log(`삭제할 메뉴 아이템 '${name}'을(를) 찾을 수 없습니다.`);
  }
}
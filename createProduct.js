const fs = require("fs");
const csv = require("csvtojson");
const { faker } = require("@faker-js/faker");

const createProduct = async () => {
  let newData = await csv().fromFile("Pokemon.csv");

  const usedIds = new Set();

  // Loại bỏ các mục có ID trùng lặp
  const uniqueData = newData.filter((pokemon) => {
    const id = parseInt(pokemon["#"]); // Đổi thành số nguyên
    if (usedIds.has(id)) {
      return false; // loại bỏ id đã có
    } else {
      usedIds.add(id); 
      return true; 
    }
  });

  newData = uniqueData.map((pokemon) => ({
    id: parseInt(pokemon["#"]), // Là ban đầu # : "25" sau đó đổi thành id: và parseInt # : "25" thành id : 25 nói cách khác truy cập chuỗi # biến thành 25
    name: pokemon["Name"],
    description: faker.lorem.paragraph(),
    height: `${faker.number.float({ max: 2 }).toFixed(2)}'`,
    weight: `${faker.number.float({ max: 200 }).toFixed(1)} lbs`,
    category: faker.music.genre(),
    abilities: faker.person.jobDescriptor(),
    types: [pokemon["Type 1"], pokemon["Type 2"]].filter(Boolean),
    url: `https://coderdex-be-9c5u.onrender.com/${pokemon["#"]}.png`,
  }));

  // Đọc dữ liệu từ tệp JSON nếu có, nếu không thì khởi tạo dữ liệu rỗng
  let dataFile = {};
  if (fs.existsSync("pokemon.json")) {
    dataFile = JSON.parse(fs.readFileSync("pokemon.json", "utf-8"));
  } else {
    dataFile = { data: [] };
  }

  dataFile.data = newData;

  fs.writeFileSync("pokemon.json", JSON.stringify(dataFile, null, 2));
};

createProduct();

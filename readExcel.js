const xlsx = require("xlsx");
const path = require("path");

const filePath = path.join(__dirname, "asset", "Data guru dan siswa kuttab Agus 2026.xlsx");
const workbook = xlsx.readFile(filePath);

const sheet1Name = workbook.SheetNames[0];
const sheet1 = xlsx.utils.sheet_to_json(workbook.Sheets[sheet1Name]);

const sheet2Name = workbook.SheetNames[1];
const sheet2 = xlsx.utils.sheet_to_json(workbook.Sheets[sheet2Name]);

console.log("Sheet 1 (Guru) sample:");
console.log(sheet1.slice(0, 2));

console.log("\nSheet 2 (Siswa) sample:");
console.log(sheet2.slice(0, 3));

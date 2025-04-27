import * as XLSX from "xlsx";


const flattenObject = (obj, prefix = "") => {
  const result = {};

  for (const key in obj) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (Array.isArray(value)) {
      if (value.every(item => typeof item === "object" && item !== null)) {
        result[newKey] = JSON.stringify(value);
      } else {
        result[newKey] = value.join(", ");
      }
    } else if (typeof value === "object" && value !== null) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = value;
    }
  }

  return result;
};


export const exportToExcel = (data, fileName = "exported-data") => {
  if (!Array.isArray(data) || data.length === 0) {
    console.error("No data provided or data is not in correct format.");
    return;
  }

  const flattenedData = data.map((item) => flattenObject(item));

  const worksheet = XLSX.utils.json_to_sheet(flattenedData);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

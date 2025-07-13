import React, { useState } from "react";
import * as XLSX from "xlsx";

export const readExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file provided"));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const binaryString = e.target.result;
        const workbook = XLSX.read(binaryString, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const numRows = jsonData.length;
        const numCols = numRows > 0 ? Object.keys(jsonData[0]).length : 0;
        const cols = numRows > 0 ? Object.keys(jsonData[0]) : [];

        resolve({
          fileName: file.name,
          fileSize: file.size,
          sheetName,
          numRows,
          numCols,
          cols,
          data: jsonData,
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsBinaryString(file);
  });
};

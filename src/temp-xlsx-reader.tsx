import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

export default function TempXlsxReader() {
  const [output, setOutput] = useState<string>("Loading...");

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/data/af-prepreg-temp.xlsx");
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        
        const result: any = {};
        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as any[][];
          // Compact: for each row, output [label, ...values] but round numbers to 2 decimals
          result[sheetName] = json.map((row: any[]) => {
            return row.map((cell: any) => {
              if (typeof cell === "number") return Math.round(cell * 100) / 100;
              return cell;
            });
          }).filter((row: any[]) => row.some((c: any) => c !== ""));
        }
        
        // Output to console for extraction
        console.log("XLSX_DATA_START");
        console.log(JSON.stringify(result));
        console.log("XLSX_DATA_END");
        setOutput(JSON.stringify(result));
      } catch (err) {
        setOutput("Error: " + String(err));
      }
    })();
  }, []);

  return <pre style={{ whiteSpace: "pre-wrap", fontSize: 8, padding: 10, maxHeight: "100vh", overflow: "auto" }}>{output}</pre>;
}

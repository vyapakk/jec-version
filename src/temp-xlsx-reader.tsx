import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

export default function TempXlsxReader() {
  const [output, setOutput] = useState<string>("Loading...");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/data/total-prepreg-temp.xlsx");
        const buf = await res.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array" });
        
        let text = "";
        
        for (const name of wb.SheetNames) {
          const ws = wb.Sheets[name];
          const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as any[][];
          text += `\n=== ${name} === (${data.length} rows)\n`;
          
          for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (row.some((c: any) => c !== "")) {
              // For label rows (first col is string, not number), show full
              const label = String(row[0]).trim();
              if (label && isNaN(Number(label))) {
                // Show label + all numeric values
                const vals = row.slice(1).map((v: any) => typeof v === 'number' ? Math.round(v * 100) / 100 : v);
                text += `${i}: ${label} | ${vals.join(', ')}\n`;
              }
            }
          }
        }
        
        console.log("XLSX_DATA_START");
        // Split into chunks for console
        const chunkSize = 3000;
        for (let i = 0; i < text.length; i += chunkSize) {
          console.log(`CHUNK_${Math.floor(i/chunkSize)}: ` + text.substring(i, i + chunkSize));
        }
        console.log("XLSX_DATA_END");
        
        setOutput(text);
      } catch (e: any) {
        setOutput(`Error: ${e.message}`);
      }
    })();
  }, []);

  return <pre style={{ whiteSpace: "pre-wrap", padding: 20, fontSize: 10, background: "#000", color: "#0f0", maxHeight: "100vh", overflow: "auto" }}>{output}</pre>;
}

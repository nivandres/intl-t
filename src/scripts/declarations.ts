import { readFileSync, rmSync, writeFileSync, statSync, readdirSync } from "fs";
import { basename, join } from "path";

export default function main(args: any[]) {
  const cmdName = basename(args[1]);

  if (args.length < 3)
    throw new Error(`Usage: ${cmdName} <file.json|folder> [--outFile=customFile] [--symbolName=customName] [--remove] [--ts]`);

  let filePath = args[2];
  let removeFile = false;
  let tsFile = false;
  let symbolName = "";
  let outFile = "";

  args.slice(3).forEach(arg => {
    if (arg === "--remove") {
      removeFile = true;
    } else if (arg === "--ts") {
      tsFile = true;
    } else if (arg.startsWith("--symbolName=")) {
      symbolName = arg.substring("--symbolName=".length).trim();
    } else if (arg.startsWith("--outFile=")) {
      outFile = arg.substring("--outFile=".length).trim();
    } else {
      console.warn(`Unknown argument: ${arg}`);
    }
  });

  const fileStat = statSync(filePath);

  if (fileStat.isDirectory()) {
    const files = readdirSync(filePath, { withFileTypes: true });
    const jsonFiles = files.filter(f => f.isFile() && f.name.endsWith(".json"));
    if (jsonFiles.length === 0) {
      throw new Error(`No JSON files found in directory "${filePath}".`);
    }
    for (const file of jsonFiles)
      try {
        main([!0, cmdName, join(filePath, file.name), ...args.slice(3)]);
      } catch (err) {
        if (err instanceof Error) console.warn(`Error processing file "${file.name}": ${err.message}`);
      }
    return;
  } else if (!fileStat.isFile()) {
    throw new Error(`File or folder "${filePath}" is not a file.`);
  }

  symbolName ||= basename(filePath, ".json").replace(/[^a-zA-Z0-9_$]/g, "_") || "data";
  outFile ||= filePath.replace(/\.json$/, tsFile ? ".ts" : ".d.json.ts");

  let json;

  try {
    json = readFileSync(filePath, "utf-8").trim();
  } catch (err) {
    if (err instanceof Error) throw new Error(`Error reading file "${filePath}": ${err.message}`);
  }

  try {
    json = JSON.parse(json!);
  } catch (err) {
    if (err instanceof Error) throw new Error(`Error parsing JSON file "${filePath}": ${err.message}`);
  }

  try {
    json = JSON.stringify(json, null, 2);
  } catch (err) {
    if (err instanceof Error) throw new Error(`Error stringifying JSON file "${filePath}": ${err.message}`);
  }

  json = `${
    tsFile ? `export const ${symbolName} = (${json}) as const;` : `export declare const ${symbolName}: ${json};`
  }\nexport type ${symbolName} = typeof ${symbolName};\nexport default ${symbolName};`;

  try {
    writeFileSync(outFile, json, "utf-8");
    if (removeFile && outFile !== filePath) {
      try {
        rmSync(filePath);
      } catch (err) {
        if (err instanceof Error) console.warn(`Error removing original file "${filePath}": ${err.message}`);
      }
    }
  } catch (err) {
    if (err instanceof Error) throw new Error(`Error writing file "${outFile}": ${err.message}`);
  }
}

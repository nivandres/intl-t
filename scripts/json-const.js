import { existsSync, readFileSync, rmSync, writeFileSync } from "fs";
import { basename } from "path";

export function main() {
  const cmdName = basename(process.argv[1]);

  if (process.argv.length < 3) {
    console.error(`Usage: ${cmdName} <file.json> [--outFile=customFile] [--symbolName=customName] [--remove] [--ts]`);
    process.exit(1);
  }

  let filePath = process.argv[2];
  let removeFile = false;
  let tsFile = false;
  let symbolName = "";
  let outFile = "";

  process.argv.slice(3).forEach(arg => {
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

  if (!existsSync(filePath)) {
    console.error(`Error: file "${filePath}" does not exist.`);
    process.exit(1);
  }

  symbolName ||= basename(filePath, ".json").replace(/[^a-zA-Z0-9_$]/g, "_") || "data";

  outFile ||= filePath.replace(/\.json$/, tsFile ? ".ts" : ".d.ts");

  let json;

  try {
    json = readFileSync(filePath, "utf-8").trim();
  } catch (err) {
    console.error(`Error reading file "${filePath}": ${err.message}`);
    process.exit(1);
  }

  try {
    json = JSON.parse(json);
  } catch (err) {
    console.error(`Error parsing JSON file "${filePath}": ${err.message}`);
    process.exit(1);
  }

  try {
    json = JSON.stringify(json, null, 2);
  } catch (err) {
    console.error(`Error stringifying JSON file "${filePath}": ${err.message}`);
    process.exit(1);
  }

  json = `${tsFile ? `const ${symbolName} = (${json}) as const;` : `declare const ${symbolName}: ${json};`
    }\ndeclare type ${symbolName} = typeof ${symbolName};\nexport { ${symbolName} };\nexport default ${symbolName};`;

  try {
    writeFileSync(outFile, json, "utf-8");
    console.log(`File created: ${outFile}`);
    if (removeFile && outFile !== filePath) {
      try {
        rmSync(filePath);
        console.log(`Original file removed: ${filePath}`);
      } catch (err) {
        console.warn(`Error removing original file "${filePath}": ${err.message}`);
      }
    }
  } catch (err) {
    console.error(`Error writing file "${outFile}": ${err.message}`);
    console.log(json);
    process.exit(1);
  }
}

main();

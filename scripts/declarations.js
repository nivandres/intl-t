import { exists, readFile, rm, writeFile, stat, readdir } from "fs/promises";
import { basename, join } from "path";

export default async function main(args) {
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

  if (!(await exists(filePath))) {
    throw new Error(`File or folder "${filePath}" does not exist.`);
  }

  const fileStat = await stat(filePath);
  if (fileStat.isDirectory()) {
    const files = await readdir(filePath, { withFileTypes: true });
    const jsonFiles = files.filter(f => f.isFile() && f.name.endsWith(".json"));
    if (jsonFiles.length === 0) {
      throw new Error(`No JSON files found in directory "${filePath}".`);
    }
    for (const file of jsonFiles) try {
      await main([null, join(filePath, file.name), ...args.slice(3)]);
    } catch (err) {
      console.warn(`Error processing file "${file.name}": ${err.message}`);
    }
    return;
  }

  symbolName ||= basename(filePath, ".json").replace(/[^a-zA-Z0-9_$]/g, "_") || "data";
  outFile ||= filePath.replace(/\.json$/, tsFile ? ".ts" : ".d.json.ts");

  let json;

  try {
    json = await readFile(filePath, "utf-8").trim();
  } catch (err) {
    throw new Error(`Error reading file "${filePath}": ${err.message}`);
  }

  try {
    json = JSON.parse(json);
  } catch (err) {
    throw new Error(`Error parsing JSON file "${filePath}": ${err.message}`);
  }

  try {
    json = JSON.stringify(json, null, 2);
  } catch (err) {
    throw new Error(`Error stringifying JSON file "${filePath}": ${err.message}`);
  }

  json = `${tsFile ? `const ${symbolName} = (${json}) as const;` : `declare const ${symbolName}: ${json};`
    }\ndeclare type ${symbolName} = typeof ${symbolName};\nexport { ${symbolName} };\nexport default ${symbolName};`;

  try {
    await writeFile(outFile, json, "utf-8");
    if (removeFile && outFile !== filePath) {
      try {
        await rm(filePath);
      } catch (err) {
        console.warn(`Error removing original file "${filePath}": ${err.message}`);
      }
    }
  } catch (err) {
    throw new Error(`Error writing file "${outFile}": ${err.message}`);
  }
}

if (require.main === module) try {
  main(process.argv);
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

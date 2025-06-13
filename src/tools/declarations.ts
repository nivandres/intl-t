import { readFile, rm, writeFile, stat, readdir } from "fs/promises";
import { basename, join } from "path";

export default async function main(args: any[]) {
  const cmdName = basename(args[1]);

  if (args.length < 3) throw `Usage: ${cmdName} <file.json|folder> [--outFile=customFile] [--symbolName=customName] [--remove] [--ts]`;

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

  const fileStat = await stat(filePath);

  if (fileStat.isDirectory()) {
    const files = await readdir(filePath, { withFileTypes: true });
    const jsonFiles = files.filter(f => f.isFile() && f.name.endsWith(".json"));
    if (jsonFiles.length === 0) {
      throw `No JSON files found in directory "${filePath}".`;
    }
    for (const file of jsonFiles)
      try {
        main([!0, cmdName, join(filePath, file.name), ...args.slice(3)]);
      } catch (err) {
        if (err instanceof Error) console.warn(`Error processing file "${file.name}": ${err.message}`);
      }
    return;
  } else if (!fileStat.isFile()) {
    throw `File or folder "${filePath}" is not a file.`;
  }

  symbolName ||= basename(filePath, ".json").replace(/[^a-zA-Z0-9_$]/g, "_") || "data";
  outFile ||= filePath.replace(/\.json$/, tsFile ? ".ts" : ".d.json.ts");

  let json;

  try {
    json = (await readFile(filePath, "utf-8")).trim();
  } catch (err) {
    if (err instanceof Error) throw `Error reading file "${filePath}": ${err.message}`;
  }

  try {
    json = JSON.parse(json!);
  } catch (err) {
    if (err instanceof Error) throw `Error parsing JSON file "${filePath}": ${err.message}`;
  }

  try {
    json = JSON.stringify(json, null, 2);
  } catch (err) {
    if (err instanceof Error) throw `Error stringifying JSON file "${filePath}": ${err.message}`;
  }

  json = `${
    tsFile ? `export const ${symbolName} = (${json}) as const;` : `export declare const ${symbolName}: ${json};`
  }\nexport type ${symbolName} = typeof ${symbolName};\nexport default ${symbolName};`;

  try {
    await writeFile(outFile, json, "utf-8");
    if (removeFile && outFile !== filePath) {
      try {
        await rm(filePath);
      } catch (err) {
        if (err instanceof Error) console.warn(`Error removing original file "${filePath}": ${err.message}`);
      }
    }
  } catch (err) {
    if (err instanceof Error) throw `Error writing file "${outFile}": ${err.message}`;
  }
}

const declarations = new Set<string>();

interface Params {
  outFile?: string;
  symbolName?: string;
  remove?: boolean | string;
  ts?: boolean | string;
}

export async function generateDeclaration(file: string, params: Params = {}): Promise<void> {
  if (declarations.has(file)) return;
  declarations.add(file);
  let { outFile, symbolName, remove, ts } = params;
  outFile &&= `--outFile=${outFile}`;
  symbolName &&= `--symbolName=${symbolName}`;
  remove &&= `--remove`;
  ts &&= `--ts`;
  try {
    await main([!0, "declarations", file, outFile, symbolName, remove, ts].filter(Boolean));
  } catch (error) {
    console.error(error);
  }
}

export async function generateDeclarations(filesOrFolder: string[] | string, params: Params = {}) {
  if (filesOrFolder instanceof Array) {
    for (const file of filesOrFolder) await generateDeclaration(file, params);
  } else await generateDeclaration(filesOrFolder, params);
}

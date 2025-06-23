#!/usr/bin/env node
import { promises as fs, watch as fsWatch } from "fs";
import { join, basename, relative } from "path";

export const cmdName = "declarations";
export const commonDir = ["i18n", "locales", "messages", "translations", "dictionaries", "intl"];
export const usage = `
Usage: ${cmdName} <files|folders>... [options]

Options:
  --out, --output     Output file or folder
  --watch             Watch files/folders for changes
  --format <fmt>      Output format: ts, d.ts, d.json.ts (default)
  --symbol <name>     Exported symbol name (default: data)
  --delete            Delete original JSON files
  --no-search         Disable default JSON search
  --recursive         Search recursively in specified folders
  --silent            Silence logs
  -h, --help          Show help
`;

export type DeclarationsFormat = "ts" | "d.ts" | "d.json.ts";

export interface Options {
  inputs: string[];
  output?: string;
  watch: boolean;
  format: DeclarationsFormat;
  symbolName?: string;
  deleteOriginal: boolean;
  disableSearch: boolean;
  silent: boolean;
}

export function parseArgs(args: string[], options: Partial<Options> = {}) {
  options.inputs ??= [];
  args.splice(0, args[2] === cmdName ? 3 : 2);
  args.forEach(arg => {
    if (!arg.startsWith("-")) return options.inputs!.push(arg);
    const [key, value] = arg.split("=");
    switch (key) {
      case "-h":
      case "--help":
        console.log(usage);
        process.exit(0);
      case "--out":
      case "--output":
        options.output = value;
        break;
      case "--watch":
        options.watch = true;
        break;
      case "--no-search":
        options.disableSearch = true;
        break;
      case "--format":
        options.format = value as DeclarationsFormat;
        break;
      case "--symbol":
        options.symbolName = value;
        break;
      case "--delete":
        options.deleteOriginal = true;
        break;
      case "--silent":
        options.silent = true;
        break;
      default:
        throw new Error(`Unknown option ${arg}. Use --help for usage.`);
    }
  });
  options.disableSearch ??= false;
  options.silent ??= false;
  return options;
}

export async function generateDeclarations(inputs: string | string[], options: Partial<Options>): Promise<void>;
export async function generateDeclarations(options: Partial<Options>): Promise<void>;
export async function generateDeclarations(
  inputsOrOptions: string | string[] | Partial<Options>,
  {
    inputs = [inputsOrOptions as string].flat(),
    disableSearch = true,
    format = "d.json.ts",
    watch = false,
    deleteOriginal = false,
    silent = true,
    output,
    symbolName,
  }: Partial<Options> = Array.isArray(inputsOrOptions) || typeof inputsOrOptions === "string"
    ? { inputs: [inputsOrOptions as unknown as string].flat() }
    : inputsOrOptions,
) {
  const log = silent ? () => {} : console.log;
  const currentFolder = process.cwd();

  if (!(inputs.length || disableSearch)) {
    inputs = Object.entries(
      Object.groupBy(
        (
          await fs.readdir(currentFolder, { withFileTypes: true, recursive: true }).catch(err => {
            throw `Error reading directory "${currentFolder}": ${err.message}`;
          })
        ).filter(file => !file.parentPath.match(/node_modules|\/\.\w+\/?/)),
        file => file.parentPath,
      ),
    )
      .filter(entries => {
        const [path, { length } = []] = entries;
        const files = entries[1]?.filter(file => file.name.match(/\.json\w*$/)) || [];
        return files.length && (files.length >= length / 2 || commonDir.some(dir => path.includes(dir)));
      })
      .map(([path]) => path);
  }

  if (!inputs.length) {
    throw "No input files or folders specified. Use --help for usage.";
  }

  log(`Processing ${inputs.length} input file(s) or folder(s)... ${inputs.map(f => relative(currentFolder, f))}`);

  for (const input of inputs) {
    const stat = await fs.stat(input).catch(() => null);
    if (!stat) throw `File or folder not found: ${input}`;

    if (stat.isDirectory()) {
      let files = await fs.readdir(input, { withFileTypes: true, recursive: false });
      files = files.filter(file => file.isFile() && file.name.match(/\.json\w*$/));
      for (const file of files) {
        try {
          await generateDeclarations(join(file.parentPath, file.name), {
            disableSearch: true,
            deleteOriginal,
            watch: false,
            symbolName,
            format,
          });
        } catch (err: any) {
          log(err);
        }
      }
      if (watch) {
        try {
          const watcher = fsWatch(input, { recursive: true });
          watcher.on("change", (_, filename) => {
            if (!filename.toString().match(/\.json\w*$/)) return;
            try {
              generateDeclarations(join(input, filename.toString()), {
                disableSearch: true,
                deleteOriginal: false,
                watch: false,
                symbolName,
                format,
              });
            } catch (err: any) {
              log(err);
            }
          });
        } catch (err: any) {
          throw `Error watching directory "${input}": ${err.message}`;
        }
      }
      return;
    }

    if (!input.match(/\.json\w*$/)) continue;

    let json;

    try {
      json = await fs.readFile(input, "utf-8");
    } catch (err: any) {
      throw `Error reading file "${input}": ${err.message}`;
    }

    try {
      json = JSON.parse(json);
    } catch (err: any) {
      throw `Error parsing JSON file "${input}": ${err.message}`;
    }

    try {
      json = JSON.stringify(json, null, 2);
    } catch (err: any) {
      throw `Error stringifying JSON file "${input}": ${err.message}`;
    }

    symbolName ??= basename(input)
      .replace(/\.json\w*$/, "")
      .replace(/[^a-zA-Z0-9_$]/g, "_");

    switch (format) {
      case "ts":
        json = `export const ${symbolName} = (${json}) as const;\nexport type ${symbolName} = typeof ${symbolName};\nexport default ${symbolName};\n`;
      case "d.ts":
        json = `export declare const ${symbolName} = (${json}) as const;\nexport declare type ${symbolName} = typeof ${symbolName};\nexport default ${symbolName};\n`;
      case "d.json.ts":
      default:
        json = `export declare const ${symbolName}: ${json};\nexport type ${symbolName} = typeof ${symbolName};\nexport default ${symbolName};`;
    }

    output ??= input.replace(/\.json\w*$/, `.${format}`);

    try {
      await fs.writeFile(output, json, "utf-8");
      if (deleteOriginal && input !== output) {
        try {
          await fs.unlink(input);
        } catch (err: any) {
          throw `Error deleting original file "${input}": ${err.message}`;
        }
      }
    } catch (err: any) {
      throw `Error writing output file "${output}": ${err.message}`;
    }

    if (watch) {
      try {
        const watcher = fsWatch(input);
        watcher.on("change", () => {
          try {
            generateDeclarations(input, {
              deleteOriginal: false,
              disableSearch: true,
              output,
              symbolName,
              format,
              watch: false,
            });
          } catch (err: any) {
            log(err);
          }
        });
      } catch (err: any) {
        throw `Error watching file "${input}": ${err.message}`;
      }
    }
  }
}

export default function main(args: string[]) {
  return generateDeclarations(parseArgs(args));
}

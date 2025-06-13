import main from "../scripts/declarations";

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

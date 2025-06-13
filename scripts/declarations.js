import main from '../dist/scripts/declarations.js';

try {
  main(process.argv);
}
catch (err) {
  if (err instanceof Error)
    console.error(err.message);
  process.exit(1);
}

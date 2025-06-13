import main from '../dist/scripts/declarations';

try {
  main(process.argv);
}
catch (err) {
  if (err instanceof Error)
    console.error(err.message);
  process.exit(1);
}

import path from 'path';
import fs from 'fs';

import { Database, sqlite3 } from '@vscode/sqlite3';
import { Main } from './main';

var sqlite3 = require('@vscode/sqlite3').verbose();
const tmpFolder = process.env["TMP"] ? path.join(process.env["TMP"], "duplicatesFinder") : path.join("~", ".duplicatesFinder")

if (!fs.existsSync(tmpFolder)) {
    fs.mkdirSync(tmpFolder);
}

const dbFile = path.join(tmpFolder, "db.sqlite3");
var db: Database = new sqlite3.Database(dbFile);

console.log(dbFile);

var main = new Main(db);

console.debug = function () { };

db.serialize(async () => {
    await main.processFiles(process.argv.slice(2));
    await main.searchDuplicates();
    await main.close();
});


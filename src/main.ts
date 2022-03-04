import { Database } from "@vscode/sqlite3";
import path from "path";
import { AsyncDatabase } from "./AsyncDatabase";
import { DiskAnalyse } from "./diskAnalyse";
import { Operations } from "./operations";

export class Main {
    readonly operations: Operations;
    readonly db: AsyncDatabase;
    readonly diskAnalyzer = new DiskAnalyse();

    constructor(db: Database) {
        this.db = new AsyncDatabase(db);

        this.operations = new Operations(this.db);

    }



    processFiles(folders: string[]): Promise<boolean> {

        return new Promise(async (resolve, reject) => {
            // this.db.serialize(() => {
            console.log("Create table");
            this.operations.initialize();

            let i = 0;
            let exclusions: string[] = (await this.db.all<{ path: string }>(`select path from ${Operations.tableName}`)).map(e => e.path);
            console.log(`Ignoring processed files ${exclusions.length}`);

            this.diskAnalyzer.process(folders, exclusions, async (item, isLast) => {
                if (item) {
                    i++;
                    console.debug(`Processing : ${item.path}`);

                    const needinsert = await this.operations.update(item);
                    if (needinsert) {
                        await this.operations.create(item);
                    }

                    if (i % 50 == 0) {
                        console.log(`${i} files processed`)
                    }
                    if (isLast)
                        resolve(isLast);
                }
            });
            // });
        });
    }

    async searchDuplicates(): Promise<void> {
        console.log(`Searching duplicates in table : ${Operations.tableName}`)
        const rows = await this.db.all(`select * from ${Operations.tableName} where md5 in (SELECT md5 FROM ${Operations.tableName} group by md5 having count(*) > 1)`);
        console.log(`Duplicate md5: ${JSON.stringify(rows)}`);
    }

    close(): Promise<void> {
        return this.db.close();
    }
}
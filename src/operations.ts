import { AsyncDatabase } from "./AsyncDatabase";

export class Operations {
    readonly db: AsyncDatabase;
    static tableName = "onedrive";

    constructor(db: AsyncDatabase) {
        this.db = db;
    }

    async initialize() {
        await this.db.run(`CREATE TABLE IF NOT EXISTS ${Operations.tableName}(path TEXT NOT NULL PRIMARY KEY, filename TEXT NOT NULL, md5 CHAR(32) NOT NULL)`);
    }

    update(item: FileInfo): Promise<boolean> {
        return new Promise(async (resolve, reject) => {

            const commandResult = await this.db.run(`update ${Operations.tableName} set md5 = ? where path = ?;`, [item.md5, item.path]);

            const result = commandResult.changes === 0;
            console.debug(`${item.path}, changes ${commandResult.changes}`);
            if (!result) {
                console.info(`ROW Update : ${item.path}`);
            }
            resolve(result);
        });
    }

    async create(item: FileInfo): Promise<void> {
        console.info(`ROW Create : ${item.path}`);
        await this.db.run(`INSERT INTO ${Operations.tableName}(path, filename, md5) VALUES ('${item.path}', '${item.filename}', '${item.md5}');`);
    }
}



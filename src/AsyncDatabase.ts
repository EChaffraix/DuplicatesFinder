import { Database, RunResult, Statement } from "@vscode/sqlite3";

export class AsyncDatabase {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    run(sql: string, params?: any): Promise<RunResult> {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (this: RunResult, err: Error | null) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this);
                }
            });
        });
    }

    get<T>(sql: string, params?: any): Promise<T> {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, function (this: Statement, err: Error | null, row: T) {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    all<T>(sql: string, params?: any): Promise<T[]> {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, function (this: Statement, err: Error | null, rows: T[]) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }


    // each(sql: string, callback?: (this: Statement, err: Error | null, row: any) => void, complete?: (err: Error | null, count: number) => void): this;
    //each(sql: string, params: any, callback?: (this: Statement, err: Error | null, row: any) => void, complete?: (err: Error | null, count: number) => void): this;

    close() : Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.close((err: any) => {
                console.log("Database connection closed");
                resolve();
            });
        })
    }

}
import fs from 'fs/promises'
import path from 'path';
import md5File from 'md5-file';

type DiskAnalyseHandler = (fileInfo: FileInfo, isLast: boolean) => void;
export class DiskAnalyse {
    constructor() {

    }

    async process(folders: string[], exclusions: string[], fileHandler: DiskAnalyseHandler) {
        while (folders.length > 0) {
            const folder = folders.shift() as string;
            const filesOrFolder = await fs.readdir(folder, { withFileTypes: true });

            folders = folders.concat(filesOrFolder.filter(e => e.isDirectory()).map(e => path.join(folder, e.name)));

            const files = filesOrFolder.filter(e => e.isFile());
            for (const file of files) {
                const filename = file.name;
                let fullPath = path.join(folder, filename);
                if (exclusions.find(excludedFile => excludedFile === fullPath)) {
                    console.debug(`Excluding processed file : ${fullPath}`)
                } else {
                    console.debug(`Processing file : ${fullPath}`)
                    const md5 = await md5File(fullPath);
                    const isLast = files[files.length - 1] === file && folders.length === 0;
                    fileHandler({ path: fullPath, filename: filename, md5: md5 }, isLast);
                }
            };
        }
        console.log("DiskAnalyse: finished")
    }
}
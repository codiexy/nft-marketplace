import formidable from "formidable";
import fs from "fs";
import { slugify } from "helpers";
import moment from "moment";
const { dirname } = require('path');

export const uploadFile = async (req, res, basePath = "/uploaded") => {
    const { type } = req.query;
    const form = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {
        if (files.file) {
            const path = await saveFile(files.file, type, basePath);
            return res.status(201).json({
                status: 'success',
                data: {
                    path: path
                }
            });
        } else {
            return res.status(404).json({
                status: 'error',
                data: {
                    message: "File is required!"
                }
            });
        }
    });
};

export const saveFile = async (file, type, basePath = "/uploaded") => {
    const data = fs.readFileSync(file.filepath);
    const fileNameSplit = file.originalFilename.split(".");
    const fileName = moment().valueOf() + "-" + slugify(fileNameSplit[0]) + '.' + fileNameSplit[1];
    let directory = `${basePath}/${type}/${fileName}`.trim();
    directory = directory.charAt(0) == "/" ? directory.substring(1) : directory;
    const path = `${process.env.PWD}/assets/${directory}`;

    // check folder is exist, if not then create with 777 permission
    const folderPath = dirname(path);
    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

    fs.writeFileSync(path, data);
    fs.unlinkSync(file.filepath);
    return `/${directory}`;
};

export const removeFile = async (file) => {
    file = file.charAt(0) == "/" ? file.substring(1) : file;
    const path = `${process.env.PWD}/assets/${file}`;
    fs.unlink(path, function (err) {
        if (err) {
            console.error(err);
        } else {
            console.log("File removed:", path);
        }
    });
};

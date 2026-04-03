import fs from 'fs';
import os from 'os';
import path from 'path';
import multer from 'multer';

const uploadDirectory = path.join(os.tmpdir(), 'gp-fintech-csv-uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => {
    callback(null, uploadDirectory);
  },
  filename: (_request, file, callback) => {
    const safeBaseName = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9-_]/g, '-');
    callback(null, `${Date.now()}-${safeBaseName}.csv`);
  },
});

function csvFileFilter(_request, file, callback) {
  const isCsvByExtension = path.extname(file.originalname || '').toLowerCase() === '.csv';
  const mimeType = String(file.mimetype || '').toLowerCase();
  const isCsvByMime =
    mimeType.includes('csv') ||
    mimeType === 'application/vnd.ms-excel' ||
    mimeType === 'text/plain';

  if (isCsvByExtension || isCsvByMime) {
    callback(null, true);
    return;
  }

  callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'file'));
}

export const uploadTransactionCsv = multer({
  storage,
  fileFilter: csvFileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024,
    files: 1,
  },
}).single('file');

export function handleTransactionCsvUploadError(error, _request, response, next) {
  if (!error) {
    next();
    return;
  }

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      response.status(400).json({ message: 'CSV file is too large. Maximum allowed size is 15MB.' });
      return;
    }

    response.status(400).json({ message: 'Please upload a valid CSV file.' });
    return;
  }

  response.status(400).json({ message: error.message || 'Unable to process the uploaded CSV file.' });
}

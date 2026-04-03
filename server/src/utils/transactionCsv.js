import fs from 'fs';
import { unlink } from 'fs/promises';
import csvParser from 'csv-parser';

const allowedTypes = new Set(['income', 'expense']);

function sanitizeText(value) {
  return String(value ?? '').trim();
}

function parseAmount(value) {
  const amount = Number(String(value ?? '').replace(/,/g, '').trim());
  return Number.isFinite(amount) ? amount : NaN;
}

function parseDateValue(value) {
  const parsedDate = new Date(String(value ?? '').trim());
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function escapeCsvCell(value) {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function validateTransactionRow(rawRow, index) {
  const category = sanitizeText(rawRow.category);
  const title = sanitizeText(rawRow.title) || category;
  const type = sanitizeText(rawRow.type).toLowerCase();
  const amount = parseAmount(rawRow.amount);
  const parsedDate = parseDateValue(rawRow.date);
  const rowNumber = index + 2;
  const rowErrors = [];

  if (!title) {
    rowErrors.push(`Row ${rowNumber}: title is required. Add a title column or provide a category value to reuse as the title.`);
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    rowErrors.push(`Row ${rowNumber}: amount must be a positive number.`);
  }

  if (!allowedTypes.has(type)) {
    rowErrors.push(`Row ${rowNumber}: type must be "income" or "expense".`);
  }

  if (!category) {
    rowErrors.push(`Row ${rowNumber}: category is required.`);
  }

  if (!parsedDate) {
    rowErrors.push(`Row ${rowNumber}: date must be a valid date.`);
  }

  return {
    isValid: rowErrors.length === 0,
    errors: rowErrors,
    transaction: rowErrors.length
      ? null
      : {
          title,
          amount,
          type,
          category,
          date: parsedDate,
        },
  };
}

export async function parseTransactionsCsvFile(filePath) {
  return new Promise((resolve, reject) => {
    const validTransactions = [];
    const errors = [];
    let hasRows = false;
    let rowIndex = 0;

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => {
        hasRows = true;
        const result = validateTransactionRow(row, rowIndex);
        rowIndex += 1;

        if (result.isValid) {
          validTransactions.push(result.transaction);
          return;
        }

        errors.push(...result.errors);
      })
      .on('end', () => {
        resolve({
          hasRows,
          validTransactions,
          errors,
        });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

export async function removeUploadedFile(filePath) {
  if (!filePath) return;

  try {
    await unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

export function buildTransactionsCsv(transactions) {
  const header = ['title', 'amount', 'type', 'category', 'date'];
  const rows = transactions.map((transaction) =>
    [
      escapeCsvCell(transaction.title),
      escapeCsvCell(transaction.amount),
      escapeCsvCell(transaction.type),
      escapeCsvCell(transaction.category),
      escapeCsvCell(new Date(transaction.date).toISOString()),
    ].join(','),
  );

  return [header.join(','), ...rows].join('\n');
}

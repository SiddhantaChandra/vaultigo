'use client';

/**
 * Parse CSV data from Chrome password export format
 * @param {string} csvText - The CSV text to parse
 * @returns {Array} Array of parsed password objects
 */
export function parseChromePasswordCsv(csvText) {
  // Handle empty input
  if (!csvText || !csvText.trim()) {
    return [];
  }

  try {
    // Split into rows
    const rows = csvText.split(/\r?\n/);
    if (rows.length <= 1) {
      throw new Error('CSV file contains no data rows');
    }

    // Parse headers (first row)
    const headers = parseCSVRow(rows[0]);

    // Check for required headers (case-insensitive)
    const requiredFields = ['name', 'url', 'username', 'password'];
    const headerMap = {};

    // Find indices of required fields
    for (const field of requiredFields) {
      const index = headers.findIndex(
        (h) => h.toLowerCase().trim() === field.toLowerCase(),
      );

      if (index === -1) {
        throw new Error(`Required field '${field}' not found in CSV`);
      }

      headerMap[field] = index;
    }

    // Optional note field
    headerMap.note = headers.findIndex(
      (h) => h.toLowerCase().trim() === 'note',
    );

    // Parse data rows
    const passwords = [];
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i].trim()) continue; // Skip empty rows

      try {
        const values = parseCSVRow(rows[i]);

        // Create password object from row
        const passwordEntry = {
          website:
            values[headerMap.name]?.trim() ||
            values[headerMap.url]?.trim() ||
            'Unknown',
          username: values[headerMap.username]?.trim() || '',
          password: values[headerMap.password]?.trim() || '',
          notes:
            headerMap.note !== -1 ? values[headerMap.note]?.trim() || '' : '',
        };

        // Skip entries without username or password
        if (passwordEntry.username && passwordEntry.password) {
          passwords.push(passwordEntry);
        }
      } catch (err) {
        console.warn(`Error parsing row ${i}:`, err);
        // Continue parsing other rows
      }
    }

    return passwords;
  } catch (error) {
    console.error('CSV parsing error:', error);
    throw new Error(`Failed to parse CSV: ${error.message}`);
  }
}

/**
 * Parse a single CSV row handling quotes and commas properly
 * @param {string} row - A single row from CSV file
 * @returns {Array} Array of values from the row
 */
function parseCSVRow(row) {
  const values = [];
  let currentValue = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];

    if (char === '"') {
      // Check if this is an escaped quote (""")
      if (i + 1 < row.length && row[i + 1] === '"') {
        currentValue += '"';
        i++; // Skip the next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      values.push(currentValue);
      currentValue = '';
    } else {
      // Regular character
      currentValue += char;
    }
  }

  // Add the last value
  values.push(currentValue);

  return values;
}

/**
 * Convert password entries to CSV format
 * @param {Array} passwordEntries - Array of password objects
 * @returns {string} CSV formatted string
 */
export function createPasswordCsv(passwordEntries) {
  // Define headers
  const headers = ['name', 'url', 'username', 'password', 'note'];

  // Create CSV rows
  const csvRows = [
    headers.join(','),
    ...passwordEntries.map((entry) => {
      // Escape fields properly
      const escapedFields = [
        escapeCsvField(entry.website || ''),
        escapeCsvField(entry.website || ''), // URL same as website for simplicity
        escapeCsvField(entry.username || ''),
        escapeCsvField(entry.password || ''),
        escapeCsvField(entry.notes || ''),
      ];

      return escapedFields.join(',');
    }),
  ];

  return csvRows.join('\n');
}

/**
 * Escape a field for CSV output
 * @param {string} field - The field to escape
 * @returns {string} Escaped field
 */
function escapeCsvField(field) {
  // If field contains commas, quotes, or newlines, wrap in quotes and escape quotes
  if (/[",\n\r]/.test(field)) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

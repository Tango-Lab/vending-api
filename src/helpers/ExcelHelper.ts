import ExcelJS from 'exceljs';

import { DownloadBinaryData } from '../../packages';

export class ExcelHelper {

  readonly #workbook: ExcelJS.Workbook;

  readonly #worksheet: ExcelJS.Worksheet;

  constructor(sheetName: string) {
    this.#workbook = new ExcelJS.Workbook();
    this.#worksheet = this.#workbook.addWorksheet(sheetName);
  }

  /**
   * Sets the columns for the worksheet.
   * @param columns - An array of objects defining header, key, and width for columns.
   */
  setColumns(columns: { header: string; key: string; width?: number }[]): void {
    this.#worksheet.columns = columns;
  }

  /**
   * Adds a single row to the worksheet.
   * @param data - An object containing key-value pairs that match the worksheet columns.
   */
  addRow(data: Record<string, any>): void {
    this.#worksheet.addRow(data);
  }

  async generated(): Promise<DownloadBinaryData> {
    const file = await Promise.resolve(this.#workbook.xlsx.writeBuffer());
    const bufferFile = Buffer.from(file);
    return new DownloadBinaryData(bufferFile, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'data.xlsx');
  }
}
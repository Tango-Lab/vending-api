/**
 * Used to download binary data as a file.
 */
export class DownloadBinaryData {
  /**
   * Constructor. Receives the location of the resource.
   * @param content The binary data to be downloaded as a file.
   * @param mimeType The mime-type to be passed on Content-Type header.
   * @param fileName The file name
   */
  constructor(public content: Buffer, public mimeType: string, public fileName: string) { }
}
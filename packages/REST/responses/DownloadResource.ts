/**
 * Used to download a resource.
 */
export class DownloadResource {
  /**
   * Constructor.
   * @param filePath The file path to download.
   * @param fileName The file name
   */
  constructor(public filePath: string, public fileName: string) { }
}
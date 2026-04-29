export class ManagedObjectUrls {
  private urls: string[] = []

  create(source: Blob | MediaSource): string {
    const url = URL.createObjectURL(source)
    this.urls.push(url)
    return url
  }

  revokeAll(): void {
    for (const url of this.urls) {
      URL.revokeObjectURL(url)
    }
    this.urls = []
  }
}

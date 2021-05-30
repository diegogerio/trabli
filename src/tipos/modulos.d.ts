declare module 'pagedjs/dist/paged' {
  class Previewer {
    preview(
      content: string,
      stylesheets: (string | Record<string, string>)[],
      renderTo: HTMLElement
    ): Promise<void>
  }
}

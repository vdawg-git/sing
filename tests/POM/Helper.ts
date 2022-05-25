export function isImage(element: Element): element is HTMLImageElement {
  return element.tagName === "IMG"
}

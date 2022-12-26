export function getPossibleElementByQuerySelector<T extends Element>(
  queryArray: string[],
): T | undefined {
  for (const query of queryArray) {
    const element = document.querySelector(query)
    if (element) {
      return element as T
    }
  }
}

export function getBefores(element : Element, array:Element[] = [], counter:number = 0, max:number = 5): Element[]{
    const previous = element.previousElementSibling
    if(counter > max || !previous) {
        return array.reverse()
    } else {
        array.push(previous)
        return getBefores(previous, array, counter + 1, max)
    }
}
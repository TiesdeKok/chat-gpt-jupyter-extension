export interface NotebookInterface {
    buttonParent: string,
    resultContainer: string,
    resultContainerChild: string
}

export const config: Record<string, NotebookInterface> = {
  notebook: {
    buttonParent: "#maintoolbar-container",
    resultContainer: '#pager',
    resultContainerChild : "#pager-container",

  },
  lab: {
    buttonParent: "#jp-top-panel",
    resultContainer: '#labContainerParent',
    resultContainerChild : "#labContainerChild",
  }
}

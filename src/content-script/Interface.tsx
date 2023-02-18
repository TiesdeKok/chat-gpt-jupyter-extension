import { Icon } from '@primer/octicons-react'

interface Props { 
    name : string,
    onClick : () => void,
    icon : Icon,
    disabled? : boolean | false, 
    siteName: string
}

export function Button(props: Props) {  
    const isNotebook = props.siteName == "notebook"
    return (
        <button className="btn btn-default btn-xs chat-gpt-button" onClick={props.onClick } disabled={props.disabled} style= {{marginTop: isNotebook ? '-0.5px' : '4px' }} title={props.name} >
            <props.icon size='small' className="icon" />
        </button> 
    )

} 

export function LabArea() {
    return (
        <div className="lm-Widget p-Widget jp-PropertyInspector lm-mod-hidden p-mod-hidden lm-StackedPanel-child p-StackedPanel-child" style={{height: '100%'}} id="labContainerParent">
            <div className="lm-Widget p-Widget jp-NotebookTools" id="labContainerChild"></div>
        </div>
    )

}
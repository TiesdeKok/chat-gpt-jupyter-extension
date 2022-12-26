import { Icon } from '@primer/octicons-react'

interface Props { 
    name : string,
    onClick : () => void,
    icon : Icon,
    disabled? : boolean | false,
}

function Button(props: Props) {
    return (
        <button className="btn btn-default btn-xs chat-gpt-button" onClick={props.onClick } disabled={props.disabled}>
            <props.icon size='small' className="icon" /> {props.name}
        </button>
    )

}
export default Button

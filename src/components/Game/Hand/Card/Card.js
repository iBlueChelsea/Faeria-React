import React, {useState} from 'react';
import images from '../../../../assets/images/cards/images';
import './Card.css';

const Card = (props) => {
    const [card,setCard] = useState(props.data);

    return (
        <div className={props.classname} onClick={props.clickAction}>
            <img id={props.index} src={images[card.id]} width={props.width} height={props.height}></img>
        </div>
    );
}

export default Card;
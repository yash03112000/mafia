import React, {useState,useEffect,useRef} from 'react';
import {Link , Redirect} from 'react-router-dom';
import 'whatwg-fetch';




const Msg = ({socket}) =>{

    const [time,setTime] = useState(0);


    useEffect(()=>{
        socket.current.on('timer',sec=>{
            setTime(sec);
        })
    },[])


    return(
        <p id='demo'>0:{time}</p>
    )
} 



export default Msg;

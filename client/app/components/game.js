import React, {useState,useEffect} from 'react';
import {Link , Redirect} from 'react-router-dom';
import 'whatwg-fetch';
import Chat from './Chat';



const game = ({match}) =>{

    const [load,setLoad] = useState(true);
    const [gamename,setGamename] = useState('');
    const [isDev,setisDev] = useState(false);


    useEffect(()=>{
        fetch('/game/join',{method:'PUT',headers: {
            'Content-Type': 'application/json'},body:JSON.stringify({id:match.params.id})})
            // .then(res=>res.json())
            .then((res)=>{
                if(res.status === 200){
                    fetch('/game/details',{method:'PUT',headers: {
                        'Content-Type': 'application/json'},body:JSON.stringify({id:match.params.id})})
                        .then((res)=>{
                            res.json().then((res)=>{
                                setGamename(res.gamename);
                                // setisDev(res.isDev);
                                // setUsername(res.username);
                                // setGameid(res.gameid);
                                // setPlayerid(res.playerid);
                                setLoad(false);

                            })
                        })
                }
            })
    },[])




    return(
        load?<h1>Loading...</h1>:
        <> 
            <Chat gamename={gamename} isDev={isDev} />
        </>
        );
} 



export default game;

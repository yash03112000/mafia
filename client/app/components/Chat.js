import React, {useState,useEffect,useRef} from 'react';
import {Link , Redirect} from 'react-router-dom';
import 'whatwg-fetch';
import Msg from './Msg'
import Timer from './Timer'


import socketIOClient from "socket.io-client";



const Chat = ({gamename}) =>{

    // const [msg,setMsg] = useState([]);
    const [load,setLoad] = useState(true);
    const [players,setPlayers] = useState([]);
    const [rembut,setRembut] = useState('none');
    // const [time,setTime] = useState(0);
    const [btn,setBtn] = useState('block');
    const [place,setPlace] = useState('Enter Message');
    const [read,setRead] = useState(false);
    // const [poll,setPoll] = useState([]);
    const [redir,setRedir] = useState(false);





    const msgref = useRef();
    // const io = useRef();
    // const username = username;
    // const room = gameid;
    const socket = useRef();
    useEffect(()=>{
        socket.current = socketIOClient('http://localhost:8080/');
        socket.current.emit('joinRoom');

        socket.current.on('usernames',names=>{
            setPlayers(names);
        })

        socket.current.on('rembut',names=>{
            setRembut('none');
        })
        socket.current.on('rebut',names=>{
            setRembut('block');
        })
        socket.current.on('night',()=>{
            setBtn('none');
            setPlace('Night Time');
            setRead(true);
        })

        socket.current.on('pollnight',()=>{
            setBtn('none');
            setPlace('Poll Time');
            setRead(true);
        })

        socket.current.on('kill',()=>{
            setBtn('none');
            setPlace('Killed');
            setRead(true);
        })

        socket.current.on('wake',()=>{
            setBtn('display');
            setPlace('Enter Message');
            setRead(false);
        })

        socket.current.on('redirect',()=>{
            console.log('redirect')
            setRedir(true)
        })


        // console.log(msgref.current)
        msgref.current?msgref.current.focus():'';
        setLoad(false);


        return () => {
            socket.current.disconnect();
          }
    },[])

    const sendmsg = (e)=>{
        e.preventDefault();
        if(!read){
            console.log(msgref.current.value);
            var msg = msgref.current.value
            socket.current.emit('message',{msg})
            msgref.current.value = '';
        }

    }

    const startgame = ()=>{
        console.log('Start Game request send to Server');  
        socket.current.emit('startGame');
        setRembut('none');
    }

    const leavegame = ()=>{
        // console.log('Start Game request send to Server');  
        socket.current.emit('leaveGame');
        // setRembut('block');
    }








    return(
        load?<h1>Loading...</h1>:
        (redir?<Redirect to="/Dashboard" />:
        <>
              <div className="chat-container">
                    <header className="chat-header">
                    <h1><i className="fas fa-smile"></i> Mafia</h1>
                    <a onClick={startgame} className="btn2" style={{display:rembut}} >Start Game</a>
                    <Timer socket={socket} />
                    <a onClick={leavegame} className="btn" style={{display:rembut}}>Leave Room</a>
                    </header>
                    <main className="chat-main">
                    <div className="chat-sidebar">
                        <h3><i className="fas fa-comments"></i> Room Name:</h3>
                        <h2 id="room-name">{gamename}</h2>
                        <h3><i className="fas fa-users"></i> Users</h3>
                        <ul id="users">
                            {players.map((player,i)=>{
                                if(player.active){
                                    return(
                                        <li key={i} >{player.playername}-Active</li>
                                    )
                                }else{
                                    return(
                                        <li key={i} >{player.playername}-Dead</li>
                                    )
                                }
                            })}
                        </ul>
                    </div>
                    <Msg socket={socket} />
                    </main>
                    <div className="chat-form-container">
                        <form id="chat-form" onSubmit={sendmsg} >
                            <input
                            ref={msgref}
                            id="msg"
                            type="text"
                            placeholder={place}
                            required
                            autoComplete="off"
                            readOnly = {read}
                            // onChange={e=>setMsgdata(e.target.value)}
                            />
                            
                            <button className="btn" id='btnid' style={{display:btn}} ><i className="fas fa-paper-plane"></i> Send</button>
                        </form>
                    </div>
                </div>

        </>
        )
        );
} 



export default Chat;

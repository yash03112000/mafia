import React, {useState,useEffect,useRef} from 'react';
import {Link , Redirect} from 'react-router-dom';
import 'whatwg-fetch';




const Msg = ({socket}) =>{

    const [msg,setMsg] = useState([]);
    const [poll,setPoll] = useState([]);

    useEffect(()=>{
        socket.current.on('message', message => {
            // console.log(message);
            if(message.id==="poll"){
                setPoll((messages) => [...messages, {pollid:message.pollid,voted:false,time:true}]);
            }
            setMsg((messages) => [...messages, message]);
        
            // chatMessages.scrollTop = chatMessages.scrollHeight;
            // console.log(msg)
        });
        socket.current.on('polltime',(id)=>{
            setPoll((polls)=>(
                // console.log(polls)
                polls.map((poll,i)=>{
                    // console.log('here')
                    if(poll.pollid !== id) return poll
                    return{...poll,time:false}
                }
                )
            ))

        })
    },[])


    const vote = (id,pid,ppid)=>{
            setPoll((polls)=>(
                // console.log(polls)
                polls.map((poll,i)=>{
                    // console.log('here')
                    if(poll.pollid !== pid) return poll
                    return{...poll,voted:true}
                }
                )
            ))
        socket.current.emit('vote',{id,pid,ppid});

    }      

    
    return(
        (msg.length?
        <div className="chat-messages">
        {msg.map((msg,i)=>{
           //  console.log(socket.current.id);
           //  console.log(msg.id);
            if(socket.current.id === msg.id){
               return(
                   <div key={i} className="messagesender" >
                       <p className="meta" >
                           {msg.username}
                           <span>{msg.time}</span>
                       </p>
                       <p className="text" >
                           {msg.text}
                       </p>
                   </div>
               )
            }else if(msg.id==="admin"){
               return(
                   <div key={i} className="messageadmin" >
                       <p className="meta" >
                           {msg.username}
                           <span>{msg.time}</span>
                       </p>
                       <p className="text" >
                           {msg.text}
                       </p>
                   </div>
               )
            }else if(msg.id==="poll"){
                // console.log(msg);
                var i;
                for(i=0;i<poll.length;i++){
                    if(msg.pollid === poll[i].pollid){
                        // console.log(poll[i]);
                        if(poll[i].voted){
                            return(
                                <div className="pollmain" >
                                    <table className="polltable" >
                                        <tr className="ques">
                                            <td>{msg.text}</td> 
                                        </tr>
                                        <tr>
                                            <td>Already Voted</td>
                                        </tr>
                                    </table>
                                </div>
                            )
                        }else{
                            if(!poll[i].time){
                                return(
                                    <div className="pollmain" >
                                        <table className="polltable" >
                                            <tr className="ques">
                                                <td>{msg.text}</td> 
                                            </tr>
                                            <tr>
                                                <td>Time Over...</td>
                                            </tr>
                                        </table>
                                    </div>
                                )

                            }else{
                               return(
                                   <div className="pollmain" >
                                       <table className="polltable" >
                                           <tr className="ques">
                                              <td>{msg.text}</td> 
                                           </tr>
                                           {(msg.options).map((opt,i)=>(
                                               <tr key={opt._id} onClick={()=>{vote(opt._id,msg.pollid,opt.pid)}} >
                                                   <td>{msg.usernames[i].username}</td>
                                               </tr>
                                           ))}
                                       </table>
                                   </div>
                               )
                            }
                        }
                    }
                }
                

            }
            else{
               return(
                   <div key={i} className="messagereceiver" >
                       <p className="meta" >
                           {msg.username}
                           <span>{msg.time}</span>
                       </p>
                       <p className="text" >
                           {msg.text}
                       </p>
                   </div>
               )
            }

           })}                                    
       </div>:<h1>Server Error:(</h1>)
    )
} 



export default Msg;

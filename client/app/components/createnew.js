import React, {useState,useEffect} from 'react';
import {Link , Redirect} from 'react-router-dom';
import 'whatwg-fetch';



const createnew = () =>{

    const [Name,setName] = useState('');
    const [Private,setPrivate] = useState(false);
    const [status,setStatus] = useState(false);
    const [loading,setLoading] = useState(true);
    const [game,setGame] = useState('');
    const [gamename,setGamename] = useState('');



    const creategame=(e)=>{
        e.preventDefault();
        fetch(`/game/creategame`, {method: 'POST',headers: {
            'Content-Type': 'application/json'}, body: JSON.stringify({name:Name,Private:Private})})
            // .then(res=>res.json())
            .then((res) => {
                if(res.status === 200){     
                    // if(res.valid){
                        // setLoading(false);
                    // }else{
                        res.json().then((res)=>{
                            setGame(`/game/${res.game}`);
                            setStatus(true);
                        })

                    // }
                }
            })
      }

      useEffect(()=>{
        checkvalid();
      },[]);

      const checkvalid=()=>{
        fetch(`/game/checkvalid`)
            .then(res=>res.json())
            .then(res => {
                if(res.status === 200){
                    if(res.valid){
                        setLoading(false);
                    }else{
                        setStatus(true);
                        setGame(`/game${res.game}`);
                    }
                }
            })
      }


    return(
        status?<Redirect to={game} />: 
        <>
            <h1>Create New Game</h1>
            <form>
                <label>Name:</label>
                <input value={Name} onChange={(e)=>setName(e.target.value)} type="text" />
                <br />
                <label>Status:</label>
                <select id="status" className="form-control" name="status" value="public" onChange={(e)=>{e.target.value==='private'?setPrivate(true):setPrivate(false)}}>
                    <option value="public" >Public</option>
                    <option value="private">Private</option>
                </select>
                <br />
                <button onClick={creategame} className="btn btn-dark">Submit</button>
            </form>                        
        </>
        );
} 



export default createnew;

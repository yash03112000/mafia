import React, {useState,useEffect} from 'react';
import {Link,Redirect} from 'react-router-dom';



const Dashboard = () =>{

    const [Name,setName] = useState('');
    // const [Password,setPassword] = useState('');
    const [status,setStatus] = useState(false);
    const [loading,setLoading] = useState(true);
    const [valid,setValid] = useState(false);
    const [game,setGame] = useState('');
    const [gamename,setGamename] = useState('');
    const [publicgames,setPublicgame] = useState({});



    useEffect(()=>{
        details()
    },[])
    const details=()=>{
        // console.log('here1234');
        fetch(`/dashboard/details`)
            .then(res=>res.json())
            .then(res => {
                setLoading(false);
                setName(res.username);
                if(res.valid){
                    setPublicgame(res.games);
                    setValid(true);
                } 
                else{
                    setValid(false);
                    setGame(`/game/${res.game}`)
                    setGamename(res.name)
                }
            })

      }

    return(
        status?<Redirect to='/Dashboard' />:(
            loading?<h1>Loading...</h1>:
            <>
                <div class = "container">
                    <div class = "row">
                        <div class = "col-8">
                            <div class = "col-sm-8">
                                <h1>Dashboard</h1>
                                <h1>{Name}</h1>
                                <Condition valid={valid} game={game} gamename={gamename} publicgames={publicgames} />
                            </div>
                        </div>
                    </div>
                </div>


                        
            </>
        ) 

        );
} 

const Condition = ({valid,game,gamename,publicgames})=>(
    valid?(<>
    <p ><Link to="/createnew">Create Game</Link></p>
    <p >OR</p>
    <p >Join An Existing Game</p>
    <ul>
        {publicgames.map((game)=>(
            <li className="row row-cols-1 row-cols-md-2">
                <div>{game.name}</div>
                <Link to={`/game/${game._id}`} ><div>Link</div></Link>
            </li>
        ))}
    </ul>
    </>):(<Link to={game}>Join {gamename} Room</Link>)
)


export default Dashboard;

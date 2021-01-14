import React, {useState} from 'react';
import {Link,Redirect} from 'react-router-dom';
import 'whatwg-fetch';



const Home = () =>{

    const [Name,setName] = useState('');
    const [Password,setPassword] = useState('');
    const [status,setStatus] = useState(false);


    const login=(e)=>{
        e.preventDefault();
        fetch(`/SignIn`, {method: 'POST',headers: {
            'Content-Type': 'application/json'}, body: JSON.stringify({username:Name,password:Password})})
            .then(res => {
                if(res.status === 200){
                    setStatus(true);
                }
            })

      }

    return(
        status?<Redirect to='/Dashboard' />: 
        <>
    <div class = "container">
         <div class = "row">
            <div class = "col-8">
            <div class = "col-sm-8">
                <h1>SignIn</h1>
                <form onSubmit={login}>
                    <div class = "form-group">
                    <label for="Username">Username: </label>
                        <input type="username" class="form-control" name="username" aria-describedby="emailHelp" value={Name} onChange={e => setName(e.target.value)}/>
                        <small id="emailHelp" class="form-text text-muted">Usernames are case-sensitive</small>
                    </div>
                    <div class = "form-group">
                    <label for="Password">Password: </label>
                        <input name="password" class="form-control" type="password" value={Password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <button class = "btn btn-dark">SignIn</button>
                </form>
                <p>New User?Sign Up <Link to="/SignUp" >Here</Link> </p>
                </div>
            </div>
            </div>
        </div>
            
                        
        </>
        );
} 



export default Home;

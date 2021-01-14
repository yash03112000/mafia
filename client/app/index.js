import React from 'react';
import { render } from 'react-dom';

import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch
} from 'react-router-dom'

import App from './components/App/App';
import NotFound from './components/App/NotFound';

import Home from './components/Home';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import createnew from './components/createnew';
import game from './components/game';





import HelloWorld from './components/HelloWorld/HelloWorld';

import './styles/styles.scss';

render((
  <Router>
    <App>
      <Switch>
        <Route exact path="/" component={Home}/>
        <Route exact path="/SignUp" component={SignUp}/>
        <Route exact path="/Dashboard" component={Dashboard}/>
        <Route exact path="/createnew" component={createnew}/>
        <Route exact path="/game/:id" component={game}/>
        <Route path="/helloworld" component={HelloWorld}/>
        <Route component={NotFound}/>
      </Switch>
    </App>
  </Router>
), document.getElementById('app'));

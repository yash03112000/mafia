
// count Player
const countPlayer = (count)=>{
    if(count>=6) return 1;
    else return 0;
};
// MafiaFamCount
const getMafiaFamCount = (count)=>{
    var a = count-2;
    var b = a/2;
    var c = Math.floor(b);
    return c;
};
const getRndInteger = (min, max)=>{
    return Math.floor(Math.random() * (max - min) ) + min;
  }

const getmafiaTeamCode = (n,players)=>{
    var i,j;
    var a = [];
    for(i=0;i<n;i++){
        a[i] = getRndInteger(0,players);
        for(j=0;j<i;j++){
            if(a[j]==a[i]){
                i--;
                break;
            }
        }
    }
    return a;
};
const mafiaTeamEntry = (players,code)=>{
    // const obj = {};
    // obj.team = 'mafia'
  //  players.push(obj)[0];
  var i;
  const mafiaTeam = [];
  for(i=0;i<code.length;i++){
      var t = code[i];
    //   players[t].team = 'Mafia';
    //   var obj = {};
    //   obj.id = players[t].id;
    //   obj.username = players[t].username;
    //   obj.room = players[t].room;
      mafiaTeam.push(players[t]);
  }
  return mafiaTeam;

  
};
const cityTeamEntry = (players,code)=>{
    var i,k;
    const cityTeam = [];
    for(i=0;i<players.length;i++){
        var flag = 0;
        for(k=0;k<code.length;k++){
            if(i===code[k]) flag++;
        }
        if(!flag){
            // players[i].team = 'City';
            // var obj = {};
            // obj.id = players[i].id;
            // obj.username = players[i].username;
            // obj.room = players[i].room;
            cityTeam.push(players[i]);
        }
    }
    return cityTeam;
  
};

const findGodfather = (players,mafiaTeam,code,code2)=>{
    //mafiaTeam[code[0]].role = 'GodFather';
    // players[code2[code[0]]].role = 'GodFather';
    // var obj = {};
    // obj.id = mafiaTeam[code[0]].id;
    // obj.username = mafiaTeam[code[0]].username;
    // obj.room = mafiaTeam[code[0]].room;
    //obj.room = mafiaTeam[code[0]].room;
    return mafiaTeam[code[0]];
};
const findmafia = (players,code)=>{
    var i;
    const mafia = [];
    for(i=0;i<players.length;i++){
        if(i !== code[0]){
            // players[i].role = 'Mafia';
            // var obj = {};
            // obj.id = players[i].id;
            // obj.username = players[i].username;
            // obj.room = players[i].room;
            mafia.push(players[i]);
        }
        
    }
    return mafia;
};

const findwhite = (players,cityTeam,code)=>{
    // var i;
    // for(i=0;i<players.length;i++){
    //     if(players[i].id===cityTeam[code[0]].id){
    //         players[i].role = 'White Detective';
    //     }
    // }
    // var obj = {};
    // obj.id = cityTeam[code[0]].id;
    // obj.username = cityTeam[code[0]].username;
    // obj.room = cityTeam[code[0]].room;
    //obj.room = mafiaTeam[code[0]].room;
    return cityTeam[code[0]];
};

const findblack = (players,cityTeam,code)=>{
    //mafiaTeam[code[0]].role = 'GodFather';
    //players[code2[code[0]]].role = 'GodFather';
    // var i;
    // for(i=0;i<players.length;i++){
    //     if(players[i].id===cityTeam[code[1]].id){
    //         players[i].role = 'Black Detective';
    //     }
    // }
    // var obj = {};
    // obj.id = cityTeam[code[1]].id;
    // obj.username = cityTeam[code[1]].username;
    // obj.room = cityTeam[code[1]].room;
    //obj.room = mafiaTeam[code[0]].room;
    return cityTeam[code[1]];
};

const findhealer = (players,cityTeam,code)=>{
    //mafiaTeam[code[0]].role = 'GodFather';
    //players[code2[code[0]]].role = 'GodFather';
    // var i;
    // for(i=0;i<players.length;i++){
    //     if(players[i].id===cityTeam[code[2]].id){
    //         players[i].role = 'Healer';
    //     }
    // }
    //     var obj = {};
    //      obj.id = cityTeam[code[2]].id;
    //     obj.username = cityTeam[code[2]].username;
    //     obj.room = cityTeam[code[2]].room;
        return cityTeam[code[2]];
    
    
    //obj.room = mafiaTeam[code[0]].room;
};

const findcitizen = (cityTeam,code)=>{
    var i,k;
    const citizen = [];
    for(i=0;i<cityTeam.length;i++){
        var flag = 0;
        for(k=0;k<code.length;k++){
            if(code[k] ===i) flag++;
        }

        if(!flag){
            // players[i].role = 'Citizen';
            // var obj = {};
            // obj.id = players[i].id;
            // obj.username = players[i].username;
            // obj.room = players[i].room;
            citizen.push(cityTeam[i]);
        }
    }
    
    //obj.room = mafiaTeam[code[0]].room;
    return citizen;
};

module.exports = {
  countPlayer,
  getMafiaFamCount,
  getmafiaTeamCode,
  mafiaTeamEntry,
  cityTeamEntry,
  findGodfather,
  findmafia,
  findwhite,
  findblack,
  findhealer,
  findcitizen
};
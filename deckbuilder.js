window.onload=function(){

search_expanded=0
settings_expanded=0
search_source=0 //0: normal pool, 1: cardlist

document.getElementById('status').innerText="Load OK"

//Settings menu
document.getElementById('preferences').onclick = function() {
  settings_expanded=!settings_expanded
  document.getElementById('toolbar').style.height=24+(500*settings_expanded)
};

//Advanced search options menu
document.getElementById('searchopts').onclick = function() {
  search_expanded=!search_expanded
  if(search_expanded==1){
    document.getElementById('filters_extra').style.visibility="visible"
    document.getElementById('filters_extra').style.height=150
  }
  else{
    document.getElementById('filters_extra').style.visibility="collapse"
    document.getElementById('filters_extra').style.height=0
  }
};

//Change from card pool to cardlist
document.getElementById('swapsources').onclick=function(){
  search_source=!search_source
  if(search_source==1){
    var html="<button>Import cardlist</button>"
    document.getElementById('swapsources').innerText="Use card pool"    
  }
  else{
    var html="Format <select><option>Wanderer</option></select>\
              sets <input type='text'></input>\
              Banlist <select><option>None</option></select>"
    document.getElementById('swapsources').innerText="Use cardlist"      
  }
  document.getElementById('sources').innerHTML=html
}

//Default deck
deck={
  'deckname':'New deck',
  'ruler':'none',
  'main':[],
  'stone':[],
  'side':[],
}

//Draw deck on deck zone
function drawdeck()
{
  var html="<center>"
  html+="<b id='deckname'>"+deck.deckname+"</b><br/>"
  html+="[Graph]<br/><br/>" //to-do
  html+="[Ruler]<br/>"+deck.ruler+"<br/>"

  html+="<br/><span id='maindeck'>[Main deck]</span><br/>"
  for(var i=0;i<deck.main.length;i++){
    html+=deck.main[i]+"<br/>"
  }

  html+="<br/><span id='stonedeck'>[Stone deck]</span><br/>"
  for(var i=0;i<deck.stone.length;i++){
    html+=deck.stone[i]+"<br/>"
  }

  var i=1
  while (deck["extra"+i]!=undefined){
    html+="<br/><span id='extra"+i+"'>["+deck["extra"+i+"name"]+"]</span><br/>"
    for(var j=0;j<deck["extra"+i].length;j++){
      html+=deck["extra"+i][j]+"<br/>"
    }
    i+=1
  }
  html+="<br/><button id='addextra'>Add extra deck</button><br/>"

  html+="<br/><span id='sideboard'>[Sideboard]</span><br/>"
  for(var i=0;i<deck.side.length;i++){
    html+=deck.side[i]+"<br/>"
  }

  document.getElementById('deck').innerHTML=html

  //Deck name listener
  document.getElementById('deckname').onclick=function(){
    document.getElementById('deckname').onclick=''
    document.getElementById('deckname').innerHTML="<input type='text' id='namebox'></input>"
    document.getElementById('namebox').value=deck.deckname
    document.getElementById('namebox').addEventListener('keydown',function(e){
      if(e.key=="Enter"){
        deck.deckname=document.getElementById('namebox').value
        drawdeck()
      }
    })
  }

  //Graph click listener

  //Main deck click listener
  document.getElementById('maindeck').onclick=function(){
    document.getElementById('maindeck').onclick=''
    document.getElementById('maindeck').innerHTML+="<button id='clear'>Clear</button>"
    document.getElementById('clear').onclick=function(){
      deck.main=[]
      drawdeck()
    }
  }

  //Stone deck click listener
  document.getElementById('stonedeck').onclick=function(){
    document.getElementById('stonedeck').onclick=''
    document.getElementById('stonedeck').innerHTML+="<button id='clear'>Clear</button>"
    document.getElementById('clear').onclick=function(){
      deck.stone=[]
      drawdeck()
    }
  }

  //Extra deck name click listeners
  var i=1
  while (deck["extra"+i]!=undefined){
    document.getElementById("extra"+i).onclick=function(){
      console.log(i)
      document.getElementById("extra"+i).onclick=''
      document.getElementById("extra"+i).innerHTML="<input type='text' id='namebox'><br/><button id='clear'>Clear</button><button id='delete'>Delete</button></input>"
      document.getElementById('namebox').value=deck["extra"+i+"name"]
      document.getElementById("namebox").addEventListener('keydown',function(e){
        if(e.key=="Enter"){
          deck["extra"+i+"name"]=document.getElementById('namebox').value
          drawdeck()
        }
      })
      document.getElementById('clear').onclick=function(){
        deck["extra"+i]=[]
        drawdeck()
      }
      document.getElementById('delete').onclick=function(){
        delete deck["extra"+i]
        delete deck["extra"+i+"name"]
        drawdeck()
      }
    }
    i+=1
  }

  //Add extra deck button listener
  document.getElementById('addextra').onclick = function() {
    var i=1
    while (deck["extra"+i]!=undefined){i+=1}
    deck["extra"+i]=[]
    deck["extra"+i+"name"]="Extra deck "+i
    drawdeck()
  };

  //Sideboard click listener
  document.getElementById('sideboard').onclick=function(){
    document.getElementById('sideboard').onclick=''
    document.getElementById('sideboard').innerHTML+="<button id='clear'>Clear</button>"
    document.getElementById('clear').onclick=function(){
      deck.side=[]
      drawdeck()
    }
  }
}

//Draw card area
function drawcards()
{
  var html=""
  var cols=4
  //calculate columns
  var cardwidth=(document.getElementById('cards').offsetWidth/cols)
  while(cardwidth<125 || cardwidth>175){
    if(cardwidth<125){cols-=1}
    else{cols+=1}
    cardwidth=(document.getElementById('cards').offsetWidth/cols)
  }
  //get visible size of cards div (https://stackoverflow.com/questions/12868287/get-height-of-non-overflowed-portion-of-div)
  var offs=0
  var n=document.getElementById('cards')
  while (n.offsetParent && n.offsetParent.id != "wrapper"){
    offs+=n.offsetTop;
    n=n.offsetParent
  }
  var height=n.offsetHeight-offs

  //calculate rows
  var rows=Math.floor(height/((cardwidth+20)*1.396))

  for(var i=0;i<cols*rows;i++){
    html+="<div id='card'><img src='./img/card-Back.png' width='"+cardwidth+"'></img></div>"
  }

  document.getElementById('cards').innerHTML=html

  //add listeners (click to add to deck)
  var dcards=document.querySelectorAll('[id=card]')
  for (var i=0;i<dcards.length;i++){
    dcards[i].onclick=function(){
      var imgurl=this.getElementsByTagName('img')[0].src
      var imgname=imgurl.split('.')[0].split('/').slice(-1)[0]
      deck.main.push(imgname)
      drawdeck()
    }
  }
}

//card area redraw on resize
window.addEventListener('resize',function(e){
  drawcards()
})

//Populate page for the first time
drawcards()
drawdeck()
}
window.onload=function(){

search_expanded=0
settings_expanded=0
search_source=0 //0: normal pool, 1: cardlist
will_types=["light", "fire", "water", "wind", "dark", "void"]
will_equivs={"light":"{W}", "fire":"{R}", "water":"{U}", "wind":"{G}", "dark":"{B}"}
cost_types=["0", "1", "2", "3", "4", "5", "6", "7"]
//Search parameters
//will -> [Y,R,B,G,P,V]
//cost -> [0,1,2,3,4,5,6,7]
//textc -> <string>
//types -> [Resonator, chant, addition, ruler, etc]
//sets -> [<set1>, <set2>, etc]
//races -> [<race1>, <race2>, etc]
//
search_params={
  'will':[0,0,0,0,0,0],
  'cost':[0,0,0,0,0,0,0]
}
carddb=[]
filteredcards=[]
search_page=1

document.getElementById('status').innerText="Load OK"

//Settings menu
document.getElementById('preferences').onclick = function() {
  settings_expanded=!settings_expanded
  document.getElementById('toolbar').style.height=24+(500*settings_expanded)
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
  'side':[]
}

//Draw deck on deck zone
function drawdeck()
{
  var html="<center>"
  html+="<b id='deckname'>"+deck.deckname+"</b><br/>"
  html+="[Graph]<br/><br/>" //to-do
  html+="<span id='decksection'>Ruler</span><br/>"+deck.ruler+"<br/>"

  html+="<br/><span id='maindeck'>Main deck</span><br/>"
  for(var i=0;i<deck.main.length;i++){
    html+=deck.main[i]+"<br/>"
  }

  html+="<br/><span id='stonedeck'>Stone deck</span><br/>"
  for(var i=0;i<deck.stone.length;i++){
    html+=deck.stone[i]+"<br/>"
  }

  var i=1
  while (deck["extra"+i]!=undefined){
    html+="<br/><span class='extra' id='extra"+i+"'>"+deck["extra"+i+"name"]+"</span><br/>"
    for(var j=0;j<deck["extra"+i].length;j++){
      html+=deck["extra"+i][j]+"<br/>"
    }
    i+=1
  }
  html+="<br/><button id='addextra'>Add extra deck</button><br/>"

  html+="<br/><span id='sideboard'>Sideboard</span><br/>"
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

  tcards=cols*rows

  for(var i=0;i<tcards;i++){
    //filteredcards[(page*tcards)+i].name
    html+="<div id='card'><img src='./img/card-Back.png' width='"+cardwidth+"'></img></div>"
  }

  //add page navigation buttons
  html+="<div id='arrowprev'> <<< </div>"
  html+="<div id='arrownext'> >>> </div>"

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

  document.getElementById('arrowprev').onclick=function(){
    search_page-=1
    if(search_page<1){search_page=1}
    console.log("Page "+search_page)
  }
  document.getElementById('arrownext').onclick=function(){
    search_page+=1
    var maxpages=Math.ceil(filteredcards/tcards)
    if(search_page>maxpages){search_page=maxpages}
    console.log("Page "+search_page)
  }
}

//Draw updated search parameters
function drawsearch(){

  var html=""
  html+="<input type='text' placeholder='search'></input>"
  for(var i=0;i<will_types.length;i++){
    html+="<img width='30px' id='icon' src='./icons/will_"+will_types[i]+".png'></img>"
  }
  for(var i=0;i<8;i++){
    html+="<img width='30px' id='icon' src='./icons/cost_"+i+".png'></img>"
  }
  html+="<img width='30px' id='searchopts' src='./icons/misc_more.png'></img>"

  document.getElementById('filters').innerHTML=html

  //Modify icon transparency
  var ics=document.querySelectorAll('[id=icon]')
  var tps=search_params.will.concat(search_params.cost)
  for(var i=0;i<ics.length;i++){
    ics[i].style.opacity=0.4+(0.6*tps[i])
  }


  //add listeners

  //Icon attribute/cost toggles
  for(var i=0;i<ics.length;i++){
    ics[i].onclick=function(){
      type=this.src.split("_")[1].split(".")[0]
      if(will_types.indexOf(type)!=-1){
        search_params.will[will_types.indexOf(type)]^=1
      }
      else{
        search_params.cost[cost_types.indexOf(type)]^=1
      }
      drawsearch()
      filtercards()
      drawcards()
    }
  }

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
}

//initial card load
function loadcards(){
  cards=cards.fow.clusters
  for(var i=0;i<cards.length;i++){
    for(var j=0;j<cards[i].sets.length;j++){
      carddb=carddb.concat(cards[i].sets[j].cards)
    }
  }
}

function filtercards(){

  
  setfcards=carddb
  //Filter by set (Has to be done first)
  if(search_params.sets!=undefined){

  }

  //Filter by attribute (will cost colours)
  //Attributes in DB are {W}{R}{U}{G}{B}
  var willfcards=[]
  var swills=[]
  for(var i=0;i<search_params.will.length;i++){
    if(search_params.will[i]==1){
      swills.push(will_equivs[will_types[i]])
    }
  }
  if(swills.length>0){
    for(var i=0;i<setfcards.length;i++){
      if(swills.every(z=>setfcards[i].cost.includes(z))){
        willfcards.push(setfcards[i])
      }
    }
  }
  else {willfcards=setfcards}

  //Filter by cost
  var costfcards=[]
  var scosts=[]
  if(search_params.cost.some(it=>it!=0)){
    for(var i=0;i<search_params.cost.length;i++){
      if(search_params.cost[i]==1){
        scosts.push(i)
      }
    }
  }
  if(scosts.length>0){
    for(var i=0;i<willfcards.length;i++){
      var ccost=parseInt(willfcards[i].cost.replaceAll(/[^\d]/g, '') || 1)+(willfcards[i].cost.match(/\}/g)||[]).length-1
      if(scosts.indexOf(ccost)!=-1){
        costfcards.push(willfcards[i])
      }
    }
  }
  else{costfcards=willfcards}

  //Filter by text
  if(search_params.textc!=undefined){

  }

  //Filter by type
  if(search_params.types!=undefined){

  }

  //Filter by race
  if(search_params.races!=undefined){

  }

  filteredcards=costfcards
  search_page=1 //reset page

  console.log("Search params: ",search_params)
  console.log("Total cards filtered: "+filteredcards.length)
}

//card area redraw on resize
window.addEventListener('resize',function(e){
  drawcards()
})

//Populate page for the first time
loadcards()
filtercards()
drawcards()
drawdeck()
drawsearch()
}
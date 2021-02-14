//TO-DO list (Priority order)
//--------------------
//Images (Pending on scraper)
//Void filtering
//Format filtering
//Set search parameter
//Race search
//Export/import
//Deck size limit (Warnings or hard blocks)
//Banlist filtering
//Functional graph
//Full stats on graph click
//Readable data overlay + toggle
//Card zooming
//Using cardlists
//settings + local config storage
//fix deleting extra deck causing other EDs to not show

window.onload=function(){

search_expanded=0
settings_expanded=0
search_source=0 //0: normal pool, 1: cardlist
will_types=["light", "fire", "water", "wind", "dark", "void"]
will_equivs={"light":"{W}", "fire":"{R}", "water":"{U}", "wind":"{G}", "dark":"{B}"}
cost_types=["0", "1", "2", "3", "4", "5", "6", "7"]
targets=["main","side"] //target decks for most cards
cardtarget=""

//Search parameters
//will -> [Y,R,B,G,P,V]
//cost -> [0,1,2,3,4,5,6,7]
//textc -> <string>
//types -> [Resonator, chant, addition, ruler, etc]
//sets -> [<set1>, <set2>, etc]
//races -> [<race1>, <race2>, etc]
search_params={
  'will':[0,0,0,0,0,0],
  'cost':[0,0,0,0,0,0,0],
  'types':[],
  'textc':""
}
carddb=[]
filteredcards=[]
search_page=0

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

//Card type into search params
var typedivs=document.querySelectorAll('[id=cardtype]')
for(var i=0;i<typedivs.length;i++){
  typedivs[i].onclick=function(){
    if(search_params.types.indexOf(this.innerText)==-1){
      search_params.types.push(this.innerText)
      this.style.border='1px solid white'
      this.style.backgroundColor="#CCC"
    }
    else{
      this.style.border='1px solid black'
      this.style.backgroundColor="gray"
      search_params.types.splice(search_params.types.indexOf(this.innerText),1)
    }
    filtercards()
  }
}

//Default deck
deck={
  'deckname':'New deck',
  'ruler':{"name":"--"},
  'main':[],
  'stone':[],
  'side':[]
}

//Draw deck on deck zone
function drawdeck()
{
  var html="<center>"
  html+="<b id='deckname'>"+deck.deckname+"</b><br/>"

  html+="<canvas id='graph'></canvas><br/><br/>" //to-do

  html+="<span class='decksection' id='rulerdeck'>Ruler</span><br/>"+deck.ruler.name+"<br/>"

  html+="<br/><span class='decksection' id='maindeck'>Main deck</span><br/>"
  for(var i=0;i<deck.main.length;i++){
    html+=deck.main[i].name+"<br/>"
  }

  html+="<br/><span class='decksection' id='stonedeck'>Stone deck</span><br/>"
  for(var i=0;i<deck.stone.length;i++){
    html+=deck.stone[i].name+"<br/>"
  }

  var i=1
  while (deck["extra"+i]!=undefined){
    html+="<br/><span class='decksection' id='extra"+i+"'>"+deck["extra"+i+"name"]+"</span><br/>"
    for(var j=0;j<deck["extra"+i].length;j++){
      html+=deck["extra"+i][j].name+"<br/>"
    }
    i+=1
  }
  html+="<br/><button id='addextra'>Add extra deck</button><br/>"

  html+="<br/><span class='decksection' id='sideboard'>Sideboard</span><br/>"
  for(var i=0;i<deck.side.length;i++){
    html+=deck.side[i].name+"<br/>"
  }

  document.getElementById('deck').innerHTML=html

  //Edit section target colouring
  if(cardtarget=="main"){
    document.getElementById('maindeck').style.border="1px solid white"
  }
  else if(cardtarget=="side"){
    document.getElementById('sideboard').style.border="1px solid white"
  }
  else if(cardtarget=="stone"){
    document.getElementById('stonedeck').style.border="1px solid white"
  }
  else if(cardtarget=="ruler"){
    document.getElementById('rulerdeck').style.border="1px solid white"
  }
  else if(cardtarget.includes("extra")){
    document.getElementById(cardtarget).style.border="1px solid white"
  }

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

  //Ruler click listener
  document.getElementById('rulerdeck').onclick=function(){
    document.getElementById('rulerdeck').onclick=''
    document.getElementById('rulerdeck').innerHTML+="<button id='clear'>Clear</button>"
    document.getElementById('clear').onclick=function(){
      deck.ruler={"name":"--"}
      drawdeck()
    }
  }

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
      var ednum=this.id[5]
      this.onclick=''
      this.innerHTML="<input type='text' id='namebox'><br/><button id='clear'>Clear</button><button id='delete'>Delete</button></input>"
      document.getElementById('namebox').value=deck["extra"+ednum+"name"]
      document.getElementById("namebox").addEventListener('keydown',function(e){
        if(e.key=="Enter"){
          var ednum=this.id[5]
          deck["extra"+ednum+"name"]=document.getElementById('namebox').value
          drawdeck()
        }
      })
      document.getElementById('clear').onclick=function(){
        var ednum=this.parentNode.id[5]
        deck["extra"+ednum]=[]
        drawdeck()
      }
      document.getElementById('delete').onclick=function(){
        var ednum=this.parentNode.id[5]
        delete deck["extra"+ednum]
        delete deck["extra"+ednum+"name"]
        targets.splice(ednum,1)
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
    //Add extra deck to target list
    targets.splice(i,0,"extra"+i)
    drawdeck()
  }

  //Sideboard click listener
  document.getElementById('sideboard').onclick=function(){
    document.getElementById('sideboard').onclick=''
    document.getElementById('sideboard').innerHTML+="<button id='clear'>Clear</button>"
    document.getElementById('clear').onclick=function(){
      deck.side=[]
      drawdeck()
    }
  }

  drawgraph()
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
    var index=(search_page*tcards)+i
    try{
      var cname=filteredcards[index].name
      html+="<div id='card'><img src='./img/card-Back.png' alt='"+index+"' width='"+cardwidth+"'></img><br/><center>"+cname+"</div>"
    }
    catch{}
  }

  //add page navigation buttons
  html+="<div id='arrowprev'> <<<< <br/> <<<< </div>"
  html+="<div id='arrownext'> >>>> <br/> >>>> </div>"

  document.getElementById('cards').innerHTML=html

  //add listeners 
  var dcards=document.querySelectorAll('[id=card]')
  for (var i=0;i<dcards.length;i++){
    //mouse wheel to choose target
    dcards[i].onwheel=function(e){
      var tidx=targets.indexOf(cardtarget)
      if(e.deltaY>0 && tidx!=-1){
        cardtarget=targets[(tidx+targets.length+1)%targets.length]
      }
      else if(e.deltaY<0 && tidx!=-1){
        cardtarget=targets[(tidx+targets.length-1)%targets.length]
      }
      drawdeck()
    }

    //Mouseover (target deck highlight)
    dcards[i].onmouseover=function(){
      var idx=this.childNodes[0].alt
      var card=filteredcards[idx]
      var ctype=card.type
      if(["Resonator","Chant","Addition","Regalia"].some(z=>card.type.includes(z))){
        document.getElementById('maindeck').style.border="1px solid white"
        cardtarget="main"
      }
      if(ctype=="Ruler" || ctype=="J-Ruler"){
        document.getElementById('rulerdeck').style.border="1px solid white"
        cardtarget="ruler"
      }
      if(ctype.indexOf("Stone")!=-1){
        document.getElementById('stonedeck').style.border="1px solid white"
        cardtarget="stone"
      }
    }
    dcards[i].onmouseout=function(){
      var sects=document.getElementsByClassName('decksection')
      for(var i=0;i<sects.length;i++){
        sects[i].style.border='1px solid black'
        cardtarget=""
      }
    }

    //click to add to deck
    dcards[i].onclick=function(){
      var imgurl=this.getElementsByTagName('img')[0].src
      var imgname=imgurl.split('.')[0].split('/').slice(-1)[0]
      var index=this.getElementsByTagName('img')[0].alt
      if(cardtarget!="ruler"){
        deck[cardtarget].push(filteredcards[index])
      }
      else{
        deck.ruler=filteredcards[index]
      }
      
      drawdeck()
    }

    //use loop to fix width
    dcards[i].style.width=cardwidth
    dcards[i].style.height="250px" //temporary extra space for text

  }

  var maxpages=Math.floor((filteredcards.length-1)/tcards)
  document.getElementById('arrowprev').onclick=function(){
    search_page-=1
    if(search_page<0){search_page=0}
    console.log("Page "+search_page+"/"+maxpages)
    drawcards()
  }
  document.getElementById('arrownext').onclick=function(){
    search_page+=1
    if(search_page>maxpages){search_page=maxpages}
    console.log("Page "+search_page+"/"+maxpages)
    drawcards()
  }
}

//Draw updated search parameters
function drawsearch(){

  var html=""
  html+="<input type='text' id='searchbox' placeholder='"+search_params.textc+"'></input>"
  for(var i=0;i<will_types.length;i++){
    html+="<img width='30px' id='icon' src='./icons/will_"+will_types[i]+".png'></img>"
  }
  for(var i=0;i<8;i++){
    html+="<img width='30px' id='icon' src='./icons/cost_"+i+".png'></img>"
  }
  html+="<img width='30px' id='searchopts' src='./icons/misc_more.png'></img>"
  html+="<img width='30px' id='resetopts' src='./icons/misc_reset.png'></img>"

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
      var type=this.src.split("_")[1].split(".")[0]
      if(will_types.indexOf(type)!=-1){
        search_params.will[will_types.indexOf(type)]^=1
        if(search_params.will[will_types.indexOf(type)]==1 && type!="void")
        search_params.will[5]=0
      }
      else{
        search_params.cost[cost_types.indexOf(type)]^=1
      }
      //If clicked on void, reset everything else
      if(search_params.will[5]==1){
        search_params.will=[0,0,0,0,0,1]
      }
      drawsearch()
      filtercards()
      drawcards()
    }
  }

  //Text search
  document.getElementById('searchbox').addEventListener('keydown',function(e){
    if(e.key=="Enter"){
      search_params.textc=document.getElementById('searchbox').value.toLowerCase()
      filtercards()
    }
  })

  //Advanced search options menu
  document.getElementById('searchopts').onclick = function() {
    search_expanded=!search_expanded
    if(search_expanded==1){
      document.getElementById('filters_extra').style.visibility="visible"
      document.getElementById('filters_extra').style.height=125
    }
    else{
      document.getElementById('filters_extra').style.visibility="collapse"
      document.getElementById('filters_extra').style.height=0
    }
  }

  //reset search
  document.getElementById('resetopts').onclick=function(){
    reset_search()
  }
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

function reset_search(){
  search_params={
    'will':[0,0,0,0,0,0],
    'cost':[0,0,0,0,0,0,0],
    'types':[],
    'textc':""
  }
  var typedivs=document.querySelectorAll('[id=cardtype]')
  for(var i=0;i<typedivs.length;i++){
    typedivs[i].style.backgroundColor="gray"
    typedivs[i].style.border="1px solid black"
  }
  search_page=0
  filtercards()
  drawsearch()
  drawcards()
}

function filtercards(){

  
  setfcards=carddb
  //Filter by set (Has to be done first)
  if(search_params.sets!=undefined){

  }

  //Filter by attribute (will cost colours)
  //Attributes in DB are {W}{R}{U}{G}{B} //to-do filter void
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
      else if(scosts.indexOf(7)!=-1 && ccost>7){
        costfcards.push(willfcards[i])
      }
    }
  }
  else{costfcards=willfcards}

  //Filter by text
  var textfcards=[]
  if(search_params.textc.length>0){
    for(var i=0;i<costfcards.length;i++){
      var txtcheck=false
      for(j=0;j<costfcards[i].abilities.length;j++){
        if(costfcards[i].abilities[j].toLowerCase().includes(search_params.textc)){
          txtcheck=true
        }
      }
      if(costfcards[i].name.toLowerCase().includes(search_params.textc) || txtcheck){
        textfcards.push(costfcards[i])
      }
    }
  }
  else{textfcards=costfcards}

  //Filter by type
  typefcards=[]
  if(search_params.types.length>0){
    for(var i=0;i<textfcards.length;i++){
      for(var j=0;j<search_params.types.length;j++){
        if(textfcards[i].type.indexOf(search_params.types[j])!=-1){
          typefcards.push(textfcards[i])
          break
        }
      }
    }
  }
  else{typefcards=textfcards}

  //Filter by race
  if(search_params.races!=undefined){

  }

  filteredcards=typefcards
  search_page=0 //reset page
  drawcards()
  console.log("Total cards filtered: "+filteredcards.length)
}

function drawgraph(){
  var c=document.getElementById('graph');
  c.style.background="#000"
  var ctx=c.getContext("2d")
  var cwidth=document.getElementById('deck').offsetWidth-40
  ctx.canvas.width=cwidth
  ctx.canvas.height=60
  ctx.fillStyle="white"
  
  for(var i=0;i<8;i++){
    ctx.strokeStyle="white"
    ctx.fillText(i,20+(cwidth-28)*i/8,55)
    ctx.beginPath()
    ctx.moveTo(20+i*15,43.5)
    ctx.lineTo(25+i*15,43.5)
    ctx.stroke()
    ctx.strokeStyle="green"
    ctx.lineWidth=5
    ctx.beginPath()
    ctx.moveTo(22.5+i*15,42.5)
    ctx.lineTo(22.5+i*15,42.5-(5*i))
    ctx.stroke()
  }
  //to-do, actual plotting and variable width handling
}

//card area redraw on resize
window.addEventListener('resize',function(e){
  drawdeck()
  drawcards()
})

//Populate page for the first time
loadcards()
filtercards()
drawcards()
drawdeck()
drawsearch()
}
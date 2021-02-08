window.onload=function(){

search_expanded=0
settings_expanded=0

document.getElementById('status').innerText="Load OK"

//Settings menu
document.getElementById('preferences').onclick = function() {
   settings_expanded=!settings_expanded
   document.getElementById('toolbar').style.height=24+(500*settings_expanded)
};

//Advanced search options menu
document.getElementById('searchopts').onclick = function() {
   search_expanded=!search_expanded
   document.getElementById('filters').style.height=24+(500*search_expanded)
};

}
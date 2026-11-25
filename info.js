(function(){
  var steps=[["Kërko","Zgjidh profesionin dhe qytetin që të duhet."],["Shiko profilin","Lexo përshkrimin dhe shiko ku punon mjeshtri."],["Kontakto direkt","Telefono ose shkruaj në WhatsApp. Marrëveshja dhe pagesa janë mes jush."]];
  var faq=[
    ["A kushton përdorimi i faqes?","Jo. Kërkimi dhe kontakti me mjeshtrat janë falas për klientët."],
    ["Si paguhet mjeshtri?","Pagesa bëhet direkt te mjeshtri, sipas marrëveshjes suaj. Faqja nuk merr pagesa nga klientët."],
    ["A kontrollohen mjeshtrat?","Çdo profil kontrollohet nga ne para se të shfaqet publikisht. Mjeshtrat me shenjën ✔ I verifikuar i kemi kontrolluar edhe vetë. Lexo vlerësimet e klientëve të tjerë dhe merr çmimin me mesazh para se të fillojë puna."],
    ["Nuk kam kohë të kërkoj. Çfarë bëj?","Posto një kërkesë: shkruaj çfarë pune të duhet dhe në cilin qytet. Mjeshtrat e atij profesioni e shohin dhe të thërrasin vetë."],
    ["Si lë vlerësim për një mjeshtër?","Hap profilin e mjeshtrit, hyr me email dhe zgjidh nga 1 deri në 5 yje. Mund ta ndryshosh ose ta fshish vlerësimin më vonë."],
    ["Si regjistrohem si mjeshtër?","Kliko 'Hyr', krijo llogari me email dhe plotëso profilin me foto dhe punët e tua. Pasi ta aprovojmë, shfaqesh në faqe dhe sheh kërkesat e klientëve."],
    ["Si të gjej mjeshtër në qytetin tim?","Zgjidh qytetin dhe profesionin te filtrat në krye të faqes."]
  ];
  var info=document.getElementById('info'),foot=document.getElementById('foot');
  info.innerHTML='<section class="sec" id="si-funksionon"><div class="wrap"><h2>Si funksionon</h2><p class="sub">Tre hapa, pa formularë të gjatë.</p><div class="steps">'
    +steps.map(function(s,i){return '<div class="step"><span class="n">'+(i+1)+'</span><h3>'+s[0]+'</h3><p>'+s[1]+'</p></div>'}).join('')
    +'</div></div></section><section class="sec" id="pyetjet"><div class="wrap faq"><h2>Pyetje të shpeshta</h2>'
    +faq.map(function(f){return '<details><summary>'+f[0]+'</summary><p>'+f[1]+'</p></details>'}).join('')
    +'</div></section><section class="sec"><div class="wrap"><div class="band"><div><h2>Je mjeshtër?</h2><p>Shtoje veten në katalog dhe merr thirrje nga klientë në qytetin tënd.</p></div><a class="btn" href="#hyr">Regjistrohu falas</a></div></div></section>';
  foot.innerHTML='<div class="wrap"><a class="logo" href="#">Thirr<b>Mjeshtrin</b></a><p>Katalog mjeshtrash në Kosovë. Gjej mjeshtrin e duhur dhe kontakto direkt.</p><div class="fl"><a href="#">Gjej mjeshtër</a><a href="#si-funksionon">Si funksionon</a><a href="#pyetjet">Pyetjet</a><a href="#hyr">Hyr si mjeshtër</a></div><small>© '+new Date().getFullYear()+' Thirr Mjeshtrin</small></div>';
  function sync(){var h=location.hash.slice(1);info.hidden=/^(hyr|profili|admin|kerkese|kerkesat|m\/)/.test(h)}
  addEventListener('hashchange',sync);sync();
})();

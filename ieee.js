/* IEEE CEME website: shared behaviour */

window.IEEE_BASE = window.IEEE_BASE || '/pk-ceme';

/* IEEE CEME events renderer. Reads events in The Events Calendar REST format and draws them.
   Upcoming events never show photos. Finished events show up to 3 photos, taken from the
   images the committee adds to the event description, and the recap from the event excerpt. */
var IEEEEvents=(function(){
  var MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var MONL=['January','February','March','April','May','June','July','August','September','October','November','December'];
  function pd(s){ var m=String(s||'').match(/(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/);
    return m ? new Date(+m[1],+m[2]-1,+m[3],+(m[4]||0),+(m[5]||0),+(m[6]||0)) : null; }
  function dec(h){ var t=document.createElement('textarea'); t.innerHTML=h||''; return t.value; }
  function doc(h){ return new DOMParser().parseFromString('<div>'+(h||'')+'</div>','text/html'); }
  function txt(h){ var d=doc(h); d.querySelectorAll('figure,.gallery,.wp-block-gallery,.wp-block-image,script,style').forEach(function(n){ n.remove(); });
    return (d.body.textContent||'').replace(/\s+/g,' ').trim(); }
  function pics(h){ var out=[]; doc(h).querySelectorAll('img').forEach(function(i){ var s=i.getAttribute('src'); if(s && out.indexOf(s)<0) out.push(s); }); return out.slice(0,3); }
  function clip(s,n){ if(s.length<=n) return s; var c=s.slice(0,n); return c.slice(0,Math.max(c.lastIndexOf(' '),n-20))+'...'; }
  function esc(s){ return String(s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function day0(d){ var x=new Date(d); x.setHours(0,0,0,0); return x; }
  function norm(e){
    var cat=(e.categories&&e.categories[0]&&e.categories[0].name)||'';
    return { title:dec(e.title), type:dec(cat)||'Event', start:pd(e.start_date), end:pd(e.end_date),
      desc:clip(txt(e.description),220), recap:clip(txt(e.excerpt),360), photos:pics(e.description), url:e.url||'' };
  }
  function range(e){ var a=e.start,b=e.end;
    if(a.toDateString()===b.toDateString()) return a.getDate()+' '+MON[a.getMonth()]+' '+a.getFullYear();
    if(a.getMonth()===b.getMonth()&&a.getFullYear()===b.getFullYear()) return a.getDate()+' to '+b.getDate()+' '+MON[a.getMonth()]+' '+a.getFullYear();
    return a.getDate()+' '+MON[a.getMonth()]+' to '+b.getDate()+' '+MON[b.getMonth()]+' '+b.getFullYear(); }
  function nDays(e){ return Math.round((day0(e.end)-day0(e.start))/864e5)+1; }
  function title(e,o){ return o.linkTitles&&e.url ? '<a href="'+esc(e.url)+'">'+esc(e.title)+'</a>' : esc(e.title); }
  function reg(e,o,cls,label){
    return o.registerUrl ? '<a class="'+cls+'" href="'+esc(o.registerUrl+encodeURIComponent(e.title))+'">'+label+'</a>'
                         : '<button type="button" class="'+cls+'" data-reg="'+esc(e.title)+'">'+label+'</button>'; }
  function panel(e,now){
    var a=e.start,b=e.end,same=a.toDateString()===b.toDateString(),sm=a.getMonth()===b.getMonth()&&a.getFullYear()===b.getFullYear(),days,mon;
    if(same){ days=String(a.getDate()); mon=MONL[a.getMonth()]+' '+a.getFullYear(); }
    else if(sm){ days=a.getDate()+'<span>to</span>'+b.getDate(); mon=MONL[a.getMonth()]+' '+a.getFullYear(); }
    else { days=a.getDate()+' '+MON[a.getMonth()]+'<span>to</span>'+b.getDate()+' '+MON[b.getMonth()]; mon=String(b.getFullYear()); }
    var until=Math.round((day0(a)-day0(now))/864e5);
    var soon= until<=0 ? 'Happening now' : until===1 ? 'Tomorrow' : until+' days to go';
    var n=nDays(e);
    return '<div class="iev-dp"><div class="iev-days'+(same||sm?'':' iev-days--long')+'">'+days+'</div><div class="iev-mon">'+mon+'</div>'+
      '<div class="iev-count"><span><b>'+soon+'</b></span><span>'+n+(n>1?' days':' day')+'</span></div></div>'; }
  function feature(e,o,now){
    return '<div class="iev-next"><div class="iev-body"><div class="iev-tags"><span class="iev-tag iev-tag--strong">Up next</span><span class="iev-tag">'+esc(e.type)+'</span></div>'+
      '<h3>'+title(e,o)+'</h3>'+(e.desc?'<p>'+esc(e.desc)+'</p>':'')+reg(e,o,'iev-btn','Register now')+'</div>'+panel(e,now)+'</div>'; }
  function card(e,o){
    return '<article class="iev-card"><div class="iev-date"><div class="d">'+e.start.getDate()+'</div><div class="m">'+MON[e.start.getMonth()]+'</div></div>'+
      '<div><span class="iev-tag">'+esc(e.type)+'</span><h4>'+title(e,o)+'</h4>'+(e.desc?'<p>'+esc(e.desc)+'</p>':'')+
      '<div class="iev-row"><span class="iev-meta">'+range(e)+'</span>'+reg(e,o,'iev-link','Register &rarr;')+'</div></div></article>'; }
  function recap(e,o){
    var has=e.photos.length>0;
    return '<div class="iev-recap'+(has?'':' iev-nophotos')+'"><div><span class="iev-tag iev-tag--done">Recap</span><h3>'+title(e,o)+'</h3>'+
      '<p>'+esc(e.recap||e.desc)+'</p><span class="iev-meta">'+range(e)+'</span></div>'+
      (has?'<div class="iev-shots" style="grid-template-columns:repeat('+e.photos.length+',1fr)">'+e.photos.map(function(s){ return '<img src="'+esc(s)+'" alt="Photo from '+esc(e.title)+'" loading="lazy">'; }).join('')+'</div>':'')+'</div>'; }
  function split(raw,now){
    var ev=raw.map(norm).filter(function(e){ return e.start&&e.end; }).sort(function(a,b){ return a.start-b.start; });
    return { up:ev.filter(function(e){ return e.end>=now; }), past:ev.filter(function(e){ return e.end<now; }).reverse() }; }
  function render(root,raw,o){
    o=o||{}; var now=o.now||new Date(), s=split(raw,now), h='';
    if(s.up.length){
      h+=feature(s.up[0],o,now);
      var rest=o.mode==='all'?s.up.slice(1):s.up.slice(1,4);
      if(rest.length) h+='<div class="iev-grid">'+rest.map(function(e){ return card(e,o); }).join('')+'</div>';
    } else {
      h+='<div class="iev-empty"><h3>New events are on the way</h3><p>The next workshop or talk will appear here as soon as it is announced. '+
        (o.follow||'')+'</p></div>';
    }
    if(s.past.length){
      var list=o.mode==='all'?s.past:s.past.slice(0,1);
      if(o.mode==='all') h+='<h3 class="iev-h">Past events</h3>';
      h+=list.map(function(e){ return recap(e,o); }).join('');
    }
    root.innerHTML=h;
    return s;
  }
  return { render:render, split:split };
})();

(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function esc(s){ return String(s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function team(){ var box=document.getElementById('ieeeTeam'); if(!box) return [];
    return [].map.call(box.querySelectorAll('[data-name]'),function(n){ var d=n.dataset;
      return {name:d.name||'',role:d.role||'',line:d.line||'',ini:d.ini||'',photo:d.photo||'',c1:d.c1||'#0a84c7',c2:d.c2||'#00476f'}; }); }
  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded',fn); }
  ready(function(){
    var BASE=window.IEEE_BASE;
    /* nav */
    var nav=document.getElementById('ieeeNav'), burger=document.getElementById('ieeeBurger');
    if(nav){
      var here=location.pathname.replace(/\/+$/,'/');
      nav.querySelectorAll('.nav__links a,.drawer a:not(.nav__cta)').forEach(function(a){
        var p=a.getAttribute('href').replace(/^https?:\/\/[^\/]+/,'').replace(/\/+$/,'/'); if(p===here) a.classList.add('on'); });
      var solid=function(){ nav.classList.toggle('solid', scrollY>30 || nav.classList.contains('open') || document.body.classList.contains('ieee-inner')); };
      addEventListener('scroll',solid,{passive:true}); solid();
      burger.addEventListener('click',function(){ var o=nav.classList.toggle('open'); burger.setAttribute('aria-expanded',o); burger.setAttribute('aria-label',o?'Close menu':'Open menu'); solid(); });
    }
    /* reveal on scroll */
    var io='IntersectionObserver' in window ? new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} }); },{threshold:.12}) : null;
    window.IEEE_watch=function(el){ if(io&&!reduce) io.observe(el); else el.classList.add('in'); };
    document.querySelectorAll('.ieee .reveal').forEach(window.IEEE_watch);
    /* count up */
    document.querySelectorAll('.ieee .stats').forEach(function(box){
      var done=false; function go(){ if(done) return; done=true; box.querySelectorAll('[data-to]').forEach(function(el){ var to=+el.getAttribute('data-to'), t0=performance.now();
        (function step(now){ var k=Math.min((now-t0)/1400,1); k=1-Math.pow(1-k,3); el.textContent=Math.round(to*k); if(k<1) requestAnimationFrame(step); })(t0); }); }
      if(io&&!reduce) new IntersectionObserver(function(es){ if(es[0].isIntersecting) go(); },{threshold:.4}).observe(box); });
    /* events from The Events Calendar */
    document.querySelectorAll('[data-ieee-events]').forEach(function(el){
      var mode=el.getAttribute('data-ieee-events');
      fetch(BASE+'/wp-json/tribe/events/v1/events?start_date=2000-01-01&per_page=50',{credentials:'same-origin'})
        .then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); })
        .then(function(d){ IEEEEvents.render(el,d.events||[],{mode:mode,linkTitles:false,registerUrl:BASE+'/event-registration/?event=',
          follow:'Follow the branch on <a href="https://www.facebook.com/IEEE.CEME/" target="_blank" rel="noopener">Facebook</a> or <a href="https://www.linkedin.com/company/ieee-ceme-student-branch" target="_blank" rel="noopener">LinkedIn</a> to hear first.'}); })
        .catch(function(){ el.innerHTML='<div class="iev-empty"><h3>Events</h3><p>Events could not load right now. Please refresh the page.</p></div>'; });
    });
    /* office bearer badges */
    var person='<svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>';
    document.querySelectorAll('[data-ieee-team]').forEach(function(box){
      box.innerHTML=team().map(function(m){
        var ph=m.photo ? '<div class="card__photo" style="background-image:url('+esc(m.photo)+')"></div>'
          : '<div class="card__photo" style="background:linear-gradient(135deg,'+m.c1+','+m.c2+')">'+(m.ini?esc(m.ini):person)+'<small>Photo coming</small></div>';
        return '<div class="slot"><div class="hang"><div class="strap"></div><div class="clip"></div><div class="card">'+
          '<div class="card__top"><span class="m">IEEE</span><span class="t">Student Branch<b>NUST CEME</b></span></div>'+ph+
          '<div class="card__body"><div class="card__name">'+esc(m.name)+'</div><div class="card__role">'+esc(m.role)+'</div><div class="card__prog">'+esc(m.line)+'</div>'+
          '<div class="card__foot"><span class="chip"></span><span class="bars"></span></div><div class="sess">Session 2026/27</div></div></div></div></div>'; }).join('');
      var S=[].slice.call(box.querySelectorAll('.hang')).map(function(el){ return {el:el,card:el.querySelector('.card'),slot:el.parentNode,a:0,v:0,drag:false,prev:0}; });
      function setA(s){ s.el.style.transform='rotate('+s.a.toFixed(2)+'deg)'; s.card.style.setProperty('--sw',s.a.toFixed(2)); }
      S.forEach(function(s){
        s.card.addEventListener('pointerdown',function(e){ if(reduce) return; s.drag=true; s.v=0; s.prev=s.a; s.card.setPointerCapture(e.pointerId); });
        s.card.addEventListener('pointermove',function(e){ if(!s.drag) return; var r=s.slot.getBoundingClientRect(), px=r.left+r.width/2, py=r.top+4;
          var ang=-Math.atan2(e.clientX-px,e.clientY-py)*57.3; ang=Math.max(-55,Math.min(55,ang)); s.v=ang-s.prev; s.prev=s.a=ang; setA(s); });
        function up(){ s.drag=false; } s.card.addEventListener('pointerup',up); s.card.addEventListener('pointercancel',up); });
      function size(){ var h=0; S.forEach(function(s){ h=Math.max(h,s.el.offsetHeight); }); S.forEach(function(s){ s.slot.style.height=(h+28)+'px'; }); }
      size(); addEventListener('resize',size); addEventListener('load',size); if(document.fonts&&document.fonts.ready) document.fonts.ready.then(size);
      if(io&&!reduce){ var seen=false; new IntersectionObserver(function(es){ if(es[0].isIntersecting&&!seen){ seen=true;
          S.forEach(function(s,i){ setTimeout(function(){ s.v+=(i%2?1:-1)*(2.2+i*0.3); },i*140); }); } },{threshold:.3}).observe(box); }
      var last=0; function swing(now){ var dt=Math.min((now-(last||now))/16.67,3); last=now;
        S.forEach(function(s){ if(!s.drag){ var acc=-0.014*s.a-0.028*s.v; s.v+=acc*dt; s.a+=s.v*dt; if(Math.random()<0.002) s.v+=(Math.random()-.5)*0.6; } setA(s); });
        requestAnimationFrame(swing); }
      if(!reduce) requestAnimationFrame(swing);
    });
    /* forms: move the Fluent Form that sits below this snippet into the designed card */
    document.querySelectorAll('[data-ieee-form]').forEach(function(slot){
      var f=document.querySelector('.fluentform'); if(f){ slot.innerHTML=''; slot.appendChild(f); }
    });
    /* event registration page: show which event */
    var evName=new URLSearchParams(location.search).get('event'), evEl=document.querySelector('[data-ieee-event-name]');
    if(evEl){ if(evName){ evEl.textContent=evName; } else { var w=document.querySelector('[data-ieee-event-line]'); if(w) w.textContent='Pick your event from the events page, or fill in the form below.'; } }
  });
})();

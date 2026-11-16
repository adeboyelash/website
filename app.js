(function(){
  var $=function(s,c){return (c||document).querySelector(s)}, $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  $('#yr').textContent=new Date().getFullYear();

  // nav
  var nav=$('#nav'), burger=$('#burger'), menu=$('#menu'), bar=$('#progress');
  function onScroll(){
    var y=window.scrollY, h=document.documentElement.scrollHeight-window.innerHeight;
    nav.classList.toggle('scrolled',y>30);
    bar.style.width=(h>0?y/h*100:0)+'%';
  }
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
  burger.addEventListener('click',function(){
    var o=menu.classList.toggle('open'); burger.classList.toggle('open',o); burger.setAttribute('aria-expanded',o);
  });
  $$('#menu a').forEach(function(a){a.addEventListener('click',function(){menu.classList.remove('open');burger.classList.remove('open');burger.setAttribute('aria-expanded',false)})});

  // active link
  var links=$$('#menu a[href^="#"]:not(.btn)');
  var secs=links.map(function(a){return $(a.getAttribute('href'))}).filter(Boolean);
  if('IntersectionObserver' in window){
    var so=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ links.forEach(function(a){a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id)}) } });
    },{rootMargin:'-45% 0px -50% 0px'});
    secs.forEach(function(s){so.observe(s)});
  }

  // reveal
  var rv=$$('.rv');
  if('IntersectionObserver' in window){
    var ro=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');ro.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -40px 0px'});
    rv.forEach(function(el){ro.observe(el)});
  } else rv.forEach(function(el){el.classList.add('in')});

  // card spotlight
  $$('.card').forEach(function(c){
    c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px')});
  });

  // duplicate marquee for seamless loop
  var tr=$('#track'); if(tr) tr.innerHTML+=tr.innerHTML;

  // gold dust canvas
  var cv=$('#dust');
  if(cv && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    var ctx=cv.getContext('2d'), W,H,P=[], N=window.innerWidth<700?28:60, raf;
    function size(){var d=Math.min(window.devicePixelRatio||1,2);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*d;cv.height=H*d;ctx.setTransform(d,0,0,d,0,0)}
    function mk(){return {x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.6+.3,v:Math.random()*.25+.05,a:Math.random()*.5+.15,p:Math.random()*6}}
    size(); for(var i=0;i<N;i++)P.push(mk());
    window.addEventListener('resize',size);
    var vis=true; new IntersectionObserver(function(e){vis=e[0].isIntersecting;if(vis)loop()}).observe(cv);
    function loop(){
      if(!vis)return; ctx.clearRect(0,0,W,H);
      P.forEach(function(q){
        q.y-=q.v; q.p+=.02; q.x+=Math.sin(q.p)*.15;
        if(q.y<-5){q.y=H+5;q.x=Math.random()*W}
        ctx.beginPath(); ctx.arc(q.x,q.y,q.r,0,6.283);
        ctx.fillStyle='rgba(243,215,138,'+(q.a*(.6+.4*Math.sin(q.p)))+')'; ctx.fill();
      });
      raf=requestAnimationFrame(loop);
    }
    loop();
  }

  // prefill contact from buttons
  $$('[data-prefill]').forEach(function(a){
    a.addEventListener('click',function(){
      var t=a.getAttribute('data-prefill'), m=$('#message'), tp=$('#topic');
      if(m) m.value=t+'\n\n';
      if(tp){ tp.value = /RSSN/.test(t)?'RSSN':'Services (ADS)'; }
    });
  });

  // forms (FormSubmit AJAX → Admin@adeboyelash.com)
  $$('.js-form').forEach(function(f){
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var msg=$('.form-msg',f), btn=$('button[type=submit]',f), fd=new FormData(f);
      if(fd.get('_honey')) return;
      fd.append('_subject',f.getAttribute('data-subject')+' | adeboyelash.com');
      fd.append('_template','table'); fd.append('_captcha','false');
      btn.disabled=true; var old=btn.textContent; btn.textContent='Sending...';
      fetch('https://formsubmit.co/ajax/Admin@adeboyelash.com',{method:'POST',body:fd,headers:{'Accept':'application/json'}})
        .then(function(r){return r.json()})
        .then(function(j){
          if(j && (j.success===true||j.success==='true')){ msg.className='form-msg show'; msg.textContent='Thank you. Your message has been sent and we will reply by email.'; f.reset(); }
          else throw new Error('fail');
        })
        .catch(function(){ msg.className='form-msg show err'; msg.textContent='Sorry, that did not send. Please email Admin@adeboyelash.com directly.'; })
        .then(function(){btn.disabled=false;btn.textContent=old});
    });
  });
})();

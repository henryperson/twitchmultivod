(this.webpackJsonptwitchsync=this.webpackJsonptwitchsync||[]).push([[0],{18:function(e,t,n){e.exports=n(37)},23:function(e,t,n){},24:function(e,t,n){},37:function(e,t,n){"use strict";n.r(t);var a=n(0),o=n.n(a),i=n(16),r=n.n(i),c=(n(23),n(2)),s=n(5),l=n(3),u=n(10),d=(n(24),n(17)),f=n.n(d),v=n(6),h=n(4);function m(){var e=Object(u.a)(["ddddddddd"],["\\d\\d\\d\\d\\d\\d\\d\\d\\d"]);return m=function(){return e},e}function p(){var e=Object(u.a)(["(?:(d+)h)?(?:(d+)m)?(?:(d+)s)"],["(?:(\\d+)h)?(?:(\\d+)m)?(?:(\\d+)s)"]);return p=function(){return e},e}var g={bar:function(e){return{background:"#333333",height:e?52:0,display:e?"flex":"none",justifyContent:"center",flexDirection:"row",alignItems:"center"}},buttonContainer:{display:"flex",alignItems:"center"},button:function(e){return{background:"#bdbdbd",color:"#2b2b2b",padding:"1px 5px",fontSize:"13px",borderRadius:"2px",display:"flex",alignItems:"center",justifyContent:"center",pointer:"cursor",WebkitUserSelect:"none",MozUserSelect:"none",MsUserSelect:"none",height:"26px",boxShadow:e?"inset 1px 1px 3px ".concat("#9147ff",", inset -1px -1px 3px ").concat("#9147ff"):""}},link:{color:"#bdbdbd",textDecoration:"none"},control:{margin:"9px",color:"#bdbdbd",WebkitUserSelect:"none",MozUserSelect:"none",MsUserSelect:"none"},playPause:{width:"28px",height:"28px"},seek:{width:"18px",height:"18px"},angle:function(e){return{width:"20px",height:"20px",margin:"9px 9px",WebkitUserSelect:"none",MozUserSelect:"none",MsUserSelect:"none",borderRadius:"4px",padding:"7px",color:e?"black":"white",position:"absolute",right:0,zIndex:2}},textbox:{background:"#cfcfcf",border:"none",outline:"none",borderRadius:"2px"},instructions:{fontSize:"15px",marginTop:"8px"}},y=String.raw(p()),b=new RegExp("".concat(y)),x=String.raw(m()),w=new RegExp("^(".concat(x,")$|.*twitch\\.tv\\/videos\\/(").concat(x,")$")),E=new RegExp("(".concat(x,")(?:\\?t=(").concat(y,"))?"));function j(e){var t,n=Object(l.a)(e);try{for(n.s();!(t=n.n()).done;){if(t.value.playing)return!0}}catch(a){n.e(a)}finally{n.f()}return!1}function k(e){var t=e.match(b);return 1e3*parseInt(t[3])+60*parseInt(t[2])*1e3+60*parseInt(t[1])*60*1e3}function O(e){var t=e,n=Math.floor(t/3600);t-=60*n*60;var a=Math.floor(t/60);return t=Math.round(t-60*a),"".concat(n,"h").concat(a,"m").concat(t,"s")}var S=window.location.pathname.substr(1)+window.location.search;var C=function(){var e=o.a.useState(""),t=Object(s.a)(e,2),n=t[0],a=t[1];o.a.useEffect((function(){fetch("https://id.twitch.tv/oauth2/token?client_id=".concat("fujozw3t5ht1ngho5vofkbw0pbvcmk","&client_secret=").concat("691czpgdus8fzag3lmezyl33rkvsu7","&grant_type=client_credentials"),{method:"POST"}).then((function(e){return e.json()})).then((function(e){return a(e.access_token)}))}),[]);var i=o.a.useState({active:-1,vods:[]}),r=Object(s.a)(i,2),u=r[0],d=r[1],m=o.a.useRef(u.vods);m.current=u.vods;var p=o.a.useRef(u.active);p.current=u.active;var y,b,x=o.a.useState(""),C=Object(s.a)(x,2),T=C[0],R=C[1],I=o.a.useState(!0),z=Object(s.a)(I,2),B=z[0],M=z[1],D=o.a.useState(!0),L=Object(s.a)(D,2),P=L[0],U=L[1],W=o.a.useState(!0),_=Object(s.a)(W,2),A=_[0],N=_[1],G=o.a.useState(!0),H=Object(s.a)(G,2),V=H[0],Y=H[1],$=o.a.useState({show:!1,useTimestamp:!0,url:"",timestamp:""}),J=Object(s.a)($,2),F=J[0],q=J[1],K=o.a.useState(""),Q=Object(s.a)(K,2),X=Q[0],Z=Q[1],ee=o.a.useState(null),te=Object(s.a)(ee,2),ne=te[0],ae=te[1],oe=o.a.useRef();y=oe,b=function(){return q(Object(c.a)({},F,{show:!1}))},o.a.useEffect((function(){var e=function(e){y.current&&!y.current.contains(e.target)&&b(e)};return document.addEventListener("mousedown",e),document.addEventListener("touchstart",e),function(){document.removeEventListener("mousedown",e),document.removeEventListener("touchstart",e)}}),[y,b]);var ie=o.a.useRef(),re=function(e,t,n,a,o){for(var i=e.width,r=e.height-(g.bar(a).height+g.bar(o).height),c={width:300*n,height:300},s=1;s<=t;s++){var l=Math.ceil(t/s);if(r*n/s>i/l){var u=i/l;u>c.width&&(c={width:u,height:u/n})}else{var d=r/s;d>c.height&&(c={width:d*n,height:d})}}return c}(function(){var e=o.a.useState({width:void 0,height:void 0}),t=Object(s.a)(e,2),n=t[0],a=t[1];return o.a.useEffect((function(){function e(){a({width:window.innerWidth,height:window.innerHeight})}return window.addEventListener("resize",e),e(),function(){return window.removeEventListener("resize",e)}}),[]),n}(),u.vods.length,16/9,A,V),ce=function(e){return fetch("https://api.twitch.tv/helix/videos?id=".concat(e),{headers:{Authorization:"Bearer ".concat(n),"Client-Id":"fujozw3t5ht1ngho5vofkbw0pbvcmk"}}).then((function(e){return e.json()})).then((function(t){if(void 0===t.error){var n=t.data[0],a=new Date(n.created_at),i=new Date(a.getTime()+k(n.duration));return{id:e,start:a,end:i,ref:o.a.createRef(),playing:!1,volume:.5,muted:!0,showButtons:!1,buttonTimeoutRef:o.a.createRef(),vodData:n}}Z("API Error: ".concat(t.error,", message: ").concat(t.message," (status: ").concat(t.status,")"))})).catch((function(e){return Z("Error adding video: ".concat(e))}))},se=function(e,t){var n,a=[],o=Object(l.a)(u.vods);try{for(o.s();!(n=o.n()).done;){var i=n.value;if(i.end<e||i.start>e){if(Z("Cannot sync ".concat(i.vodData.user_name," (id ").concat(i.id,")")),t)return}else a.push(i)}}catch(f){o.e(f)}finally{o.f()}for(var r=0,c=a;r<c.length;r++){var s=c[r],d=(e-s.start)/1e3;s.ref.current.seekTo(d,"seconds")}},le=function(){return-1===u.active?O(u.vods[0].ref.current.getCurrentTime()):O(u.vods[u.active].ref.current.getCurrentTime())},ue=function(e){for(var t=window.location.origin,n="",a=-1===u.active?0:u.active,o=0;o<u.vods.length;o++){var i=u.vods[o],r="";e&&o===a&&(r=le()),n=""===r?"".concat(n,"/").concat(i.id):"".concat(n,"/").concat(i.id,"?t=").concat(r)}return"".concat(t).concat(n)};return o.a.useEffect((function(){var e=setInterval((function(){try{if(B){for(var e=!1,t=-1,n=0;n<u.vods.length;n++){var a=u.vods[n].ref.current.getInternalPlayer();if(void 0!==a)a.getMuted()||(e=!0,n!==u.active&&(t=n))}-1!==t?(u.vods[t].muted=!1,-1!==u.active&&(u.vods[u.active].muted=!0),d({active:t,vods:u.vods})):d({active:e?u.active:-1,vods:u.vods})}}catch(X){d({active:-1,vods:m.current}),console.log(X)}}),50);return function(){return clearTimeout(e)}})),o.a.useEffect((function(){if(S&&n){var e,t=S.split("/"),a=null,o=[],i=Object(l.a)(t);try{for(i.s();!(e=i.n()).done;){var r=e.value;if(""!==r){var c=r.match(E);if(null===c)return void Z("Incorrect ID in url: ".concat(r));var s=c[1];if(r.includes("?t=")){if(null===c[2])return void Z("Invalid timestamp here: ".concat(r));if(null!==a)return void Z("URL has multiple timestamps: ".concat(r));a={milliseconds:k(c[2]),id:s}}o.push(ce(s))}}}catch(u){i.e(u)}finally{i.f()}Promise.all(o).then((function(e){if(a){var t,n=new Date(0),o=Object(l.a)(e);try{for(o.s();!(t=o.n()).done;){var i=t.value;i.playing=!0,i.id===a.id&&(n=new Date(i.start.getTime()+a.milliseconds))}}catch(u){o.e(u)}finally{o.f()}ae(n),d({active:0,vods:e})}else d({active:-1,vods:e})}))}}),[n]),o.a.useEffect((function(){if(ne){var e,t=Object(l.a)(u.vods);try{for(t.s();!(e=t.n()).done;){if(null===e.value.ref.current)return}}catch(n){t.e(n)}finally{t.f()}se(ne,!1),ae(null)}}),[u]),o.a.createElement("div",{style:{display:"flex",height:"100vh",width:"100vw",flexDirection:"column",background:"black"}},o.a.createElement("div",{style:Object(c.a)({},g.bar(A))},o.a.createElement("div",{style:{display:"flex",flexGrow:1,flexBasis:0,alignItems:"center"}},o.a.createElement("div",{style:{display:""===X?"none":"flex",alignItems:"center",marginLeft:"10px",marginRight:"10px",padding:"4px",fontSize:"13px",background:"#757575",boxShadow:"0 0 0 1px #b50000",borderRadius:"2px",maxHeight:"".concat(g.bar(!0).height-8,"px"),overflow:"scroll",boxSizing:"border-box"}},o.a.createElement("div",null,X),o.a.createElement(v.a,{icon:h.g,className:"closeError",style:{width:"13px",height:"13px",padding:"3px",marginLeft:"7px",borderRadius:"2px"},onClick:function(){Z("")}}))),o.a.createElement("div",{style:g.buttonContainer},o.a.createElement("input",{type:"text",value:T,onChange:function(e){return R(e.target.value)},size:"50",placeholder:"http://twitch.tv/videos/123456789 or 123456789",style:Object(c.a)({},g.textbox,{paddingLeft:"5px",height:g.button(!1).height})}),o.a.createElement("div",{style:Object(c.a)({},g.button(!1),{marginLeft:"5px"}),onClick:function(){var e=T.match(w);if(null!==e){var t=void 0===e[2]?e[1]:e[2];ce(t).then((function(e){var t=0===u.vods.length;e.muted=!t,d({active:t?0:u.active,vods:u.vods.concat(e)})}))}else Z('Could not parse video from text "'.concat(T,'"'));R("")}},"Add Video"),o.a.createElement("div",{ref:oe,style:{display:"flex",flexDirection:"column",alignItems:"center"}},o.a.createElement("div",{style:Object(c.a)({},g.button(!1),{marginLeft:"5px",position:"relative"}),onClick:function(){0!==u.vods.length?q(Object(c.a)({},F,{url:ue(F.useTimestamp),show:!F.show,timestamp:le()})):Z("You can't share before adding videos!")}},"Share"),o.a.createElement("div",{style:{position:"absolute",display:F.show?"flex":"none",flexDirection:"column",top:g.bar(!0).height+1,background:"#757575",borderRadius:"3px",padding:"4px 3px 3px 10px",zIndex:2}},o.a.createElement("div",{style:{display:"flex",justifyContent:"space-between"}},o.a.createElement("div",{style:{fontSize:"14px"}},"Share"),o.a.createElement(v.a,{icon:h.g,className:"shareButton",style:{width:"18px",height:"18px",padding:"2px",borderRadius:"3px"},onClick:function(){q(Object(c.a)({},F,{show:!1}))}})),o.a.createElement("div",{style:{display:"flex",alignSelf:"center",alignItems:"center",margin:"10px 0px"}},o.a.createElement("input",{ref:ie,type:"text",size:F.url.length>50?F.url.length:50,style:Object(c.a)({},g.textbox,{padding:"5px 2px"}),value:F.url,readOnly:!0}),o.a.createElement(v.a,{icon:h.c,className:"shareButton",style:{width:"18px",height:"18px",marginLeft:"6px",marginRight:"-2px",padding:"6px",borderRadius:"50%"},onClick:function(){ie.current.select(),document.execCommand("copy")}})),o.a.createElement("div",{style:{display:"flex",alignSelf:"center"}},o.a.createElement("input",{type:"checkbox",checked:F.useTimestamp,onChange:function(e){q(Object(c.a)({},F,{useTimestamp:e.target.checked,url:ue(e.target.checked),timestamp:le()}))}}),o.a.createElement("div",{style:{fontSize:"14px"}},"Start at ",F.timestamp))))),o.a.createElement("div",{style:{flexGrow:1,flexBasis:0,display:"flex",justifyContent:"flex-end",alignItems:"center"}},o.a.createElement("a",{href:"https://github.com/henryperson/twitchsync",style:Object(c.a)({},g.link,{marginRight:"20px",fontSize:"14px"})},"Source"),o.a.createElement("a",{href:"https://www.buymeacoffee.com/henryperson",style:Object(c.a)({},g.link,{marginRight:"60px",fontSize:"14px"})},"Buy Me Coffee"))),o.a.createElement(v.a,{className:"showhide",style:Object(c.a)({},g.angle(A),{top:0}),icon:A?h.b:h.a,onClick:function(){return N(!A)}}),o.a.createElement(v.a,{className:"showhide",style:Object(c.a)({},g.angle(V),{bottom:0}),icon:V?h.a:h.b,onClick:function(){return Y(!V)}}),o.a.createElement("div",{style:{flexGrow:1,display:"flex",flexDirection:"row",justifyContent:"center",alignItems:"center",alignContent:"center",flexBasis:0,flexWrap:"wrap",minWidth:"0%"}},0===u.vods.length&&o.a.createElement("div",{style:{color:g.link.color,boxShadow:"0 0 0 1px ".concat(g.link.color),borderRadius:"2px",padding:"15px",display:"flex",flexDirection:"column",alignItems:"flex-start",width:"580px"}},o.a.createElement("div",{style:{alignSelf:"center",marginBottom:"15px",fontSize:g.instructions.fontSize+2}},"Instructions"),o.a.createElement("div",{style:g.instructions},'1. Copy the links or ids of the VODs you want to watch (one at a time) into the text box at the top and click "Add Video".'),o.a.createElement("div",{style:g.instructions},'2. Find a point in a video where you want to watch, and use that video\'s "Sync To This" button to watch all videos at that real time. You can also use "Earliest Sync" to sync all videos to the earliest time where they were all live.'),o.a.createElement("div",{style:g.instructions},'3. Click "Share" to get a link to the set of videos you are watching and (optionally) a timestamp to sync them all to. The timestamp is whichever video is unmuted at the time, and if they\'re all muted it defaults to the first video.'),o.a.createElement("div",{style:g.instructions},"Other controls:"),o.a.createElement("div",{style:g.instructions},o.a.createElement("ul",{style:{paddingLeft:"20px",margin:"6px 0px"}},o.a.createElement("li",null,"Smart mute forces at most one video to be unmuted"),o.a.createElement("li",null,"Smart play forces all videos to pause/play together. You can use it to get a bit more fine grained control over video sync, as it's not perfect."),o.a.createElement("li",null,"Controls at the bottom apply to all videos. The skips go forward/back by 10 seconds."),o.a.createElement("li",null,"The arrows on the top/bottom bars will show/hide those bars, if you want the extra space."))),o.a.createElement("div",{style:g.instructions},"Sorry if it's not perfect, I am limited in annoying ways by the Twitch API. If you notice a bug, feel free to report it ",o.a.createElement("a",{href:"https://github.com/henryperson/twitchsync/issues"},"here"),"."),o.a.createElement("div",{style:g.instructions},"Hope you enjoy!")),u.vods.map((function(e,t){return o.a.createElement("div",{key:t,style:{width:re.width,height:re.height,boxSizing:"border-box",padding:"2px",position:"relative"},onMouseEnter:function(){e.showButtons=!0,d({active:u.active,vods:u.vods}),null!==e.buttonTimeoutRef&&clearTimeout(e.buttonTimeoutRef.current),e.buttonTimeoutRef.current=setTimeout((function(){e.showButtons=!1,d({active:p.current,vods:m.current})}),2e3)}},o.a.createElement("div",{style:{position:"absolute",top:0,right:0,display:"flex",margin:"12px"},onMouseMove:function(){e.showButtons=!0,d({active:u.active,vods:u.vods}),null!==e.buttonTimeoutRef&&clearTimeout(e.buttonTimeoutRef.current),e.buttonTimeoutRef.current=setTimeout((function(){e.showButtons=!1,d({active:p.current,vods:m.current})}),2e3)}},o.a.createElement("div",{style:Object(c.a)({},g.button(!1),{marginRight:"10px",visibility:e.showButtons?"visible":"hidden"}),onClick:function(){var t=e.ref.current.getCurrentTime(),n=new Date(e.start.getTime()+1e3*t);se(n,!1)}},"Sync To This"),o.a.createElement(v.a,{icon:h.g,style:Object(c.a)({},g.button(!1),{width:"16px",height:"16px",padding:"6px",visibility:e.showButtons?"visible":"hidden"}),onClick:function(){null!==e.buttonTimeoutRef&&clearTimeout(e.buttonTimeoutRef.current),u.vods.splice(t,1),d({active:u.active===t?-1:u.active,vods:u.vods})}})),o.a.createElement(f.a,{ref:e.ref,url:"https://www.twitch.tv/videos/"+e.id,width:"100%",height:"100%",controls:!0,config:{twitch:{options:{time:"0h0m0s",autoplay:!1}}},volume:e.volume,muted:e.muted,playing:e.playing,onPlay:function(){if(P){var t,n=Object(l.a)(u.vods);try{for(n.s();!(t=n.n()).done;){t.value.playing=!0}}catch(a){n.e(a)}finally{n.f()}}e.playing=!0,d({active:u.active,vods:u.vods})},onPause:function(){if(P){var t,n=Object(l.a)(u.vods);try{for(n.s();!(t=n.n()).done;){t.value.playing=!1}}catch(a){n.e(a)}finally{n.f()}}e.playing=!1,d({active:u.active,vods:u.vods})},progressInterval:1e3}))}))),o.a.createElement("div",{style:Object(c.a)({},g.bar(V))},o.a.createElement("div",{style:Object(c.a)({},g.buttonContainer,{flex:"1 0 0",justifyContent:"flex-start"})},o.a.createElement("div",{style:Object(c.a)({},g.button(!1),{margin:"10px"}),onClick:function(){if(u.vods.length>0){var e,t=u.vods[0],n=Object(l.a)(u.vods);try{for(n.s();!(e=n.n()).done;){var a=e.value;a.start>t.start&&(t=a)}}catch(o){n.e(o)}finally{n.f()}se(t.start,!0)}}},"Earliest Sync"),o.a.createElement("div",{style:Object(c.a)({},g.button(B),{margin:"10px",width:"95px"}),onClick:function(){return M(!B)}},"Smart Mute ",B?"On":"Off"),o.a.createElement("div",{style:Object(c.a)({},g.button(P),{margin:"10px",width:"95px"}),onClick:function(){return U(!P)}},"Smart Play ",P?"On":"Off")),o.a.createElement("div",{style:g.buttonContainer},o.a.createElement(v.a,{style:Object(c.a)({},g.control,{},g.seek),icon:h.h,onClick:function(){U(!0);var e,t=Object(l.a)(u.vods);try{for(t.s();!(e=t.n()).done;){e.value.playing=!0}}catch(r){t.e(r)}finally{t.f()}d({active:u.active,vods:u.vods});var n,a=Object(l.a)(u.vods);try{for(a.s();!(n=a.n()).done;){var o=n.value,i=o.ref.current.getCurrentTime();o.ref.current.seekTo(i-10)}}catch(r){a.e(r)}finally{a.f()}}}),o.a.createElement(v.a,{style:Object(c.a)({},g.control,{},g.playPause),icon:j(u.vods)?h.d:h.e,onClick:function(){U(!0);var e,t=j(u.vods),n=Object(l.a)(u.vods);try{for(n.s();!(e=n.n()).done;){e.value.playing=!t}}catch(a){n.e(a)}finally{n.f()}d({active:-1===u.active?0:u.active,vods:u.vods})}}),o.a.createElement(v.a,{style:Object(c.a)({},g.control,{},g.seek),icon:h.f,onClick:function(){U(!0);var e,t=Object(l.a)(u.vods);try{for(t.s();!(e=t.n()).done;){e.value.playing=!0}}catch(r){t.e(r)}finally{t.f()}d({active:u.active,vods:u.vods});var n,a=Object(l.a)(u.vods);try{for(a.s();!(n=a.n()).done;){var o=n.value,i=o.ref.current.getCurrentTime();o.ref.current.seekTo(i+10)}}catch(r){a.e(r)}finally{a.f()}}})),o.a.createElement("div",{style:Object(c.a)({},g.buttonContainer,{flex:"1 0 0",justifyContent:"flex-end"})})))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));r.a.render(o.a.createElement(o.a.StrictMode,null,o.a.createElement(C,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))}},[[18,1,2]]]);
//# sourceMappingURL=main.cfc3136c.chunk.js.map
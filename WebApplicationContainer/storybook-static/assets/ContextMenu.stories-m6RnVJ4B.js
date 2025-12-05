import{r as s,R as r}from"./index-D4H_InIO.js";function c({x:m,y:p,onClose:e,children:f}){const o=s.useRef(null);return s.useEffect(()=>{const t=a=>a.key==="Escape"&&(e==null?void 0:e());return window.addEventListener("keydown",t),()=>window.removeEventListener("keydown",t)},[e]),s.useEffect(()=>{const t=a=>{o.current&&!o.current.contains(a.target)&&(e==null||e())};return document.addEventListener("mousedown",t),()=>document.removeEventListener("mousedown",t)},[e]),r.createElement("div",{className:"context-menu",ref:o,style:{left:m,top:p}},f)}c.__docgenInfo={description:"",methods:[],displayName:"ContextMenu"};const E={title:"Components/ContextMenu",component:c},n=()=>r.createElement("div",{style:{position:"relative",height:200}},r.createElement(c,{x:40,y:40},r.createElement("button",{className:"secondary"},"Action")));n.__docgenInfo={description:"",methods:[],displayName:"Default"};var i,d,u;n.parameters={...n.parameters,docs:{...(i=n.parameters)==null?void 0:i.docs,source:{originalSource:`() => <div style={{
  position: 'relative',
  height: 200
}}>
    <ContextMenu x={40} y={40}>
      <button className="secondary">Action</button>
    </ContextMenu>
  </div>`,...(u=(d=n.parameters)==null?void 0:d.docs)==null?void 0:u.source}}};const l=["Default"];export{n as Default,l as __namedExportsOrder,E as default};

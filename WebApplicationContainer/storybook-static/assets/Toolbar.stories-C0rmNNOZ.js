import{R as e}from"./index-D4H_InIO.js";function f({onAddNode:u,onDelete:g,onUndo:b,onRedo:E,canUndo:R,canRedo:h,onImport:k,onExport:s,readOnly:r,onToggleReadOnly:C,onShowShortcuts:N,busy:t=!1,onBackup:y,onRestore:x}){const c=e.useRef(null),i=e.useRef(null),S=()=>{var o;return(o=c.current)==null?void 0:o.click()},v=()=>{var o;return(o=i.current)==null?void 0:o.click()},I=o=>{var a;const n=(a=o.target.files)==null?void 0:a[0];n&&k(n),o.target.value=""},D=o=>{var a;const n=(a=o.target.files)==null?void 0:a[0];n&&x(n),o.target.value=""};return e.createElement("div",{className:"toolbar",role:"toolbar","aria-label":"Graph editor toolbar"},e.createElement("button",{onClick:u,disabled:r||t,title:"Add node (N)"},"+ Node"),e.createElement("button",{onClick:g,disabled:r||t,title:"Delete (Del)"},"Delete"),e.createElement("button",{className:"secondary",onClick:b,disabled:!R||t,title:"Undo (Ctrl+Z)"},"Undo"),e.createElement("button",{className:"secondary",onClick:E,disabled:!h||t,title:"Redo (Ctrl+Y)"},"Redo"),e.createElement("span",{style:{borderLeft:"1px solid var(--border-color)",height:20,margin:"0 8px"}}),e.createElement("button",{className:"secondary",onClick:S,disabled:t,title:"Import JSON"},"Import"),e.createElement("input",{ref:c,type:"file",accept:"application/json",onChange:I,style:{display:"none"}}),e.createElement("button",{className:"secondary",onClick:()=>s({gzip:!1}),disabled:t,title:"Export JSON"},"Export"),e.createElement("button",{className:"secondary",onClick:()=>s({gzip:!0}),disabled:t,title:"Export JSON .gz"},"Export (.gz)"),e.createElement("span",{style:{borderLeft:"1px solid var(--border-color)",height:20,margin:"0 8px"}}),e.createElement("button",{className:"secondary",onClick:C,disabled:t,title:"Toggle read-only"},r?"Read-only":"Editable"),e.createElement("button",{className:"secondary",onClick:N,disabled:t,title:"Keyboard shortcuts"},"Shortcuts"),e.createElement("span",{style:{borderLeft:"1px solid var(--border-color)",height:20,margin:"0 8px"}}),e.createElement("button",{className:"secondary",onClick:y,disabled:t,title:"Manual backup to file"},"Backup"),e.createElement("button",{className:"secondary",onClick:v,disabled:t,title:"Restore from file"},"Restore"),e.createElement("input",{ref:i,type:"file",accept:"application/json,application/gzip",onChange:D,style:{display:"none"}}),t&&e.createElement("span",{"aria-live":"polite",style:{marginLeft:8}},"Working…"))}f.__docgenInfo={description:"",methods:[],displayName:"Toolbar",props:{busy:{defaultValue:{value:"false",computed:!1},required:!1}}};const T={title:"Components/Toolbar",component:f},l={args:{onAddNode:()=>{},onDelete:()=>{},onUndo:()=>{},onRedo:()=>{},canUndo:!1,canRedo:!1,onImport:()=>{},onExport:()=>{},readOnly:!1,onToggleReadOnly:()=>{},onShowShortcuts:()=>{},busy:!1,onBackup:()=>{},onRestore:()=>{}}};var d,p,m;l.parameters={...l.parameters,docs:{...(d=l.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    onAddNode: () => {},
    onDelete: () => {},
    onUndo: () => {},
    onRedo: () => {},
    canUndo: false,
    canRedo: false,
    onImport: () => {},
    onExport: () => {},
    readOnly: false,
    onToggleReadOnly: () => {},
    onShowShortcuts: () => {},
    busy: false,
    onBackup: () => {},
    onRestore: () => {}
  }
}`,...(m=(p=l.parameters)==null?void 0:p.docs)==null?void 0:m.source}}};const U=["Default"];export{l as Default,U as __namedExportsOrder,T as default};

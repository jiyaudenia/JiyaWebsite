import{a as l,e as p}from"/vendor/st-p.rmcdn1.net/e99f4fe4/dist/c/c-SXOSU6ME.js";import{r as a,t as r,x as d}from"/vendor/st-p.rmcdn1.net/e99f4fe4/dist/c/c-VW677BSD.js";import{a as o,i as t,j as s}from"/vendor/st-p.rmcdn1.net/e99f4fe4/dist/c/c-VR5GBYNU.js";import{a as n}from"/vendor/st-p.rmcdn1.net/e99f4fe4/dist/c/c-J44RLTAY.js";var i,b,c=n(()=>{"use strict";d();s();p();i=l.withComponent(r("input")`
  font-family: ${t.fonts.main};
  ${e=>e.ellipsis?`overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;`:""}
  display: block;
  width: 100%;
  background: transparent;
  outline: none;
  resize: none;
  border-radius: 0;
  appearance: none;
  color: inherit;

  &::-webkit-search-cancel-button {
    appearance: none;
  }

  &::placeholder {
    color: ${({theme:e})=>e.colors.gray};
  }

  &:disabled,
  &:disabled::placeholder {
    -webkit-text-fill-color: ${({theme:e})=>e.colors.gray};
    opacity: 1;
  }

  ${a({regular:{padding:"0 0 10px 0",height:20,color:o.black,"&:focus":{borderBottom:`2px solid ${o.black}`}},small:{padding:0,height:40,color:o.black,"&:focus":{padding:"2px 0 0",height:38,borderBottom:`2px solid ${o.black}`}},smallMasked:{padding:0,height:40,color:o.gray,"&:focus":{padding:"2px 0 0",height:38,borderBottom:`2px solid ${o.gray}`}}})};
`);i.defaultProps={variant:"regular",textStyle:"regular",border:"none"};b=i});export{b as a,c as b};

import {
  HighlightStyle,
  syntaxHighlighting,
  tags
} from "./chunk-RVP2WODA.js";
import {
  EditorView
} from "./chunk-VHFF45NK.js";
import "./chunk-QY3IJL2D.js";

// node_modules/cm6-theme-material-dark/dist/index.js
var base00 = "#2e3235";
var base01 = "#505d64";
var base02 = "#606f7a";
var base03 = "#707d8b";
var base04 = "#a0a4ae";
var base05 = "#bdbdbd";
var base06 = "#e0e0e0";
var base07 = "#fdf6e3";
var base_red = "#ff5f52";
var base_deeporange = "#ff6e40";
var base_pink = "#fa5788";
var base_yellow = "#facf4e";
var base_orange = "#ffad42";
var base_cyan = "#56c8d8";
var base_indigo = "#7186f0";
var base_purple = "#cf6edf";
var base_green = "#6abf69";
var base_lightgreen = "#99d066";
var base_teal = "#4ebaaa";
var invalid = base_red;
var darkBackground = "#202325";
var highlightBackground = "#545b61";
var background = base00;
var tooltipBackground = base01;
var selection = base01;
var cursor = base04;
var materialDarkTheme = EditorView.theme({
  "&": {
    color: base05,
    backgroundColor: background
  },
  ".cm-content": {
    caretColor: cursor
  },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: cursor },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": { backgroundColor: selection },
  ".cm-panels": { backgroundColor: darkBackground, color: base03 },
  ".cm-panels.cm-panels-top": { borderBottom: "2px solid black" },
  ".cm-panels.cm-panels-bottom": { borderTop: "2px solid black" },
  ".cm-searchMatch": {
    outline: `1px solid ${base_yellow}`,
    backgroundColor: "transparent"
  },
  ".cm-searchMatch.cm-searchMatch-selected": {
    backgroundColor: highlightBackground
  },
  ".cm-activeLine": { backgroundColor: highlightBackground },
  ".cm-selectionMatch": {
    backgroundColor: darkBackground,
    outline: `1px solid ${base_teal}`
  },
  "&.cm-focused .cm-matchingBracket": {
    color: base06,
    outline: `1px solid ${base_teal}`
  },
  "&.cm-focused .cm-nonmatchingBracket": {
    color: base_red
  },
  ".cm-gutters": {
    backgroundColor: base00,
    borderRight: "1px solid #4f5b66",
    color: base02
  },
  ".cm-activeLineGutter": {
    backgroundColor: highlightBackground,
    color: base07
  },
  ".cm-foldPlaceholder": {
    backgroundColor: "transparent",
    border: "none",
    color: "#ddd"
  },
  ".cm-tooltip": {
    border: "none",
    backgroundColor: tooltipBackground
  },
  ".cm-tooltip .cm-tooltip-arrow:before": {
    borderTopColor: "transparent",
    borderBottomColor: "transparent"
  },
  ".cm-tooltip .cm-tooltip-arrow:after": {
    borderTopColor: tooltipBackground,
    borderBottomColor: tooltipBackground
  },
  ".cm-tooltip-autocomplete": {
    "& > ul > li[aria-selected]": {
      backgroundColor: highlightBackground,
      color: base03
    }
  }
}, { dark: true });
var materialDarkHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: base_purple },
  {
    tag: [tags.name, tags.deleted, tags.character, tags.macroName],
    color: base_cyan
  },
  { tag: [tags.propertyName], color: base_yellow },
  { tag: [tags.variableName], color: base05 },
  { tag: [tags.function(tags.variableName)], color: base_cyan },
  { tag: [tags.labelName], color: base_purple },
  {
    tag: [tags.color, tags.constant(tags.name), tags.standard(tags.name)],
    color: base_yellow
  },
  { tag: [tags.definition(tags.name), tags.separator], color: base_pink },
  { tag: [tags.brace], color: base_purple },
  {
    tag: [tags.annotation],
    color: invalid
  },
  {
    tag: [tags.number, tags.changed, tags.annotation, tags.modifier, tags.self, tags.namespace],
    color: base_orange
  },
  {
    tag: [tags.typeName, tags.className],
    color: base_orange
  },
  {
    tag: [tags.operator, tags.operatorKeyword],
    color: base_indigo
  },
  {
    tag: [tags.tagName],
    color: base_deeporange
  },
  {
    tag: [tags.squareBracket],
    color: base_red
  },
  {
    tag: [tags.angleBracket],
    color: base02
  },
  {
    tag: [tags.attributeName],
    color: base05
  },
  {
    tag: [tags.regexp],
    color: invalid
  },
  {
    tag: [tags.quote],
    color: base_green
  },
  { tag: [tags.string], color: base_lightgreen },
  {
    tag: tags.link,
    color: base_cyan,
    textDecoration: "underline",
    textUnderlinePosition: "under"
  },
  {
    tag: [tags.url, tags.escape, tags.special(tags.string)],
    color: base_yellow
  },
  { tag: [tags.meta], color: base03 },
  { tag: [tags.comment], color: base03, fontStyle: "italic" },
  { tag: tags.monospace, color: base05 },
  { tag: tags.strong, fontWeight: "bold", color: base_red },
  { tag: tags.emphasis, fontStyle: "italic", color: base_lightgreen },
  { tag: tags.strikethrough, textDecoration: "line-through" },
  { tag: tags.heading, fontWeight: "bold", color: base_yellow },
  { tag: tags.heading1, fontWeight: "bold", color: base_yellow },
  {
    tag: [tags.heading2, tags.heading3, tags.heading4],
    fontWeight: "bold",
    color: base_yellow
  },
  {
    tag: [tags.heading5, tags.heading6],
    color: base_yellow
  },
  { tag: [tags.atom, tags.bool, tags.special(tags.variableName)], color: base_cyan },
  {
    tag: [tags.processingInstruction, tags.inserted],
    color: base_red
  },
  {
    tag: [tags.contentSeparator],
    color: base_cyan
  },
  { tag: tags.invalid, color: base02, borderBottom: `1px dotted ${base_red}` }
]);
var materialDark = [
  materialDarkTheme,
  syntaxHighlighting(materialDarkHighlightStyle)
];
export {
  materialDark,
  materialDarkHighlightStyle,
  materialDarkTheme
};
//# sourceMappingURL=cm6-theme-material-dark.js.map

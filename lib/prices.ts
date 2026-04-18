import type { ClientType, ProductCategory } from "./types";

export const PRODUCTS_DIST: ProductCategory[] = [
  {
    cat: "DBM PUTTY",
    items: [
      { name: "DBM PUTTY 0,5 CC", price: 385000 },
      { name: "DBM PUTTY 1,0 CC", price: 635500 },
      { name: "DBM PUTTY 2,5 CC", price: 1435000 },
      { name: "DBM PUTTY 5,0 CC", price: 2805000 },
      { name: "DBM PUTTY 10,0 CC", price: 4645000 },
    ],
  },
  {
    cat: "CHIPS",
    items: [
      { name: "CHIPS 5.0 CC 4-10 MM", price: 905000 },
      { name: "CHIPS 10 CC 4-10 MM", price: 1795000 },
      { name: "CHIPS 15 CC 4-10 MM", price: 2495000 },
      { name: "CHIPS 30 CC 4-10 MM", price: 4495000 },
    ],
  },
  {
    cat: "BLOQUE TRICORTICAL",
    items: [
      { name: "BLOQUE TRICORTICAL 8-15 MM", price: 4725000 },
      { name: "BLOQUE TRICORTICAL 16-19 MM", price: 4725000 },
      { name: "BLOQUE TRICORTICAL 20-29 MM", price: 4725000 },
    ],
  },
  {
    cat: "VIDRIO BIOACTIVO PUTTY",
    items: [
      { name: "VIDRIO BIOACTIVO PUTTY 1.0 CC", price: 1075450 },
      { name: "VIDRIO BIOACTIVO PUTTY 2.5 CC", price: 2275000 },
      { name: "VIDRIO BIOACTIVO PUTTY 5.0 CC", price: 3367000 },
      { name: "VIDRIO BIOACTIVO PUTTY 10 CC", price: 4914000 },
    ],
  },
  {
    cat: "VIDRIO BIOACTIVO CHIPS",
    items: [
      { name: "VIDRIO BIOACTIVO CHIPS 5.0 CC", price: 5460000 },
      { name: "VIDRIO BIOACTIVO CHIPS 10 CC", price: 7280000 },
      { name: "VIDRIO BIOACTIVO CHIPS 15 CC", price: 10313333 },
    ],
  },
  {
    cat: "PARCHE DURAMADRE",
    items: [
      { name: "PARCHE DURAMADRE 2.5x2.5 CM", price: 1174505 },
      { name: "PARCHE DURAMADRE 5.0x5.0 CM", price: 1546900 },
      { name: "PARCHE DURAMADRE 7.5x7.5 CM", price: 2062500 },
      { name: "PARCHE DURAMADRE 10x10 CM", price: 2343800 },
    ],
  },
];

export const PRODUCTS_IPS: ProductCategory[] = [
  {
    cat: "DBM PUTTY",
    items: [
      { name: "DBM PUTTY 0,5 CC", price: 501700 },
      { name: "DBM PUTTY 1,0 CC", price: 816700 },
      { name: "DBM PUTTY 2,5 CC", price: 1866700 },
      { name: "DBM PUTTY 5,0 CC", price: 2959100 },
      { name: "DBM PUTTY 10,0 CC", price: 5536400 },
    ],
  },
  {
    cat: "CHIPS",
    items: [
      { name: "CHIPS 5.0 CC 4-10 MM", price: 1295000 },
      { name: "CHIPS 10 CC 4-10 MM", price: 2250000 },
      { name: "CHIPS 15 CC 4-10 MM", price: 2915000 },
      { name: "CHIPS 30 CC 4-10 MM", price: 4965000 },
    ],
  },
  {
    cat: "BLOQUE TRICORTICAL",
    items: [
      { name: "BLOQUE TRICORTICAL 8-15 MM", price: 6930000 },
      { name: "BLOQUE TRICORTICAL 16-19 MM", price: 6930000 },
      { name: "BLOQUE TRICORTICAL 20-29 MM", price: 6930000 },
    ],
  },
  {
    cat: "VIDRIO BIOACTIVO PUTTY",
    items: [
      { name: "VIDRIO BIOACTIVO PUTTY 1.0 CC", price: 1613175 },
      { name: "VIDRIO BIOACTIVO PUTTY 2.5 CC", price: 3412500 },
      { name: "VIDRIO BIOACTIVO PUTTY 5.0 CC", price: 5050500 },
      { name: "VIDRIO BIOACTIVO PUTTY 10 CC", price: 7371000 },
    ],
  },
  {
    cat: "VIDRIO BIOACTIVO CHIPS",
    items: [
      { name: "VIDRIO BIOACTIVO CHIPS 5.0 CC", price: 8190000 },
      { name: "VIDRIO BIOACTIVO CHIPS 10 CC", price: 10920000 },
      { name: "VIDRIO BIOACTIVO CHIPS 15 CC", price: 15470000 },
    ],
  },
  {
    cat: "PARCHE DURAMADRE",
    items: [
      { name: "PARCHE DURAMADRE 2.5x2.5 CM", price: 1761758 },
      { name: "PARCHE DURAMADRE 5.0x5.0 CM", price: 2320400 },
      { name: "PARCHE DURAMADRE 7.5x7.5 CM", price: 3093800 },
      { name: "PARCHE DURAMADRE 10x10 CM", price: 3515700 },
    ],
  },
];

export const getProducts = (t: ClientType): ProductCategory[] =>
  t === "ips" ? PRODUCTS_IPS : PRODUCTS_DIST;

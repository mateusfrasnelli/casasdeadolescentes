"use client";

import { useEffect, useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";

// GeoJSON público com os estados do Brasil (properties.sigla = UF).
const GEO_URL =
  "https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/brazil-states.geojson";

const ESTADOS_MAPA = ["RS", "SC", "PR", "MS", "MT"];

// A região agora inclui o Mato Grosso inteiro, que é bem mais "alto" (norte-sul)
// que os outros 4 estados. Por isso o mapa ficou num formato mais vertical.
// Se aparecer cortado ou fora do centro, ajuste "center" e "scale" aqui.
const PROJECTION_CONFIG = {
  scale: 1650,
  center: [-54.5, -20.5],
};

const RAIO_MIN = 5;
const RAIO_MAX = 16;

export default function MapaConesul({ pontos }) {
  const [geoData, setGeoData] =

"use client";

import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

// GeoJSON público com os estados do Brasil (properties.sigla = UF).
// Carregado direto pelo navegador — não precisa estar no projeto.
const GEO_URL =
  "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson";

const ESTADOS_CONESUL = ["RS", "SC", "PR", "MS"];

// Se o mapa aparecer cortado ou fora do centro, ajuste "center" e "scale" aqui.
const PROJECTION_CONFIG = {
  scale: 1700,
  center: [-53, -26],
};

export default function MapaConesul({ pontos }) {
  return (
    <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={PROJECTION_CONFIG}
        width={800}
        height={620}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies
              .filter((geo) => ESTADOS_CONESUL.includes(geo.properties.sigla))
              .map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: { fill: "#EAF6F5", stroke: "#0F7173", strokeWidth: 0.75, outline: "none" },
                    hover: { fill: "#D9F0EE", stroke: "#0F7173", strokeWidth: 0.75, outline: "none" },
                    pressed: { fill: "#D9F0EE", stroke: "#0F7173", strokeWidth: 0.75, outline: "none" },
                  }}
                />
              ))
          }
        </Geographies>

        {pontos.map((p) => (
          <Marker key={p.chave} coordinates={[p.lng, p.lat]}>
            <circle r={5} fill="#FF6B5F" stroke="#fff" strokeWidth={1.5} />
            <text
              textAnchor="middle"
              y={-10}
              style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 600, fill: "#1C2333" }}
            >
              {p.nome}
            </text>
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
}

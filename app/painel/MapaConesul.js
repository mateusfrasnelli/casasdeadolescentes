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
  const [geoData, setGeoData] = useState(null);
  const [erro, setErro] = useState(null);
  const [selecionado, setSelecionado] = useState(null);
  const [posicao, setPosicao] = useState({ coordinates: PROJECTION_CONFIG.center, zoom: 1 });
  // Zoom "ao vivo", atualizado a cada instante do gesto (diferente de posicao.zoom,
  // que só atualiza quando o gesto termina). Usado só pra compensar o tamanho
  // das bolinhas em tempo real, sem interferir no resto do mapa.
  const [zoomAoVivo, setZoomAoVivo] = useState(1);

  useEffect(() => {
    let cancelado = false;
    fetch(GEO_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Falha ao buscar o mapa (status ${res.status})`);
        return res.json();
      })
      .then((data) => {
        if (!cancelado) setGeoData(data);
      })
      .catch((err) => {
        if (!cancelado) setErro(err.message || "Não foi possível carregar o mapa.");
      });
    return () => {
      cancelado = true;
    };
  }, []);

  // Tamanho da bolinha proporcional ao nº de adolescentes daquela cidade
  // (escala em raiz quadrada, pra diferença de área ficar visualmente correta).
  const maiorAdolescentes = useMemo(
    () => Math.max(1, ...pontos.map((p) => p.adolescentes || 0)),
    [pontos]
  );
  function raioDoPonto(p) {
    const t = (p.adolescentes || 0) / maiorAdolescentes;
    return RAIO_MIN + Math.sqrt(t) * (RAIO_MAX - RAIO_MIN);
  }

  function zoomIn() {
    setPosicao((pos) => {
      const novoZoom = Math.min(pos.zoom * 1.5, 8);
      setZoomAoVivo(novoZoom);
      return { ...pos, zoom: novoZoom };
    });
  }
  function zoomOut() {
    setPosicao((pos) => {
      const novoZoom = Math.max(pos.zoom / 1.5, 1);
      setZoomAoVivo(novoZoom);
      return { ...pos, zoom: novoZoom };
    });
  }
  function resetZoom() {
    setPosicao({ coordinates: PROJECTION_CONFIG.center, zoom: 1 });
    setZoomAoVivo(1);
  }

  // Memoizado: só recalcula quando o GeoJSON é carregado, não a cada
  // movimento de zoom/pan (senão o mapa "some" no meio do gesto).
  const geoFiltrado = useMemo(() => {
    if (!geoData) return null;
    return {
      type: "FeatureCollection",
      features: geoData.features.filter((f) => ESTADOS_MAPA.includes(f.properties.sigla)),
    };
  }, [geoData]);

  if (erro) {
    return (
      <div className="mapaMensagem mapaErro">
        Não consegui carregar o contorno do mapa agora ({erro}). A lista de casas
        abaixo continua funcionando normalmente.
      </div>
    );
  }

  if (!geoData) {
    return <div className="mapaMensagem">Carregando mapa...</div>;
  }

  return (
    <div className="mapaWrap">
      <div className="mapaControles">
        <button type="button" onClick={zoomIn} aria-label="Aproximar">+</button>
        <button type="button" onClick={zoomOut} aria-label="Afastar">−</button>
        <button type="button" onClick={resetZoom} aria-label="Redefinir zoom">redefinir</button>
      </div>

      {selecionado && (
        <div className="mapaTooltip">
          <button type="button" className="mapaTooltipFechar" onClick={() => setSelecionado(null)}>×</button>
          <div className="mapaTooltipCidade">{selecionado.nome} — {selecionado.uf}</div>
          <div className="mapaTooltipNumeros">
            {selecionado.adolescentes} adolescente{selecionado.adolescentes === 1 ? "" : "s"}
          </div>
        </div>
      )}

      <ComposableMap
        projection="geoMercator"
        projectionConfig={PROJECTION_CONFIG}
        width={760}
        height={900}
        style={{ width: "100%", height: "auto" }}
      >
        <ZoomableGroup
          center={posicao.coordinates}
          zoom={posicao.zoom}
          onMove={({ k }) => setZoomAoVivo(k)}
          onMoveEnd={(pos) => {
            setPosicao(pos);
            setZoomAoVivo(pos.zoom);
          }}
          minZoom={1}
          maxZoom={8}
        >
          <Geographies geography={geoFiltrado}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: { fill: "#EAF6F5", stroke: "#0F7173", strokeWidth: 0.5, outline: "none" },
                    hover: { fill: "#D9F0EE", stroke: "#0F7173", strokeWidth: 0.5, outline: "none" },
                    pressed: { fill: "#D9F0EE", stroke: "#0F7173", strokeWidth: 0.5, outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {pontos.map((p) => (
            <Marker key={p.chave} coordinates={[p.lng, p.lat]}>
              <circle
                r={raioDoPonto(p) / zoomAoVivo}
                fill={selecionado?.chave === p.chave ? "#0F7173" : "#FF6B5F"}
                stroke="#fff"
                strokeWidth={1.5 / zoomAoVivo}
                style={{ cursor: "pointer" }}
                onClick={() => setSelecionado(p)}
                onMouseEnter={() => setSelecionado(p)}
              />
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}

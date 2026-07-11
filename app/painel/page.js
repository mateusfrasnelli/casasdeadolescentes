"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { localizarCidade, ESTADOS_CONESUL, NOME_ESTADO } from "@/lib/geo-utils";

// react-simple-maps só deve rodar no navegador
const MapaConesul = dynamic(() => import("./MapaConesul"), { ssr: false });

export default function PainelPage() {
  const [itens, setItens] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "casas"), orderBy("cidade"));
    const unsub = onSnapshot(q, (snap) => {
      setItens(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  async function handleRemove(id) {
    if (!confirm("Remover esta casa da lista?")) return;
    try {
      await deleteDoc(doc(db, "casas", id));
    } catch (err) {
      alert("Não foi possível remover agora. Tente novamente.");
    }
  }

  const totalAdols = itens.reduce((sum, i) => sum + (Number(i.quantidade) || 0), 0);

  // Associa cada item cadastrado a uma cidade conhecida (uf, lat, lng).
  // Cidades não reconhecidas ficam sem localização (mas continuam contadas).
  const { pontos, porEstado, semLocalizacao } = useMemo(() => {
    const porCidade = new Map(); // chave: "nome|uf" -> { nome, uf, lat, lng, casas, adolescentes }
    const semLoc = [];
    const contagemEstado = Object.fromEntries(ESTADOS_CONESUL.map((uf) => [uf, { casas: 0, adolescentes: 0 }]));

    for (const item of itens) {
      const encontrada = localizarCidade(item.cidade);
      if (!encontrada) {
        semLoc.push(item);
        continue;
      }
      const chave = `${encontrada.nome}|${encontrada.uf}`;
      if (!porCidade.has(chave)) {
        porCidade.set(chave, {
          chave,
          nome: encontrada.nome,
          uf: encontrada.uf,
          lat: encontrada.lat,
          lng: encontrada.lng,
          casas: 0,
          adolescentes: 0,
        });
      }
      const registro = porCidade.get(chave);
      registro.casas += 1;
      registro.adolescentes += Number(item.quantidade) || 0;

      if (contagemEstado[encontrada.uf]) {
        contagemEstado[encontrada.uf].casas += 1;
        contagemEstado[encontrada.uf].adolescentes += Number(item.quantidade) || 0;
      }
    }

    return {
      pontos: Array.from(porCidade.values()),
      porEstado: contagemEstado,
      semLocalizacao: semLoc,
    };
  }, [itens]);

  return (
    <div className="panelPage">
      <div className="container">
        <div className="top">
          <div>
            <div className="eyebrow">Visão geral</div>
            <h1>Casas de Adolescentes</h1>
          </div>
        </div>

        <div className="stats">
          <div className="stat"><div className="num">{itens.length}</div><div className="label">Casas cadastradas</div></div>
          <div className="stat"><div className="num">{totalAdols}</div><div className="label">Adolescentes no total</div></div>
        </div>

        <div className="mapSection">
          <MapaConesul pontos={pontos} />

          <div className="estadosResumo">
            {ESTADOS_CONESUL.map((uf) => (
              <div className="estadoCard" key={uf}>
                <div className="estadoUf">{uf}</div>
                <div className="estadoNome">{NOME_ESTADO[uf]}</div>
                <div className="estadoNumeros">
                  <span>{porEstado[uf].casas} casa{porEstado[uf].casas === 1 ? "" : "s"}</span>
                  <span>{porEstado[uf].adolescentes} adolescente{porEstado[uf].adolescentes === 1 ? "" : "s"}</span>
                </div>
              </div>
            ))}
          </div>

          {semLocalizacao.length > 0 && (
            <div className="semLocalizacao">
              {semLocalizacao.length} cidade{semLocalizacao.length === 1 ? "" : "s"} cadastrada
              {semLocalizacao.length === 1 ? "" : "s"} não {semLocalizacao.length === 1 ? "foi reconhecida" : "foram reconhecidas"} no
              mapa: {semLocalizacao.map((i) => i.cidade).join(", ")}. Continuam contadas nos números acima e na lista abaixo.
            </div>
          )}
        </div>

        <table>
          <thead>
            <tr><th>Cidade</th><th>Adolescentes</th><th>Reunião</th><th></th></tr>
          </thead>
          <tbody>
            {itens.map((item) => (
              <tr key={item.id}>
                <td data-label="Cidade">{item.cidade}</td>
                <td data-label="Adolescentes">{item.quantidade}</td>
                <td data-label="Reunião">
                  <span className={`tag ${item.frequencia === "Semanal" ? "semanal" : "quinzenal"}`}>
                    <span className="dot" />{item.frequencia}
                  </span>
                </td>
                <td data-label="">
                  <button className="del" onClick={() => handleRemove(item.id)}>remover</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {itens.length === 0 && <div className="empty">Nenhuma casa cadastrada ainda.</div>}
        <div className="updated">Lista atualiza automaticamente</div>
      </div>
    </div>
  );
}

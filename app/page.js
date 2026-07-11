"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import cidadesConesul from "@/lib/cidades-conesul.json";

export default function FormPage() {
  const [cidade, setCidade] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [frequencia, setFrequencia] = useState("");
  const [status, setStatus] = useState(null); // { type: 'ok' | 'err', text: string }
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);

    if (!cidade.trim() || !quantidade || !frequencia) {
      setStatus({ type: "err", text: "Preencha cidade, quantidade e a frequência da reunião." });
      return;
    }

    setEnviando(true);
    try {
      await addDoc(collection(db, "casas"), {
        cidade: cidade.trim(),
        quantidade: Number(quantidade),
        frequencia,
        criadoEm: serverTimestamp(),
      });
      setCidade("");
      setQuantidade("");
      setFrequencia("");
      setStatus({ type: "ok", text: "✓ Casa cadastrada com sucesso!" });
    } catch (err) {
      console.error(err);
      setStatus({ type: "err", text: "Não foi possível enviar. Verifique sua conexão e tente novamente." });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="formPage">
      <div className="wrap">
        <div className="eyebrow">Cadastro rápido</div>
        <h1>Casas de Adolescentes</h1>
        <p className="sub">Preencha os dados da sua casa.</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="cidade">Cidade</label>
            <input
              id="cidade"
              type="text"
              list="cidades-lista"
              placeholder="Ex: Foz do Iguaçu"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              autoComplete="off"
            />
            <datalist id="cidades-lista">
              {cidadesConesul.map((c) => (
                <option key={`${c.nome}-${c.uf}`} value={c.nome} />
              ))}
            </datalist>
          </div>

          <div className="field">
            <label htmlFor="quantidade">Quantidade de adolescentes</label>
            <input
              id="quantidade"
              type="number"
              min="1"
              placeholder="Ex: 12"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Reunião</label>
            <div className="freq-options">
              <input
                type="radio"
                name="freq"
                id="semanal"
                checked={frequencia === "Semanal"}
                onChange={() => setFrequencia("Semanal")}
              />
              <label className="opt semanal" htmlFor="semanal">
                <span className="dot" />Semanal
              </label>

              <input
                type="radio"
                name="freq"
                id="quinzenal"
                checked={frequencia === "Quinzenal"}
                onChange={() => setFrequencia("Quinzenal")}
              />
              <label className="opt quinzenal" htmlFor="quinzenal">
                <span className="dot" />Quinzenal
              </label>
            </div>
          </div>

          <button type="submit" disabled={enviando}>
            {enviando ? "Enviando..." : "Enviar"}
          </button>

          {status && <div className={`msg ${status.type}`}>{status.text}</div>}
          {status?.type === "ok" && (
            <div className="again">
              <a onClick={() => setStatus(null)}>Cadastrar outra casa</a>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

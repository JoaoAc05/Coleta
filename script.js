// script.js

const tabelas = {
  Grande: [
    { l: 10, e: 0, cap: 250, rec: 42, tempo: 23.45 },
    { l: 63, e: 0, cap: 1575, rec: 263, tempo: 60.45 },
    { l: 120, e: 0, cap: 3000, rec: 500, tempo: 90.88 },
    { l: 178, e: 0, cap: 4450, rec: 742, tempo: 120.35 },
    { l: 0, e: 10, cap: 150, rec: 25, tempo: 26.38 },
    { l: 0, e: 105, cap: 1575, rec: 263, tempo: 60.45 },
    { l: 0, e: 120, cap: 1800, rec: 300, tempo: 65.38 },
    { l: 0, e: 297, cap: 4455, rec: 743, tempo: 120.45 },
    { l: 5, e: 5, cap: 200, rec: 33, tempo: 27.77 },
    { l: 40, e: 40, cap: 1600, rec: 267, tempo: 61 },
    { l: 60, e: 60, cap: 2400, rec: 400, tempo: 78.3 },
    { l: 111, e: 111, cap: 4440, rec: 740, tempo: 120.15 }
  ],
  Media: [
    { l: 10, e: 0, cap: 250, rec: 21, tempo: 25.67 },
    { l: 126, e: 0, cap: 3150, rec: 263, tempo: 60.45 },
    { l: 120, e: 0, cap: 3000, rec: 250, tempo: 58.78 },
    { l: 356, e: 0, cap: 8900, rec: 742, tempo: 120.35 },
    { l: 0, e: 10, cap: 150, rec: 13, tempo: 24.22 },
    { l: 0, e: 210, cap: 3150, rec: 263, tempo: 60.45 },
    { l: 0, e: 120, cap: 1800, rec: 150, tempo: 45.12 },
    { l: 0, e: 594, cap: 8910, rec: 743, tempo: 120.45 },
    { l: 5, e: 5, cap: 200, rec: 17, tempo: 24.95 },
    { l: 80, e: 80, cap: 3200, rec: 267, tempo: 61 },
    { l: 60, e: 60, cap: 2400, rec: 200, tempo: 52.03 },
    { l: 222, e: 222, cap: 8880, rec: 740, tempo: 120.15 }
  ],
  Pequena: [
    { l: 10, e: 0, cap: 250, rec: 8, tempo: 29.1 },
    { l: 315, e: 0, cap: 7875, rec: 263, tempo: 60.45 },
    { l: 120, e: 0, cap: 3000, rec: 100, tempo: 37.97 },
    { l: 890, e: 0, cap: 22250, rec: 742, tempo: 120.35 },
    { l: 0, e: 10, cap: 150, rec: 5, tempo: 22.82 },
    { l: 0, e: 525, cap: 7875, rec: 263, tempo: 60.45 },
    { l: 0, e: 120, cap: 1800, rec: 60, tempo: 31.97 },
    { l: 0, e: 1485, cap: 22275, rec: 743, tempo: 120.45 },
    { l: 5, e: 5, cap: 200, rec: 7, tempo: 23.13 },
    { l: 200, e: 200, cap: 8000, rec: 267, tempo: 61 },
    { l: 60, e: 60, cap: 2400, rec: 80, tempo: 35 },
    { l: 555, e: 555, cap: 22200, rec: 740, tempo: 120.15 }
  ]
};

export function formatarTempo(minutos) {
  const hrs = Math.floor(minutos / 60);
  const min = Math.floor(minutos % 60);
  const seg = Math.round((minutos - Math.floor(minutos)) * 60);
  return `${hrs}:${min.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`;
}

export function interpolar(tipo, lanca, espada, tabelas) {
  const capacidade = lanca * 25 + espada * 15;
  const lista = tabelas[tipo];
  lista.sort((a, b) => a.cap - b.cap);
  for (let i = 0; i < lista.length - 1; i++) {
    const a = lista[i];
    const b = lista[i + 1];
    if (capacidade >= a.cap && capacidade <= b.cap) {
      const p = (capacidade - a.cap) / (b.cap - a.cap);
      return {
        tipo,
        lanca,
        espada,
        capacidade,
        tempo: a.tempo + p * (b.tempo - a.tempo),
        recurso: a.rec + p * (b.rec - a.rec)
      };
    }
  }
  return null;
}

export function gerarCombinacoes(lanca, espada, tabelas) {
  const combinacoes = [];
  for (const tipo of Object.keys(tabelas)) {
    for (let i = 0; i <= lanca; i++) {
      for (let j = 0; j <= espada; j++) {
        const sim = interpolar(tipo, i, j, tabelas);
        if (sim && sim.recurso > 0 && sim.capacidade <= (i * 25 + j * 15)) {
          combinacoes.push(sim);
        }
      }
    }
  }
  return combinacoes;
}

function gerarParticoes(combinacoes, lancaDisponivel, espadaDisponivel, index = 0, atual = [], resultados = []) {
  if (index >= combinacoes.length) {
    resultados.push([...atual]);
    return;
  }
  gerarParticoes(combinacoes, lancaDisponivel, espadaDisponivel, index + 1, atual, resultados);

  const comb = combinacoes[index];
  if (comb.lanca <= lancaDisponivel && comb.espada <= espadaDisponivel) {
    atual.push(comb);
    gerarParticoes(
      combinacoes,
      lancaDisponivel - comb.lanca,
      espadaDisponivel - comb.espada,
      index + 1,
      atual,
      resultados
    );
    atual.pop();
  }
  return resultados;
}

export function simularOtimo(lancaTotal, espadaTotal, tabelas) {
  const combinacoes = gerarCombinacoes(lancaTotal, espadaTotal, tabelas);
  const todasParticoes = gerarParticoes(combinacoes, lancaTotal, espadaTotal);

  let melhorParticao = null;
  let melhorEficiência = 0;

  for (const particao of todasParticoes) {
    const totalRec = particao.reduce((acc, p) => acc + p.recurso, 0);
    const tempoMax = particao.reduce((max, p) => Math.max(max, p.tempo), 0);
    const eficiencia = totalRec / tempoMax;

    if (eficiencia > melhorEficiência) {
      melhorEficiência = eficiencia;
      melhorParticao = particao;
    }
  }

  let lancaUsadas = melhorParticao.reduce((acc, p) => acc + p.lanca, 0);
  let espadaUsadas = melhorParticao.reduce((acc, p) => acc + p.espada, 0);
  const tempoCiclo = melhorParticao.reduce((max, p) => Math.max(max, p.tempo), 0);
  const totalRec = melhorParticao.reduce((acc, p) => acc + p.recurso, 0);

  return {
    combinacoes: melhorParticao,
    totalRec,
    tempoCiclo,
    eficiencia: melhorEficiência,
    tropasRestantes: {
      lanca: lancaTotal - lancaUsadas,
      espada: espadaTotal - espadaUsadas
    }
  };
}

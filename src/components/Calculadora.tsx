import React, { useState } from "react";

const formatNumber = (value: number): string =>
  new Intl.NumberFormat("pt-BR").format(value);

const parseInput = (value: string): number => {
  const cleaned = value.replace(/\./g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
};

const colors = {
  light: {
    background: "linear-gradient(to bottom right, #e0e7ff, #c7d2fe)",
    card: "#ffffff",
    border: "#e5e7eb",
    inputBg: "#f3f4f6",
    inputBorder: "#d1d5db",
    text: "#111827",
    label: "#1f2937",
    resultBg: "#f3f4f6",
    resultText: "#111827",
    button: "#3b82f6",
    buttonHover: "#2563eb"
  },
  dark: {
    background: "linear-gradient(to bottom right, #1b1f3b, #4b1d63)",
    card: "#111827",
    border: "#374151",
    inputBg: "#1f2937",
    inputBorder: "#374151",
    text: "#f9fafb",
    label: "#e5e7eb",
    resultBg: "#1f2937",
    resultText: "#f9fafb",
    button: "#60a5fa",
    buttonHover: "#3b82f6"
  }
};

const InputGroup = ({
  label,
  prefix = "",
  value,
  onChange,
  theme
}: {
  label: string;
  prefix?: string;
  value: string;
  onChange: (val: string) => void;
  theme: any;
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", marginBottom: 16 }}>
      <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: theme.label }}>
        {label}
      </label>
      <div style={{
        display: "flex",
        alignItems: "center",
        border: `1px solid ${theme.inputBorder}`,
        borderRadius: 12,
        padding: "8px 12px",
        backgroundColor: theme.inputBg
      }}>
        {prefix && <span style={{ marginRight: 8, color: "#6b7280" }}>{prefix}</span>}
        <input
          type="text"
          value={value}
          onChange={(e) => {
            let raw = e.target.value.replace(/[^\d,]/g, "");
            const numeric = raw.replace(/\./g, "").replace(",", ".");
            const num = parseFloat(numeric);
            if (!isNaN(num)) {
              onChange(formatNumber(num).replace(".", ","));
            } else {
              onChange(raw);
            }
          }}
          placeholder="0"
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            backgroundColor: "transparent",
            color: theme.text,
            fontSize: 14
          }}
        />
      </div>
    </div>
  );
};

export default function Calculadora() {
  const [terreno, setTerreno] = useState("0");
  const [casa, setCasa] = useState("0");
  const [frente, setFrente] = useState("0");
  const [resultado, setResultado] = useState(0);
  const [isDark, setIsDark] = useState(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const theme = isDark ? colors.dark : colors.light;

  const calculate = () => {
    const terrenoVal = parseInput(terreno);
    const casaVal = parseInput(casa);
    const frenteVal = parseInput(frente);
    const res = terrenoVal > 0 && casaVal > 0 && frenteVal > 0
      ? (terrenoVal - casaVal) / frenteVal
      : 0;
    setResultado(res);
  };

  const containerStyle = {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "40px 0",
    background: theme.background
  };

  const cardStyle = {
    width: "100%",
    maxWidth: 400,
    padding: 24,
    backgroundColor: theme.card,
    borderRadius: 24,
    boxShadow: isDark
      ? "0 4px 12px rgba(0,0,0,0.5)"
      : "0 4px 12px rgba(0,0,0,0.1)",
    border: `1px solid ${theme.border}`,
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch"
  };

  const titleStyle = {
    fontSize: 24,
    fontWeight: 700,
    color: theme.text,
    marginBottom: 24,
    textAlign: "center"
  };

  const buttonStyle = {
    width: "100%",
    padding: "10px 0",
    backgroundColor: theme.button,
    color: "#ffffff",
    fontWeight: 600,
    fontSize: 16,
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.2s",
    marginTop: 12
  };

  const buttonHoverStyle = {
    backgroundColor: theme.buttonHover
  };

  const resultContainer = {
    marginTop: 24,
    padding: 20,
    backgroundColor: theme.resultBg,
    borderRadius: 16,
    border: `1px solid ${theme.border}`,
    textAlign: "center"
  };

  const resultLabel = {
    fontSize: 14,
    color: theme.label,
    marginBottom: 8
  };

  const resultValue = {
    fontSize: 32,
    fontWeight: 700,
    color: theme.resultText
  };

  const toggleDark = () => setIsDark(!isDark);

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Calculadora de Recuo</h1>

        {/* Toggle Light/Dark */}
        <button
          onClick={toggleDark}
          style={{
            marginBottom: 20,
            padding: "6px 12px",
            borderRadius: 8,
            border: `1px solid ${theme.border}`,
            backgroundColor: theme.card,
            color: theme.text,
            cursor: "pointer"
          }}
        >
          {isDark ? "Modo Light" : "Modo Dark"}
        </button>

        <InputGroup label="Área Total do Terreno" prefix="m²" value={terreno} onChange={setTerreno} theme={theme} />
        <InputGroup label="Área da Casa" prefix="m²" value={casa} onChange={setCasa} theme={theme} />
        <InputGroup label="Frente" prefix="m" value={frente} onChange={setFrente} theme={theme} />

        <button
          style={buttonStyle}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = buttonHoverStyle.backgroundColor}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = buttonStyle.backgroundColor}
          onClick={calculate}
        >
          Calcular
        </button>

        <div style={resultContainer}>
          <p style={resultLabel}>Recuo Necessário:</p>
          <p style={resultValue}>{resultado.toFixed(2).replace(".", ",")} m</p>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import "./Calculator.css";

const Calculator: React.FC = () => {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState<string | number>("");

  const handleClick = (value: string) => {
    if (value === "=") {
      try {
        const evaluated = eval(expression); 
        setResult(evaluated);
      } catch {
        setResult("Error");
      }
    } else if (value === "DEL") {
      setExpression((prev) => prev.slice(0, -1));
    } else {
      setExpression((prev) => prev + value);
    }
  };

  const operatorButtons = ["/", "*", "+", "-", "DEL"];
  const numberButtons = [
    "1", "2", "3",
    "4", "5", "6",
    "7", "8", "9",
    "0", ".", "=",
  ];

  return (
    <div className="calculator">
      <div className="display">
        <div className="result">({result})</div>
        <div className="expression">{expression}</div>
      </div>

      <div className="operators-row">
        {operatorButtons.map((op) => (
          <button key={op} onClick={() => handleClick(op)}>
            {op}
          </button>
        ))}
      </div>

      <div className="buttons">
        {numberButtons.map((btn) => (
          <button key={btn} onClick={() => handleClick(btn)}>
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Calculator;

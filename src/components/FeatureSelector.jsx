import React from "react";

export default function FeatureSelector({ selected, setSelected }) {
  const allFeatures = [
    "WhatsApp",
    "Telegram",
    "Facebook",
    "Instagram",
    "Website chat",
    "AI auto reply",
    "Email API",
  ];

  const available = allFeatures.filter(f => !selected.includes(f));

  const addFeature = (f) => {
    if (!f) return;
    setSelected([...selected, f]);
  };

  const removeFeature = (f) => {
    setSelected(selected.filter(x => x !== f));
  };

  return (
    <div>
      {/* Dropdown list */}
      <select className="form-select" onChange={(e) => addFeature(e.target.value)}>
        <option value="">اختر ميزة لإضافتها</option>
        {available.map((f, i) => (
          <option key={i} value={f}>{f}</option>
        ))}
      </select>

      {/* Selected items*/}
      <div className="mt-2" style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {selected.map((f, i) => (
          <span
            key={i}
            style={{
              background: "#eef",
              padding: "6px 10px",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {f}
            <button
              onClick={() => removeFeature(f)}
              style={{
                marginLeft: "8px",
                border: "none",
                background: "transparent",
                color: "red",
                cursor: "pointer",
                fontSize: "18px",
                lineHeight: "10px",
              }}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {/* Select All */}
      <button
        className="btn btn-secondary mt-3"
        onClick={() => setSelected(allFeatures)}
        style={{ fontSize: "14px" }}
      >
        تحديد الكل
      </button>
    </div>
  );
}

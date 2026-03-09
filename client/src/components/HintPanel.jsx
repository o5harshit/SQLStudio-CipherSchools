import "./HintPanel.scss";

const HintPanel = ({ hint }) => {
  return (
    <div className="hint-panel">
      {hint ? (
        <p className="hint-panel__text">{hint}</p>
      ) : (
        <p className="hint-panel__placeholder">
          Click "Get Hint" to receive guidance without revealing the full answer.
        </p>
      )}
    </div>
  );
};

export default HintPanel;

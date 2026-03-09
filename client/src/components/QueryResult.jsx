import "./QueryResult.scss";

const QueryResult = ({ result }) => {
  if (!result.length) {
    return <p className="query-result__empty">Run a query to see results.</p>;
  }

  const columns = Object.keys(result[0] || {});

  return (
    <div className="query-result">
      <div className="query-result__table-wrapper">
        <table className="query-result__table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.map((row, rowIndex) => (
              <tr key={`result-row-${rowIndex}`}>
                {columns.map((column) => (
                  <td key={`result-cell-${rowIndex}-${column}`}>
                    {String(row[column] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QueryResult;

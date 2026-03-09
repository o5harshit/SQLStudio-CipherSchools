import "./SampleTables.scss";

const SampleTables = ({ tables }) => {
  if (!tables.length) {
    return <p className="sample-tables__empty">No sample tables provided.</p>;
  }

  return (
    <div className="sample-tables">
      {tables.map((table) => (
        <article key={table.tableName} className="sample-tables__table-card">
          <h3 className="sample-tables__table-name">{table.tableName}</h3>

          <div className="sample-tables__meta">
            {table.columns?.map((column) => (
              <span key={`${table.tableName}-${column.columnName}`} className="sample-tables__column-pill">
                {column.columnName}: {column.dataType}
              </span>
            ))}
          </div>

          <div className="sample-tables__table-wrapper">
            <table className="sample-tables__table">
              <thead>
                <tr>
                  {table.columns?.map((column) => (
                    <th key={`${table.tableName}-head-${column.columnName}`}>{column.columnName}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(table.rows || []).map((row, rowIdx) => (
                  <tr key={`${table.tableName}-row-${rowIdx}`}>
                    {table.columns?.map((column) => (
                      <td key={`${table.tableName}-${rowIdx}-${column.columnName}`}>
                        {String(row[column.columnName] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      ))}
    </div>
  );
};

export default SampleTables;

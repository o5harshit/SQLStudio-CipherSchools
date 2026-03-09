import Editor from "@monaco-editor/react";
import "./SqlEditor.scss";

const SqlEditor = ({ query, setQuery }) => {
  return (
    <div className="sql-editor">
      <Editor
        height="260px"
        defaultLanguage="sql"
        theme="vs-dark"
        value={query}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          smoothScrolling: true,
          wordWrap: "on"
        }}
        onChange={(value) => setQuery(value || "")}
      />
    </div>
  );
};

export default SqlEditor;

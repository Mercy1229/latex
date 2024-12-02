

import React, { useEffect, useState } from "react";
import './App.css';

const App = () => {
  const [readableContent, setReadableContent] = useState(""); 
  const [error, setError] = useState(null); 

  useEffect(() => {
    
    fetch("/text.tex")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch LaTeX file: ${response.status} ${response.statusText}`);
        }
        return response.text();
      })
      .then((latexContent) => {
        const parsedContent = parseLatexToReadableText(latexContent); 
        setReadableContent(parsedContent); 
      })
      .catch((err) => {
        console.error("Error processing the LaTeX file:", err);
        setError(err.message);
      });
  }, []);

  const parseLatexToReadableText = (latex) => {
    const cleanedContent = latex
      .replace(/%.*$/gm, "") 
      .replace(/\\usepackage\[.*?\]\{.*?\}/g, "") 
      .replace(/\\documentclass\[.*?\]\{.*?\}/g, "") 
      .replace(/\[.*?\]/g, "") 
      .replace(/\bRGB[0-9,.\s]*\b/g, "") 
      .replace(/\d+(pt|cm|em)/g, "") 
      .replace(/pdftitle=(.*?),/g, "") 
      .replace(/pdfauthor=(.*?),/g, "") 
      .replace(/pdfcreator=(.*?)[,\]]/g, "") 
      .replace(/\\section\{(.*?)\}/g, (_, title) => `<h2>${title}</h2>`)
      .replace(/\\subsection\{(.*?)\}/g, (_, title) => `<h3>${title}</h3>`)
      .replace(/\\begin\{onecolentry\}/g, '<div>')
      .replace(/\\end\{onecolentry\}/g, '<div>')
      .replace(/\\textbf\{(.*?)\}/g, (_, text) => `<strong>${text}</strong>`)
      .replace(/\\href\{(.*?)\}\{(.*?)\}/g, (_, url, text) => `<a href="${url}" target="_blank">${text}</a>`)
      .replace(/\\url\{(.*?)\}/g, (_, url) => `<a href="${url}" target="_blank">${url}</a>`)
      .replace(/\\kern\s*([\d.]+)\s*pt/g, (_, spacing) => `<span style="margin-left: ${spacing}pt;">|</span>`)
      .replace(/\\begin\{itemize\}/g, "<ul>")
      .replace(/\\end\{itemize\}/g, "</ul>")
      .replace(/\\item/g, "<li>")
      .replace(/\\newline|\\\\/g, "<br>")
      .replace(/\\[a-zA-Z]+\*?\{.*?\}/g, "") 
      .replace(/\\[a-zA-Z]+/g, "") 
      .replace(/[\{\}]/g, "") 

      .trim();

    return cleanedContent; 
  };

  return (
    <div>
      <h1>Readable and Editable LaTeX Content</h1>
      {error ? (
        <p style={{ color: "red" }}>Error: {error}</p>
      ) : (
        <div
          style={{
            margin: "20px",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
            minHeight: "200px",
          }}
          className="content"
          contentEditable="true" 
          dangerouslySetInnerHTML={{ __html: readableContent || "Loading..." }}
        />
      )}
    </div>
  );
};

export default App;

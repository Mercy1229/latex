import React, { useEffect, useState } from "react";
import './App.css';

const App = () => {
  const [readableContent, setReadableContent] = useState(""); 
  const [error, setError] = useState(null); 

  useEffect(() => {
    fetch("/Original Tex.tex") 
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch the LaTeX file: ${response.status} ${response.statusText}`);
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
    const locationMatch = latex.match(/\\mbox\{(.*?Location)\}/);
    const location = locationMatch ? locationMatch[1] : '';
    return latex
      // Remove comments and packages
      .replace(/%.*$/gm, "")
      // .replace(/\\usepackage$$.*?$$\{.*?\}/g, "")
      .replace(/\\usepackage\[[^\]]*\]\{[^\}]*\}/g, "")
      .replace(/\\documentclass\[[^\]]*\]\{[^\}]*\}/g, "\\documentclass{article}")
      .replace(/\\newcommand\{\\AND\}[\s\S]*?\\sbox\\ANDbox\{\$\|\$\}/g, '')
      .replace(/\\begin\{header\}[\s\S]*?\\fontsize\{25 pt\}\{25 pt\}/g, '')
      .replace(/\\newcommand\{\\placelastupdatedtext\}[\s\S]*?}%/g, '')
      .replace(/\\documentclass.*?\\begin\{document\}/gs, '')
      .replace(/\\definecolor\{[^\}]*\}\{[^\}]*\}\{[^\}]*\}/g, "")
      .replace(/pdftitle=(.*?),/g, "")
           .replace(/pdfauthor=(.*?),/g, "")
             .replace(/pdfcreator=(.*?)[,\]]/g, "")
             .replace(/\\raggedright/g, "<div class='items-end'>")  
  .replace(/\\AtBeginEnvironment\{adjustwidth\}\{\\partopsep0pt\}/g, "<div>") 
  .replace(/\\pagestyle\{empty\}/g, "<header style='display: none;'></header><footer style='display: none;'></footer>")  // Hide header/footer
  .replace(/\\setcounter\{secnumdepth\}\{0\}/g, "<section style='counter-reset: section;'>")  
  .replace(/\\setlength\{\\parindent\}\{0pt\}/g, "")  
  .replace(/\\setlength\{\\topskip\}\{0pt\}/g, "")  
  .replace(/\\setlength\{\\columnsep\}\{0.15cm\}/g, "")  
  .replace(/\\pagenumbering\{gobble\}/g, "")  
  .replace(/\\titleformat\{\\section\}\{.*?\}\{.*?\}\{.*?\}\{.*?\}\[.*?\]/g, "<style>.section { font-weight: bold; font-size: larger; margin-top: 0.3cm; margin-bottom: 0.2cm; border-bottom: 1px solid; }</style>")  // Format the section with bold, large font, top/bottom spacing, and a border
  .replace(/\\titlespacing\{\\section\}\{.*?\}\{.*?\}\{.*?\}/g, "")
  .replace(/\\newenvironment\{header\}\{.*?\}\{.*?\}/g, "")
      
      .replace(/\\normalsize\s*([\s\S]*?)\\end\{header\}/g, 
        (_, content) => `<div class=' p-5 gap-4 mx-20 text-center'>${location}${content}</div>`)
      
      .replace(/\\section\{(.*?)\}/g, (_, title) => `<h2 class="section-title">${title}</h2>`)
      .replace(/\\subsection\{(.*?)\}/g, (_, title) => `<h3 class="subsection-title">${title}</h3>`)

      // Handle two-column entries
      .replace(/\\begin\{twocolentry\}\{(.*?)\}/g, 
        (_, right) => `<div class="two-col-entry ml-16"><div class="col left">`)
      .replace(/\\end\{twocolentry\}/g, 
        '</div></div>')

      // Handle three-column entries
      .replace(/\\begin\{threecolentry\}\{(.*?)\}\{(.*?)\}/g, 
        '<div class="three-col-entry"><div class="col left">$1</div><div class="col middle">$2</div><div class="col right">')
      .replace(/\\end\{threecolentry\}/g, '</div></div>')

      // Handle one-column entries
      .replace(/\\begin\{onecolentry\}/g, '<div class="one-col-entry">') 
      .replace(/\\end\{onecolentry\}/g, '</div>') 

      // Handle lists
      .replace(/\\begin\{highlights\}/g, '<ul class="highlights">')
      .replace(/\\end\{highlights\}/g, '</ul>')
      .replace(/\\begin\{itemize\}/g, '<ul class="highlights">')
      .replace(/\\end\{itemize\}/g, '</ul>')
      .replace(/\\begin\{enumerate\}/g, '<ol>')
      .replace(/\\end\{enumerate\}/g, '</ol>')
      .replace(/\\item/g, '<li>')
      .replace(/<\/li>\s*<li>/g, '</li><li>')

      // Handle text formatting
      .replace(/\\textbf\{(.*?)\}/g, (_, text) => `<strong>${text}</strong>`)
      .replace(/\\textit\{(.*?)\}/g, (_, text) => `<em>${text}</em>`)
      
      // Handle links
        .replace(/\\href\{(.*?)\}\{(.*?)\}/g, (_, url, text) => `<a href="${url}" target="_blank">${text}</a>`)
              .replace(/\\url\{(.*?)\}/g, (_, url) => `<a href="${url}" target="_blank">${url}</a>`)
      // Handle spacing and separators
      .replace(/\\AND/g, '<span class="separator">|</span>')
      .replace(/\\kern\s*([\d.]+)\s*pt/g, (_, spacing) => 
        `<span style="margin-left: ${spacing}pt;"></span>`)
      .replace(/\\vspace\{(.*?)\}/g, (_, spacing) => 
        `<div class="vspace" style="margin-top: ${spacing};"></div>`)
      
      // Clean up
      .replace(/\\newline|\\\\/g, '<br>')
      .replace(/\s{2,}/g, ' ')
      .replace(/\\[a-zA-Z]+\*?\{.*?\}/g, '')
      .replace(/\\[a-zA-Z]+/g, '')
      .replace(/[\{\}]/g, '')
      .trim();
  };


  
  
  return (
    <div className="container">
      <h1 className="title">CV Preview</h1>
      {error ? (
        <p className="error">Error: {error}</p>
      ) : (
        
          <div 
            className="p-5"
            contentEditable="true" 
            dangerouslySetInnerHTML={{ __html: readableContent || "Loading..." }} 
          />
       
      )}
    </div>
  );
};

export default App;

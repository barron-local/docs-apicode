import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

// Initialize Mermaid with clean, battle-tested native 'dark' theme
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: "'Prompt', 'Inter', system-ui, sans-serif",
  fontSize: 14,
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: 'basis'
  },
  themeVariables: {
    darkMode: true,
    background: 'transparent',
    primaryColor: '#1e293b',
    primaryTextColor: '#f8fafc',
    primaryBorderColor: '#38bdf8',
    lineColor: '#60a5fa',
    secondaryColor: '#1e293b',
    secondaryTextColor: '#f8fafc',
    secondaryBorderColor: '#818cf8',
    tertiaryColor: '#0f172a',
    tertiaryTextColor: '#f8fafc',
    tertiaryBorderColor: '#475569',
    noteBkgColor: '#1e293b',
    noteTextColor: '#f8fafc',
    noteBorderColor: '#38bdf8',
    edgeLabelBackground: '#0b0f19',
    clusterBkg: 'rgba(15, 23, 42, 0.75)',
    clusterBorder: '#334155',
    titleColor: '#38bdf8'
  }
});

interface MermaidChartProps {
  chart: string;
}

export function MermaidChart({ chart }: MermaidChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const renderChart = async () => {
      if (!containerRef.current) return;
      try {
        const id = 'mermaid-' + Math.random().toString(36).substring(2, 9);
        const { svg } = await mermaid.render(id, chart);
        if (isMounted && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        console.error('Mermaid rendering failed', err);
        if (isMounted && containerRef.current) {
          containerRef.current.innerHTML = `<pre class="mermaid-error">${chart}</pre>`;
        }
      }
    };
    renderChart();
    return () => {
      isMounted = false;
    };
  }, [chart]);

  return (
    <div className="mermaid-wrapper">
      <div className="mermaid-container" ref={containerRef} />
    </div>
  );
}

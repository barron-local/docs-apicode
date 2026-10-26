import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

// Initialize Mermaid with a rich custom Dark Theme matching our Slate & Indigo aesthetic
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  securityLevel: 'loose',
  fontFamily: "'JetBrains Mono', 'Prompt', 'Inter', monospace",
  themeVariables: {
    darkMode: true,
    background: '#0d111a',
    primaryColor: '#1e2638',
    primaryTextColor: '#f8fafc',
    primaryBorderColor: '#38bdf8',
    lineColor: '#60a5fa',
    secondaryColor: '#1a2234',
    secondaryTextColor: '#e2e8f0',
    secondaryBorderColor: '#6366f1',
    tertiaryColor: '#141a28',
    tertiaryTextColor: '#cbd5e1',
    tertiaryBorderColor: '#334155',
    noteBkgColor: '#161d2d',
    noteTextColor: '#f8fafc',
    noteBorderColor: '#38bdf8',
    actorBkg: '#1e2638',
    actorTextColor: '#f8fafc',
    actorLineColor: '#60a5fa',
    signalColor: '#60a5fa',
    signalTextColor: '#f8fafc',
    labelBoxBkgColor: '#1e2638',
    labelTextColor: '#f8fafc',
    edgeLabelBackground: '#0d111a',
    clusterBkg: 'rgba(20, 27, 45, 0.65)',
    clusterBorder: '#2e3d5e',
    titleColor: '#38bdf8',
    nodeBorder: '#38bdf8',
    nodeTextColor: '#f8fafc',
    mainBkg: '#161d2d'
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

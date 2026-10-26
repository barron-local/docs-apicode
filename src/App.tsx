import { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  Download,
  Terminal,
  FileCode,
  Layers,
  Server,
  Globe,
  GitBranch,
  Play,
  CheckCircle2,
  TableOfContents
} from 'lucide-react';
import sectionsData from './sectionsData.json';
import { MarkdownRenderer } from './MarkdownRenderer';

interface Section {
  id: string;
  title: string;
  content: string;
}

export function App() {
  const [sections] = useState<Section[]>(sectionsData.sections);
  const [activeId, setActiveId] = useState<string>(sectionsData.sections[0]?.id || 'intro');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Monitor scroll for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter sections by search query
  const filteredSections = sections.filter((s) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      s.title.toLowerCase().includes(query) ||
      s.content.toLowerCase().includes(query)
    );
  });

  const activeIndex = sections.findIndex((s) => s.id === activeId);
  const activeSection = sections[activeIndex] || sections[0];

  const handleSelectSection = (id: string) => {
    setActiveId(id);
    setMobileMenuOpen(false);
    if (viewMode === 'all') {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveId(sections[activeIndex - 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (activeIndex < sections.length - 1) {
      setActiveId(sections[activeIndex + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([sectionsData.fullMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'DEVELOPMENT_STEP_BY_STEP.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Helper icon for each step
  const getSectionIcon = (id: string, index: number) => {
    switch (id) {
      case 'intro':
        return <BookOpen size={16} />;
      case 'toc':
        return <TableOfContents size={16} />;
      case 'step-1-arch':
        return <Layers size={16} />;
      case 'step-2-env':
        return <Terminal size={16} />;
      case 'step-3-backend':
        return <Server size={16} />;
      case 'step-4-test':
        return <CheckCircle2 size={16} />;
      case 'step-5-frontend':
        return <FileCode size={16} />;
      case 'step-6-docker':
        return <Layers size={16} />;
      case 'step-7-caddy':
        return <Globe size={16} />;
      case 'step-8-gitlab':
        return <GitBranch size={16} />;
      case 'step-9-deploy':
        return <Play size={16} />;
      case 'step-10-summary':
        return <TableOfContents size={16} />;
      default:
        return <span className="nav-step-num">{index}</span>;
    }
  };

  return (
    <div className="app-layout">
      {/* Mobile Sidebar Overlay Backdrop */}
      {mobileMenuOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-badge">
            <BookOpen size={13} />
            <span>Developer Docs</span>
          </div>
          <div className="brand-title">Fullstack DevOps Guide</div>
          <div className="search-box-wrapper">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="ค้นหาขั้นตอน, คำสั่ง หรือโค้ด..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <nav className="sidebar-nav">
          {filteredSections.map((sec, idx) => {
            const isActive = activeId === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                className={`nav-item-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleSelectSection(sec.id)}
              >
                {getSectionIcon(sec.id, idx + 1)}
                <span>{sec.title}</span>
              </button>
            );
          })}
          {filteredSections.length === 0 && (
            <div style={{ padding: '16px', color: '#64748b', fontSize: '13px' }}>
              ไม่พบผลลัพธ์การค้นหาสำหรับ &quot;{searchQuery}&quot;
            </div>
          )}
        </nav>

        <div className="sidebar-footer">
          <span>100% Complete Source Code</span>
          <span>v1.0.0</span>
        </div>
      </aside>

      {/* Main Area */}
      <div className="main-wrapper">
        {/* Top Navbar */}
        <header className="top-navbar">
          <div className="navbar-left">
            <button
              className="menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="breadcrumbs">
              <span>คู่มือการพัฒนา</span>
              <span>/</span>
              <span className="current">
                {viewMode === 'all' ? 'เนื้อหาทั้งหมด (Scroll View)' : activeSection.title}
              </span>
            </div>
          </div>

          <div className="navbar-actions">
            <button
              type="button"
              className={`action-btn ${viewMode === 'all' ? 'primary' : 'secondary'}`}
              onClick={() => setViewMode(viewMode === 'single' ? 'all' : 'single')}
              title="สลับโหมดการแสดงผล"
            >
              <Layers size={14} />
              <span>{viewMode === 'all' ? 'โหมดทีละขั้นตอน' : 'ดูเนื้อหาทั้งหมด'}</span>
            </button>

            <button
              type="button"
              className="action-btn secondary"
              onClick={handleDownloadMarkdown}
              title="ดาวน์โหลดไฟล์ Markdown ฉบับเต็ม"
            >
              <Download size={14} />
              <span>Export .md</span>
            </button>
          </div>
        </header>

        {/* Content Container */}
        <main className="content-container">
          {/* Hero Banner on top */}
          <section className="doc-hero">
            <div className="hero-tag">Official Fullstack Guide</div>
            <h1 className="hero-title">
              คู่มือขั้นตอนการพัฒนาโปรเจกต์ Fullstack DevOps & Web Application แบบสมบูรณ์
            </h1>
            <p className="hero-desc">
              รวบรวมคำอธิบาย โครงสร้างโฟลเดอร์ คำสั่ง Command-line และ Source Code ฉบับเต็ม 100%
              ทุกไฟล์โดยไม่ตัดทอน จัดทำในรูปแบบเอกสารเชิงวิศวกรรมที่อ่านง่าย คัดลอกโค้ดได้ทันที
            </p>
          </section>

          {/* Render Sections */}
          {viewMode === 'all' ? (
            // View All Sections stacked
            sections.map((sec, idx) => (
              <article key={sec.id} id={sec.id} className="section-article">
                <div className="section-badge-bar">
                  <span className="step-indicator">
                    ส่วนที่ {idx + 1} จาก {sections.length}
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{sec.id}</span>
                </div>
                <MarkdownRenderer content={sec.content} />
              </article>
            ))
          ) : (
            // View Single Selected Section
            <article className="section-article" id={activeSection.id}>
              <div className="section-badge-bar">
                <span className="step-indicator">
                  ขั้นตอนที่ {activeIndex + 1} จาก {sections.length}
                </span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{activeSection.id}</span>
              </div>
              <MarkdownRenderer content={activeSection.content} />

              {/* Step Navigation Pagination */}
              <div className="step-pagination">
                <button
                  type="button"
                  className="page-nav-btn"
                  onClick={handlePrev}
                  disabled={activeIndex === 0}
                >
                  <ChevronLeft size={16} />
                  <span>ขั้นตอนก่อนหน้า</span>
                </button>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  {activeIndex + 1} / {sections.length}
                </span>
                <button
                  type="button"
                  className="page-nav-btn"
                  onClick={handleNext}
                  disabled={activeIndex === sections.length - 1}
                >
                  <span>ขั้นตอนถัดไป</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </article>
          )}
        </main>
      </div>

      {/* Floating Back-to-Top Button */}
      {showBackToTop && (
        <button
          type="button"
          className="back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="ขึ้นด้านบน"
        >
          <ArrowUp size={18} />
        </button>
      )}
    </div>
  );
}

export default App;

import React, { useState, useEffect, useRef } from 'react';
import { bookService } from '../../api/api';
import { useNavigate } from 'react-router-dom';
import './VirtualBookshelf.css';
import Swal from 'sweetalert2';

// Professional Demo Books
const demoBooksList = [
    { id: 'demo-1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', imageUrl: 'https://via.placeholder.com/250x350/1a1668/ffffff?text=Gatsby', createdAt: '2024-01-01', hidden: false },
    { id: 'demo-2', title: '1984', author: 'George Orwell', imageUrl: 'https://via.placeholder.com/250x350/ff3b30/ffffff?text=1984', createdAt: '2024-02-01', hidden: false },
    { id: 'demo-3', title: 'To Kill a Mockingbird', author: 'Harper Lee', imageUrl: 'https://via.placeholder.com/250x350/00aeff/ffffff?text=Mockingbird', createdAt: '2024-03-01', hidden: false },
    { id: 'demo-4', title: 'The Art of War', author: 'Sun Tzu', imageUrl: 'https://via.placeholder.com/250x350/333333/00ffcc?text=Art+of+War', createdAt: '2024-04-01', hidden: false },
    { id: 'demo-5', title: 'Digital Fortress', author: 'Dan Brown', imageUrl: 'https://via.placeholder.com/250x350/a1887f/ffffff?text=Digital+Fortress', createdAt: '2024-05-01', hidden: false }
];

function VirtualBookshelf() {
    const navigate = useNavigate();
    const [view, setView] = useState('library');
    const [books, setBooks] = useState([]);
    const [originalBooks, setOriginalBooks] = useState([]);
    const [currentBook, setCurrentBook] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSortedNewest, setIsSortedNewest] = useState(true);
    const logoInputRef = useRef(null);

    // Multi-Bookshelf State
    const [bookshelves, setBookshelves] = useState([
        { id: 1, name: 'Main Bookshelf', description: 'My primary collection.', isFolded: false, theme: 'glass' }
    ]);
    const [activeBookshelfId, setActiveBookshelfId] = useState(1);
    
    const [logoUrl, setLogoUrl] = useState('https://bookland.dexignzone.com/react/demo/static/media/logo.64188701.png');
    const [menuVisibility, setMenuVisibility] = useState({ logo: true, title: true, search: true, share: true });
    const [activeSection, setActiveSection] = useState('info');

    const sidebarSections = [
        { id: 'info', title: 'Bookshelf info', icon: 'fa-solid fa-circle-info' },
        { id: 'manage', title: 'Manage flipbooks', icon: 'fa-solid fa-square-plus' },
        { id: 'position', title: 'Books position', icon: 'fa-solid fa-up-down-left-right' },
        { id: 'design', title: 'Design', icon: 'fa-solid fa-palette' },
        { id: 'logo', title: 'Add logo', icon: 'fa-solid fa-image' },
        { id: 'menu', title: 'Menu', icon: 'fa-solid fa-bars' }
    ];

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await bookService.getMyBooks();
                let fetchedBooks = response.data && response.data.length > 0 ? response.data : demoBooksList;
                fetchedBooks = fetchedBooks.map(b => ({ ...b, hidden: b.hidden || false, createdAt: b.createdAt || new Date().toISOString() }));
                setBooks(fetchedBooks);
                setOriginalBooks(fetchedBooks);
                if (fetchedBooks.length > 0) setCurrentBook(fetchedBooks[0]);
            } catch (error) {
                setBooks(demoBooksList);
                setOriginalBooks(demoBooksList);
                setCurrentBook(demoBooksList[0]);
            }
        };
        fetchBooks();
    }, []);

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (upload) => setLogoUrl(upload.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleReadBook = (book) => {
        navigate(`/read-book/${book.id}`, { state: { theme: activeShelf.theme } });
    };

    const handleSearch = (query) => { setSearchQuery(query); applyFilters(query, isSortedNewest); };
    const toggleSort = () => { const n = !isSortedNewest; setIsSortedNewest(n); applyFilters(searchQuery, n); };
    const applyFilters = (query, newestFirst) => {
        let filtered = [...originalBooks];
        if (query) filtered = filtered.filter(b => b.title.toLowerCase().includes(query.toLowerCase()));
        filtered.sort((a, b) => newestFirst ? new Date(b.createdAt) - new Date(a.createdAt) : new Date(a.createdAt) - new Date(b.createdAt));
        setBooks(filtered);
    };

    const toggleVisibility = (id) => {
        const up = originalBooks.map(b => b.id === id ? { ...b, hidden: !b.hidden } : b);
        setOriginalBooks(up);
        setBooks(up);
    };

    const moveBook = (index, direction) => {
        const n = [...books];
        const t = direction === 'up' ? index - 1 : index + 1;
        if (t < 0 || t >= n.length) return;
        [n[index], n[t]] = [n[t], n[index]];
        setBooks(n); setOriginalBooks(n);
    };

    const addNewBookshelf = () => {
        const newId = Date.now();
        setBookshelves([...bookshelves, { id: newId, name: `New Bookshelf ${bookshelves.length + 1}`, description: '...', isFolded: false, theme: 'glass' }]);
        setActiveBookshelfId(newId);
    };

    const removeBookshelf = (id) => {
        if (bookshelves.length === 1) return;
        Swal.fire({ title: 'Remove Bookshelf?', icon: 'warning', showCancelButton: true }).then(r => {
            if (r.isConfirmed) {
                const n = bookshelves.filter(s => s.id !== id);
                setBookshelves(n);
                if (activeBookshelfId === id) setActiveBookshelfId(n[0].id);
            }
        });
    };

    const updateActiveShelf = (updates) => {
        setBookshelves(prev => prev.map(s => s.id === activeBookshelfId ? { ...s, ...updates } : s));
    };

    const activeShelf = bookshelves.find(s => s.id === activeBookshelfId) || bookshelves[0];

    const renderLibrary = () => {
        const visibleBooks = books.filter(b => !b.hidden);
        if (visibleBooks.length === 0) return <div className="text-center p-5"><h3>No books visible</h3></div>;
        const totalRegularShelves = Math.max(2, Math.ceil((visibleBooks.length - 1) / 4));

        return (
            <div className="library-view animate__animated animate__fadeIn">
                <div className="shelf-group hero-shelf-group">
                    <div className="hero-shelf-container">
                        <div className="hero-shelf-layout d-flex align-items-center justify-content-center gap-4">
                            <div className="hero-text text-start">
                                <h2 className="hero-book-title fw-bold"><i className="fa-solid fa-bookmark me-3 opacity-25"></i>{visibleBooks[0].title}</h2>
                                <button className="btn btn-sm btn-outline-primary mt-3 px-3 rounded-pill" onClick={() => handleReadBook(visibleBooks[0])}>Read</button>
                            </div>
                            <div className="bookshelf-book hero-book-main" onClick={() => handleReadBook(visibleBooks[0])}><img src={visibleBooks[0].imageUrl} alt="" /></div>
                        </div>
                    </div>
                    <div className={`shelf ${activeShelf.theme}`}></div>
                </div>
                {Array.from({ length: totalRegularShelves }).map((_, si) => (
                    <div key={si} className="shelf-group mt-5">
                        <div className="book-row">{visibleBooks.slice(1 + si * 4, 1 + (si + 1) * 4).map(b => (
                            <div key={b.id} className="book-with-header">
                                <div className="book-top-info px-2 py-1 mb-2 small fw-bold text-truncate" style={{maxWidth: '90px', fontSize: '0.65rem'}}>{b.title}</div>
                                <div className="bookshelf-book" onClick={() => handleReadBook(b)}><img src={b.imageUrl} alt="" /></div>
                            </div>
                        ))}</div>
                        <div className={`shelf ${activeShelf.theme}`}></div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className={`bookshelf-container theme-${activeShelf.theme}`}>
            <div className="bookshelf-sidebar">
                <div className="sidebar-header-new">
                    <h5 className="text-white fw-bold mb-3">BOOKSHELVES</h5>
                    <button className="btn btn-primary w-100 mb-4 rounded-pill" onClick={addNewBookshelf}>ADD NEW</button>
                </div>
                <div className="bookshelf-list-container px-2">
                    {bookshelves.map(shelf => (
                        <div key={shelf.id} className={`bookshelf-item-active mb-3 ${activeBookshelfId === shelf.id ? 'active-shelf' : ''}`}>
                            <div className="item-info p-3 d-flex justify-content-between align-items-center cursor-pointer" onClick={() => setActiveBookshelfId(shelf.id)}>
                                <div><small className="text-muted d-block" style={{fontSize: '0.6rem'}}>BOOKSHELF {shelf.id}</small><span className="fw-bold">{shelf.name}</span></div>
                                <i className={`fa-solid fa-chevron-${shelf.isFolded ? 'down' : 'up'} text-muted`} onClick={(e) => { e.stopPropagation(); setBookshelves(p => p.map(s => s.id === shelf.id ? {...s, isFolded: !s.isFolded} : s)) }}></i>
                            </div>
                            {!shelf.isFolded && activeBookshelfId === shelf.id && (
                                <div className="shelf-expanded-content p-2">
                                    <div className="sidebar-accordion">
                                        {sidebarSections.map(section => (
                                            <div key={section.id} className={`accordion-item-custom ${activeSection === section.id ? 'active' : ''}`}>
                                                <div className="accordion-header-custom" onClick={() => setActiveSection(activeSection === section.id ? '' : section.id)}>
                                                    <i className={section.icon}></i>
                                                    <strong className="ms-2 text-white">{section.title}</strong>
                                                    <i className={`fa-solid fa-chevron-${activeSection === section.id ? 'up' : 'down'} ms-auto small opacity-50`}></i>
                                                </div>
                                                {activeSection === section.id && (
                                                    <div className="accordion-body-custom p-3 bg-dark bg-opacity-25 rounded mb-2 animate__animated animate__fadeIn">
                                                        {section.id === 'info' && (
                                                            <>
                                                                <input type="text" className="form-control form-control-sm bg-dark text-white border-secondary mb-2" value={shelf.name} onChange={(e) => updateActiveShelf({name: e.target.value})} />
                                                                <textarea className="form-control form-control-sm bg-dark text-white border-secondary" rows="2" value={shelf.description} onChange={(e) => updateActiveShelf({description: e.target.value})} />
                                                            </>
                                                        )}
                                                        {section.id === 'manage' && (
                                                            <>
                                                                <div className="form-check form-switch small mb-3">
                                                                    <input className="form-check-input" type="checkbox" checked={isSortedNewest} onChange={toggleSort} /><label className="form-check-label text-white fw-bold ms-2">Newest first</label>
                                                                </div>
                                                                <div className="mini-book-list" style={{maxHeight: '180px', overflowY: 'auto'}}>
                                                                    {books.map(b => (
                                                                        <div key={b.id} className="d-flex align-items-center justify-content-between mb-3 px-1 border-bottom border-secondary pb-2">
                                                                            <span className="small text-truncate flex-grow-1" style={{fontSize: '0.8rem', color: '#fff'}}>{b.title}</span>
                                                                            <input className="form-check-input" type="checkbox" checked={!b.hidden} onChange={() => toggleVisibility(b.id)} />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </>
                                                        )}
                                                        {section.id === 'position' && (
                                                            <div className="mini-book-list" style={{maxHeight: '180px', overflowY: 'auto'}}>
                                                                {books.filter(b => !b.hidden).map((b, i) => (
                                                                    <div key={b.id} className="d-flex align-items-center justify-content-between mb-3 px-1 border-bottom border-secondary pb-2">
                                                                        <span className="small text-truncate flex-grow-1" style={{fontSize: '0.8rem', color: '#fff'}}>{b.title}</span>
                                                                        <div className="d-flex gap-3">
                                                                            <i className="fa-solid fa-chevron-up orange-text cursor-pointer" onClick={() => moveBook(i, 'up')}></i>
                                                                            <i className="fa-solid fa-chevron-down orange-text cursor-pointer" onClick={() => moveBook(i, 'down')}></i>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {section.id === 'logo' && <button className="btn btn-sm btn-primary w-100 rounded-pill" onClick={() => logoInputRef.current.click()}>Upload Logo</button>}
                                                        {section.id === 'design' && <div className="theme-thumbs-grid">{['glass', 'wood', 'carbon'].map(t => <div key={t} className={`theme-thumb ${activeShelf.theme === t ? 'active' : ''}`} onClick={() => updateActiveShelf({theme: t})}><div className={`${t}-preview`}></div></div>)}</div>}
                                                        {section.id === 'menu' && (
                                                            <div className="menu-visibility-list">
                                                                {Object.keys(menuVisibility).map(key => (
                                                                    <div key={key} className="form-check d-flex align-items-center justify-content-between mb-3 px-1">
                                                                        <label className="form-check-label text-capitalize text-white fw-bold" style={{fontSize: '0.9rem'}}>{key}</label>
                                                                        <input className="form-check-input" type="checkbox" checked={menuVisibility[key]} onChange={() => setMenuVisibility({...menuVisibility, [key]: !menuVisibility[key]})} />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <button className="btn btn-outline-danger btn-sm w-100 rounded-pill mt-2" onClick={() => removeBookshelf(shelf.id)}><i className="fa-solid fa-trash me-2"></i>Remove</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <input type="file" ref={logoInputRef} className="d-none" onChange={handleLogoUpload} />

            <main className="bookshelf-main">
                <header className="main-header d-flex justify-content-between align-items-center mb-5 p-3 rounded-pill bg-white bg-opacity-10 shadow">
                    <div className="d-flex align-items-center gap-3">
                        {menuVisibility.logo && <img src={logoUrl} alt="" style={{maxHeight: '30px'}} />}
                        {menuVisibility.title && <h5 className="mb-0 fw-bold">{activeShelf.name}</h5>}
                    </div>
                    <div className="d-flex gap-4">
                        {menuVisibility.search && <i className="fa-solid fa-search cursor-pointer"></i>}
                        {menuVisibility.share && <i className="fa-solid fa-share-nodes cursor-pointer"></i>}
                    </div>
                </header>
                {view === 'library' ? renderLibrary() : (
                    <div className="reader-view-container animate__animated animate__fadeIn">
                        <div className="reader-toolbar mb-4 d-flex justify-content-between align-items-center p-3 bg-dark rounded shadow">
                            <button className="btn btn-link text-white text-decoration-none" onClick={() => setView('library')}><i className="fa-solid fa-arrow-left me-2"></i> Back to Library</button>
                            <h4 className="mb-0 text-white">{currentBook?.title}</h4>
                        </div>
                        <div className="reader-spread">
                            <div className="reader-page left p-5"><h1 className="fw-bold mb-4">{currentBook?.title}</h1><p className="lead">{currentBook?.description || 'Interactive digital reading experience.'}</p></div>
                            <div className="reader-page right p-5 text-center"><img src={currentBook?.imageUrl || 'https://via.placeholder.com/250x350'} alt="" className="img-fluid rounded shadow-lg" style={{maxHeight: '350px'}} /></div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default VirtualBookshelf;



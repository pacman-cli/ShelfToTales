import React, { useState, useEffect, useRef } from 'react';
import { bookService, bookshelfService } from '../../api/api';
import { useNavigate } from 'react-router-dom';
import './VirtualBookshelf.css';
import Swal from 'sweetalert2';
import logoImage from '../../assets/images/logo.png';

// Professional Demo Books (fallback if API fails)
const FALLBACK_IMG = 'https://picsum.photos/seed';
const demoBooksList = [
    { id: 'demo-1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', imageUrl: `${FALLBACK_IMG}/gatsby/250/350`, createdAt: '2024-01-01', hidden: false },
    { id: 'demo-2', title: '1984', author: 'George Orwell', imageUrl: `${FALLBACK_IMG}/1984/250/350`, createdAt: '2024-02-01', hidden: false },
    { id: 'demo-3', title: 'To Kill a Mockingbird', author: 'Harper Lee', imageUrl: `${FALLBACK_IMG}/mockingbird/250/350`, createdAt: '2024-03-01', hidden: false },
    { id: 'demo-4', title: 'The Art of War', author: 'Sun Tzu', imageUrl: `${FALLBACK_IMG}/war/250/350`, createdAt: '2024-04-01', hidden: false },
    { id: 'demo-5', title: 'Digital Fortress', author: 'Dan Brown', imageUrl: `${FALLBACK_IMG}/fortress/250/350`, createdAt: '2024-05-01', hidden: false }
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
    const [bookshelves, setBookshelves] = useState([]);
    const [activeBookshelfId, setActiveBookshelfId] = useState(null);
    const [loadingShelves, setLoadingShelves] = useState(true);
    
    const [logoUrl, setLogoUrl] = useState(logoImage);
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
                const [booksRes, shelvesRes] = await Promise.all([
                    bookService.getMyBooks(),
                    bookshelfService.getAll().catch(() => ({ data: [] }))
                ]);
                const data = booksRes.data?.content || booksRes.data || [];
                let fetchedBooks = data.length > 0 ? data.map(b => ({
                    id: b.id?.toString() || Math.random().toString(),
                    title: b.title || 'Untitled',
                    author: b.author || 'Unknown',
                    imageUrl: b.coverUrl || `${FALLBACK_IMG}/${(b.title || 'book').replace(/\s+/g, '-')}/250/350`,
                    createdAt: b.publishedDate || new Date().toISOString().split('T')[0],
                    hidden: false,
                })) : demoBooksList;
                setBooks(fetchedBooks);
                setOriginalBooks(fetchedBooks);
                if (fetchedBooks.length > 0) setCurrentBook(fetchedBooks[0]);

                const shelfData = shelvesRes.data || [];
                if (shelfData.length > 0) {
                    setBookshelves(shelfData.map(s => ({ ...s, isFolded: false, description: '' })));
                    setActiveBookshelfId(shelfData[0].id);
                } else {
                    const defaultShelf = { id: 1, name: 'Main Bookshelf', description: '', isFolded: false, theme: 'glass' };
                    setBookshelves([defaultShelf]);
                    setActiveBookshelfId(1);
                }
            } catch (error) {
                setBooks(demoBooksList);
                setOriginalBooks(demoBooksList);
                setCurrentBook(demoBooksList[0]);
                const defaultShelf = { id: 1, name: 'Main Bookshelf', description: '', isFolded: false, theme: 'glass' };
                setBookshelves([defaultShelf]);
                setActiveBookshelfId(1);
            } finally {
                setLoadingShelves(false);
            }
        };
        fetchBooks();
    }, []);

    useEffect(() => {
        return () => { if (saveShelfRef.current) clearTimeout(saveShelfRef.current); };
    }, []);

    const saveShelfRef = useRef(null);
    const saveShelf = (id, updates) => {
        if (saveShelfRef.current) clearTimeout(saveShelfRef.current);
        saveShelfRef.current = setTimeout(async () => {
            try {
                const res = await bookshelfService.update(id, updates);
                return res.data;
            } catch (err) {
                console.error('Failed to save shelf:', err);
                return null;
            }
        }, 500);
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (upload) => setLogoUrl(upload.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleReadBook = (book) => {
        setCurrentBook(book);
        setView('reader');
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

    const addNewBookshelf = async () => {
        try {
            const res = await bookshelfService.create({ name: `New Bookshelf ${bookshelves.length + 1}` });
            const newShelf = { ...res.data, isFolded: false, description: '' };
            setBookshelves([...bookshelves, newShelf]);
            setActiveBookshelfId(newShelf.id);
        } catch (err) {
            Swal.fire('Error', 'Failed to create bookshelf', 'error');
        }
    };

    const removeBookshelf = async (id) => {
        if (bookshelves.length === 1) return;
        Swal.fire({ title: 'Remove Bookshelf?', icon: 'warning', showCancelButton: true }).then(async (r) => {
            if (r.isConfirmed) {
                try {
                    await bookshelfService.delete(id);
                    const n = bookshelves.filter(s => s.id !== id);
                    setBookshelves(n);
                    if (activeBookshelfId === id) setActiveBookshelfId(n[0].id);
                } catch (err) {
                    Swal.fire('Error', 'Failed to delete bookshelf', 'error');
                }
            }
        });
    };

    const updateActiveShelf = (updates) => {
        setBookshelves(prev => prev.map(s => s.id === activeBookshelfId ? { ...s, ...updates } : s));
        if (activeBookshelfId) saveShelf(activeBookshelfId, updates);
    };

    const activeShelf = bookshelves.find(s => s.id === activeBookshelfId) || bookshelves[0] || { theme: 'glass', name: 'Bookshelf' };

    if (loadingShelves) {
        return (
            <div className="bookshelf-container theme-glass d-flex align-items-center justify-content-center" style={{minHeight: '100vh'}}>
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status"><span className="visually-hidden">Loading...</span></div>
                    <p className="text-muted">Loading your bookshelves...</p>
                </div>
            </div>
        );
    }

    const renderLibrary = () => {
        const visibleBooks = books.filter(b => !b.hidden);
        if (visibleBooks.length === 0) return <div className="text-center p-5"><h3>No books visible</h3></div>;
        const totalRegularShelves = Math.max(2, Math.ceil((visibleBooks.length - 1) / 4));

        return (
            <div className="library-view animate__animated animate__fadeIn">
                <div className="shelf-group hero-shelf-group">
                    <div className="hero-shelf-container">
                        <div className="hero-shelf-layout d-flex align-items-center justify-content-center gap-4 flex-wrap">
                            <div className="hero-text text-start" style={{minWidth: '200px', maxWidth: '350px'}}>
                                <h2 className="hero-book-title fw-bold" style={{wordBreak: 'break-word', fontSize: '1.5rem'}}><i className="fa-solid fa-bookmark me-3 opacity-25"></i>{visibleBooks[0].title}</h2>
                                <p className="text-muted small mb-1">by {visibleBooks[0].author}</p>
                                <button className="btn btn-sm btn-outline-primary mt-2 px-3 rounded-pill" onClick={() => handleReadBook(visibleBooks[0])}>Read</button>
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
                                <div className="book-top-info px-2 py-1 mb-2 small fw-bold" style={{maxWidth: '90px', fontSize: '0.7rem', color: '#333', textAlign: 'center', lineHeight: '1.2', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{b.title}</div>
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
                    <div className="reader-view-layout-wrapper animate__animated animate__fadeIn">
                        {/* Middle Part: Reader Content */}
                        <div className="reader-content-area" style={{ background: '#ffffff', color: '#000000', minHeight: '100%' }}>
                            <div className="d-flex align-items-center mb-5">
                                <button className="btn btn-link text-dark text-decoration-none p-0 me-4" onClick={() => setView('library')}>
                                    <i className="fa-solid fa-arrow-left"></i>
                                </button>
                                <div>
                                    <h4 className="fw-bold mb-0" style={{ color: '#000000' }}>{currentBook?.title}</h4>
                                    <span className="small text-muted text-uppercase">By {currentBook?.author}</span>
                                </div>
                                <div className="ms-auto d-flex gap-4 align-items-center text-muted">
                                    <i className="fa-solid fa-font cursor-pointer"></i>
                                    <i className="fa-solid fa-book-open cursor-pointer"></i>
                                    <i className="fa-solid fa-ellipsis-vertical cursor-pointer"></i>
                                </div>
                            </div>

                            <div className="text-center mb-5">
                                <img src={currentBook?.imageUrl} alt="" className="img-fluid rounded shadow-lg mb-5" style={{ maxWidth: '300px' }} />
                            </div>

                            <div className="reader-text mx-auto" style={{ maxWidth: '700px', fontSize: '1.2rem', lineHeight: '1.8', color: '#000000' }}>
                                <p><span className="display-4 fw-bold float-start me-3" style={{ lineHeight: '0.8', color: '#000000' }}>T</span>he air in the Silent Library did not just carry silence; it carried the weight of a thousand unspoken thoughts. {currentBook?.author} moved his candle along the shelf, the flickering flame dancing across the spines of books that had not been opened in centuries. These were the Whispering Manuscripts—rare volumes rumored to contain the very echoes of their authors' final moments.</p>
                                <p>He stopped at a shelf made of dark, petrified oak. There, bound in silver-threaded silk, lay the journal of the last Archivist. As Elias reached out, a soft murmur seemed to fill the room, like the distant sound of waves crashing against a shore of glass. It wasn't sound, precisely, but a vibration in his marrow.</p>
                                <p>"Do you hear them too?" a voice asked from the shadows. Elias didn't startle; he had expected company. In the Silent Library, one was never truly alone.</p>
                            </div>

                            <div className="d-flex justify-content-between align-items-center mt-5 pt-5 pb-5 mb-5">
                                <button className="btn btn-link text-dark text-decoration-none fw-bold" style={{ color: '#000000' }}><i className="fa-solid fa-chevron-left me-2"></i> Previous</button>
                                <div className="d-flex flex-column align-items-center gap-2">
                                    <span className="small text-muted">Page 114 of 342</span>
                                    <div className="progress" style={{ width: '200px', height: '4px' }}>
                                        <div className="progress-bar bg-dark" style={{ width: '33%' }}></div>
                                    </div>
                                </div>
                                <button className="btn btn-link text-dark text-decoration-none fw-bold" style={{ color: '#000000' }}>Next <i className="fa-solid fa-chevron-right ms-2"></i></button>
                            </div>
                        </div>

                        {/* Bottom Controls */}
                        <div className="reader-bottom-controls" style={{ position: 'sticky', bottom: 0, zIndex: 100, background: '#f8f9fa', borderTop: '1px solid #dee2e6' }}>
                            <div className="d-flex align-items-center gap-3">
                                <div className="bg-warning rounded-circle p-2 text-white">
                                    <i className="fa-solid fa-music"></i>
                                </div>
                                <div>
                                    <span className="small text-muted text-uppercase fw-bold" style={{ fontSize: '0.6rem' }}>Lofi Study Session</span>
                                    <h6 className="mb-0 fw-bold" style={{ color: '#000000' }}>Coffee Shop Ambience - 2:45</h6>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-4 text-dark fs-5">
                                <i className="fa-solid fa-backward-step cursor-pointer"></i>
                                <i className="fa-solid fa-pause cursor-pointer fs-3"></i>
                                <i className="fa-solid fa-forward-step cursor-pointer"></i>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <i className="fa-solid fa-volume-high text-muted"></i>
                                <div className="progress" style={{ width: '100px', height: '4px' }}>
                                    <div className="progress-bar bg-dark" style={{ width: '60%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default VirtualBookshelf;



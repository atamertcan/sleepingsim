import React, { useState, useEffect, useCallback } from 'react';


// API Adresi
const API_BASE_URL = 'http://localhost:8080/api';


const LoginScreen = ({ setView, setCurrentUser, displayMessage }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Oturum verilerini localStorage'a kaydeder
    const saveSession = (user) => {
        localStorage.setItem('user_id', user.id);
        localStorage.setItem('username', user.username);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            displayMessage('Lütfen kullanıcı adı ve şifreyi giriniz.', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error('Giriş başarısız. Kullanıcı adı veya şifre hatalı olabilir.');
            }

            const data = await response.json();

            if (data.success) {
                saveSession(data.user); 
                setCurrentUser(data.user);
                displayMessage('Giriş başarılı! Kontrol Paneline yönlendiriliyorsunuz.', 'success');
            } else {
                displayMessage(data.message || 'Giriş başarısız.', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            displayMessage(error.message || 'Giriş yapılırken bir hata oluştu. Sunucuyu kontrol edin.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h2 className="title">Giriş Yap</h2>
            <form onSubmit={handleLogin} className="form">
                <input
                    type="text"
                    placeholder="Kullanıcı Adı"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    className="input"
                    aria-label="Kullanıcı Adı"
                />
                <input
                    type="password"
                    placeholder="Şifre"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="input"
                    aria-label="Şifre"
                />
                <button type="submit" disabled={isLoading} className="button primary-button">
                    {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                </button>
            </form>
            <p className="link-text">
                Üye değil misiniz?{' '}
                <button onClick={() => setView('signup')} className="link-button" disabled={isLoading}>
                    Hemen Üye Ol
                </button>
            </p>
        </div>
    );
};

/**
 * Kullanıcı Kayıt Ekranı
 */
const SignupScreen = ({ setView, displayMessage }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            displayMessage('Lütfen kullanıcı adı ve şifreyi giriniz.', 'error');
            return;
        }
        if (password.length < 4) {
             displayMessage('Şifre en az 4 karakter olmalıdır.', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error('Kayıt yapılırken bir hata oluştu. Kullanıcı adı zaten kullanılıyor olabilir.');
            }

            const newUser = await response.json(); 

            displayMessage(`${newUser.username} başarıyla kaydedildi! Şimdi giriş yapabilirsiniz.`, 'success');
            setView('login');
        } catch (error) {
            console.error('Signup error:', error);
            displayMessage(error.message || 'Kayıt yapılırken bir hata oluştu.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h2 className="title">Yeni Üyelik</h2>
            <form onSubmit={handleSignup} className="form">
                <input
                    type="text"
                    placeholder="Kullanıcı Adı"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    className="input"
                    aria-label="Kullanıcı Adı"
                />
                <input
                    type="password"
                    placeholder="Şifre (min 4 karakter)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="input"
                    aria-label="Şifre"
                />
                <button type="submit" disabled={isLoading} className="button primary-button">
                    {isLoading ? 'Kaydediliyor...' : 'Kayıt Ol'}
                </button>
            </form>
            <p className="link-text">
                Zaten üye misiniz?{' '}
                <button onClick={() => setView('login')} className="link-button" disabled={isLoading}>
                    Giriş Yap
                </button>
            </p>
        </div>
    );
};

/**
 * Kontrol Paneli Ekranı
 */
const DashboardScreen = ({ currentUser, handleLogout, displayMessage, setView }) => {
    const [score, setScore] = useState(currentUser.score || 0);
    const [isLoading, setIsLoading] = useState(false);

    const fetchScore = useCallback(async () => {
        if (!currentUser || !currentUser.id) {
            return;
        }

        setIsLoading(true);
        try {
            const timestamp = new Date().getTime();
            const url = `${API_BASE_URL}/dashboard/${currentUser.id}?t=${timestamp}`;

            const response = await fetch(url, { cache: 'no-store' }); 

            if (!response.ok) {
                 console.error("Skor çekilemedi, sunucu hatası: ", response.status);
                 throw new Error('Skor çekilirken bir hata oluştu.');
            }

            const data = await response.json();
            setScore(data.score);

        } catch (error) {
            console.error('Score fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]); 

    // Skorun otomatik olarak yenilenmesi (Auto-Refresh)
    useEffect(() => {
        fetchScore();
        const intervalId = setInterval(fetchScore, 5000); 
        return () => clearInterval(intervalId);
    }, [fetchScore]);

    return (
        <div className="dashboard-container">
            <h2 className="title">Kontrol Paneli</h2>
            <div className="score-card">
                <p className="welcome-text">Hoş geldin, <span className="username-highlight">{currentUser.username}</span>!</p>
                <div className="score-area">
                    <p className="score-label">Güncel Uyku Skoru:</p>
                    <p className={`score-value ${isLoading ? 'loading' : ''}`}>
                        {isLoading ? '...' : score}
                    </p>
                </div>
            </div>
            
            <button 
                onClick={() => setView('leaderboard')} 
                className="button primary-button"
                style={{margin: '10px 0'}}>
                🏆 En Yüksek Skorları Gör
            </button>
            
            <p className="info-text">
                Skorunuz, arka planda çalışan Python istemcisi tarafından güncellenmektedir.
                Skor, her 5 saniyede bir otomatik olarak yenilenir.
            </p>
            <button onClick={handleLogout} className="button secondary-button">
                Çıkış Yap
            </button>
        </div>
    );
};


/**
Lider Tablosu Ekranı
 */
const LeaderboardScreen = ({ setView, displayMessage }) => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchLeaderboard = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/leaderboard`);

            if (!response.ok) {
                throw new Error('Lider tablosu çekilemedi. Sunucu hatası.');
            }
            
            const data = await response.json();
            setLeaderboard(data);

        } catch (error) {
            console.error('Leaderboard fetch error:', error);
            displayMessage(error.message || 'Lider tablosu çekilirken bir hata oluştu.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [displayMessage]);

    // Bileşen yüklendiğinde lider tablosunu çek
    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    return (
        <div className="leaderboard-container form-container">
            <h2 className="title">🏆 Lider Tablosu (Top 10)</h2>

            {isLoading ? (
                <p className="info-text">Yükleniyor...</p>
            ) : leaderboard.length === 0 ? (
                <p className="info-text">Henüz görüntülenecek bir skor yok.</p>
            ) : (
                <ol className="leaderboard-list">
                    {leaderboard.map((entry, index) => (
                        <li key={index} className="leaderband-item">
                            <span className="leaderboard-rank">#{index + 1}</span>
                            <span className="leaderboard-username">{entry.username}</span>
                            <span className="leaderboard-score">{entry.score} Puan</span>
                        </li>
                    ))}
                </ol>
            )}

            <button 
                onClick={() => setView('dashboard')} 
                className="button secondary-button"
                style={{marginTop: '20px'}}>
                Kontrol Paneline Geri Dön
            </button>
        </div>
    );
};


/**
 * Ana Uygulama Bileşeni (App.jsx)
 */
export default function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [view, setView] = useState('login');
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState('info');
    const [isSessionChecked, setIsSessionChecked] = useState(false);

    const displayMessage = useCallback((text, type = 'info') => {
        setMessage(text);
        setMessageType(type);
        const timer = setTimeout(() => setMessage(null), 4000);
        return () => clearTimeout(timer);
    }, []);

    const clearSession = () => {
        localStorage.removeItem('user_id');
        localStorage.removeItem('username');
    };

    const handleLogout = useCallback(() => {
        setCurrentUser(null);
        setView('login');
        clearSession(); 
        displayMessage('Başarıyla çıkış yaptınız.', 'info');
    }, [displayMessage]);

    useEffect(() => {
        const storedId = localStorage.getItem('user_id');
        const storedUsername = localStorage.getItem('username');

        if (storedId && storedUsername) {
            const userFromStorage = {
                id: parseInt(storedId, 10),
                username: storedUsername,
            };
            setCurrentUser(userFromStorage);
            setView('dashboard');
        }
        setIsSessionChecked(true); 
    }, []);

    useEffect(() => {
        if (currentUser && view !== 'leaderboard') { 
            setView('dashboard');
        } else if (!currentUser && view !== 'signup' && isSessionChecked) { 
            setView('login');
        }
    }, [currentUser, view, isSessionChecked]);

    const renderScreen = () => {
        if (!isSessionChecked) {
            return <div className="info-text">Oturum kontrol ediliyor...</div>;
        }
        
        if (currentUser) {
            switch(view) {
                case 'leaderboard':
                    return <LeaderboardScreen setView={setView} displayMessage={displayMessage} />;
                case 'dashboard':
                default:
                    return <DashboardScreen 
                                currentUser={currentUser} 
                                handleLogout={handleLogout} 
                                displayMessage={displayMessage}
                                setView={setView}
                           />;
            }
        }

        switch (view) {
            case 'signup':
                return <SignupScreen setView={setView} displayMessage={displayMessage} />;
            case 'login':
            default:
                return <LoginScreen setView={setView} setCurrentUser={setCurrentUser} displayMessage={displayMessage} />;
        }
    };

    return (
        <div className="app-background">
            <div className="main-content-area">
                <header className="app-header">
                     <div className="logo-icon" aria-hidden="true">🛌</div>
                    <h1>Sleeping Sim Takip Sistemi</h1>
                </header>
                {message && (
                    <div className={`message-box ${messageType}`}>
                        {message}
                    </div>
                )}
                <main className="screen-wrapper">
                    {renderScreen()}
                </main>
            </div>
            <footer className="app-footer">
                <p>&copy; 2025 Sleeping Sim Project</p>
            </footer>
        </div>
    );
}


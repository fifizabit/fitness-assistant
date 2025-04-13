import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [tgUser, setTgUser] = useState(null);

  useEffect(() => {
    const tg = window.Telegram.WebApp;

    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
      setTgUser(tg.initDataUnsafe.user);
      tg.ready();
      tg.expand();
    } else {
      setTgUser({ id: 'не в Telegram', first_name: 'Гость' });
    }
  }, []);

  return (
    <div className="App">
      <h1>Добро пожаловать в HealthPulse</h1>
      {tgUser && (
        <div>
          <p>Привет, {tgUser.first_name}!</p>
          <p>Твой Telegram ID: {tgUser.id}</p>
        </div>
      )}
    </div>
  );
}

export default App;

fetch('http://localhost:3001/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'find me some birthday cakes', id: '1' }
    ]
  })
}).then(res => res.text()).then(console.log).catch(console.error);

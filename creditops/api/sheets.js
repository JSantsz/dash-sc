export default async function handler(req, res) {
  const { id, gid } = req.query;
  if (!id || !gid) return res.status(400).send('Parâmetros id e gid obrigatórios');
  const url = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!response.ok) return res.status(response.status).send(`Erro: ${response.statusText}`);
    const text = await response.text();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=300');
    res.status(200).send(text);
  } catch (err) {
    res.status(500).send(`Erro: ${err.message}`);
  }
}

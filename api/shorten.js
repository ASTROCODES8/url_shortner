export default async function handler(request, response) {
  
    if (request.method !== 'POST') {
        return response.status(405).json({ message: 'Only POST requests are allowed' });
    }
    const { longUrl } = request.body;
    if (!longUrl) {
        return response.status(400).json({ message: 'URL is required' });
    }
    const apiKey = process.env.TINYURL_API_KEY;    
    try {
        const apiResponse = await fetch('https://api.tinyurl.com/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({ url: longUrl, domain: 'tiny.one' })
        });

        const data = await apiResponse.json();
        if (!apiResponse.ok) {
            return response.status(apiResponse.status).json({ message: data.errors.join(', ') });
        }
        return response.status(200).json({ shortUrl: data.data.tiny_url });

    } catch (error) {
        return response.status(500).json({ message: 'Internal Server Error' });
    }
}

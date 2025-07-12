import express from 'express';
import { createClient } from 'contentful';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const client = createClient({
  space: process.env.CONTENTFUL_SPACE,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
});

app.get('/og/article/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const entry = await client.getEntry(id);
    const { title, description, coverImage } = entry.fields;

    const descriptionText = description?.content
      ?.map(block => block.content?.[0]?.value || '')
      .join(' ')
      .slice(0, 160);

    const imageUrl = coverImage?.fields?.file?.url
      ? `https:${coverImage.fields.file.url}`
      : 'https://www.independentpress.com/default-og-image.jpg';

    const articleUrl = `https://www.independentpress.com/article/${id}`;

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <meta property="og:title" content="${title}" />
        <meta property="og:description" content="${descriptionText}" />
        <meta property="og:image" content="${imageUrl}" />
        <meta property="og:url" content="${articleUrl}" />
        <meta name="twitter:card" content="summary_large_image" />
      </head>
      <body>
        Redirecting to the article...
        <script>window.location.href = "${articleUrl}"</script>
      </body>
      </html>
    `;

    res.set('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error('Error fetching article:', err.message);
    res.status(404).send('Article not found');
  }
});

app.get('/', (req, res) => {
  res.send('OG Preview Server is running');
});

app.listen(3000, () => {
  console.log('Server is running at http://localhost:3000');
});

export default app;

/**
 * Twitter/X syndication API から個別ツイートの本文・ハッシュタグ・メディア情報を取得する
 * （認証不要。RSS由来の本文は「…」で途中省略されることがあるため、正確な本文取得に使用）
 */

export async function fetchTweetDetails(tweetId, { retries = 2 } = {}) {
  const url = `https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&token=a`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(10000),
      });

      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
        continue;
      }
      if (!res.ok) return null;

      const data = await res.json();
      if (!data || data.__typename === "TweetTombstone") return null;

      return {
        text: data.text ?? "",
        hashtags: (data.entities?.hashtags ?? []).map((h) => h.text),
        mediaCount: (data.mediaDetails ?? []).length,
      };
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  return null;
}

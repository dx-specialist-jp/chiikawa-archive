/**
 * Tally（https://tally.so）フォームの回答をREST APIから取得するための共通ヘルパー
 */

const API_BASE = "https://api.tally.so";

/**
 * 指定フォームの全回答（ページング込み）を取得する
 * 戻り値: { questions: [...], submissions: [...] }
 *   questions は最初のページのレスポンスに含まれるものを採用する（フォーム構造は全ページ共通のため）
 */
export async function fetchAllSubmissions(apiKey, formId) {
  const submissions = [];
  let questions = [];
  let page = 1;

  for (;;) {
    const res = await fetch(`${API_BASE}/forms/${formId}/submissions?page=${page}&limit=100`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "User-Agent": "chiikawa-archive/1.0",
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      throw new Error(`Tally API エラー: ${res.status} ${res.statusText} (form ${formId})`);
    }

    const data = await res.json();
    if (page === 1) questions = data.questions ?? [];
    submissions.push(...(data.submissions ?? []));

    if (!data.hasMore) break;
    page += 1;
  }

  return { questions, submissions };
}

/**
 * 質問タイトルから回答値を取得する。タイトルが見つからない場合は ⚠️ を出して undefined を返す
 * （フォームのフィールド名が変更された場合に静かに壊れないようにするため）
 *
 * HIDDEN_FIELDS タイプは質問自体の title が null になり、実際のフィールド名は
 * fields[0].title 側に入る（通常の質問タイプとは格納場所が異なる）ため、両方を見る。
 */
export function findAnswer(submission, questions, questionTitle) {
  const question = questions.find(
    (q) => q.title === questionTitle || q.fields?.[0]?.title === questionTitle
  );
  if (!question) {
    console.warn(`⚠️ 質問「${questionTitle}」が見つかりません（フォームの構成が変更された可能性があります）`);
    return undefined;
  }

  const response = submission.responses.find((r) => r.questionId === question.id);
  return response?.answer;
}

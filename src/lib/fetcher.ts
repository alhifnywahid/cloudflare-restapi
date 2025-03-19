export default async function axios(url: string) {
  const response = await fetch(url);
  const type = response.headers.get("Content-Type");

  if (type == "application/json") {
    const parse = await response.json();
    return parse;
  } else {
    const parse = await response.text();
    return parse;
  }
}

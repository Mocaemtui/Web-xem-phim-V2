const NGUONC_BASE_URL = "https://phim.nguonc.com/api";
async function testNguonC() {
  const detailRes = await fetch(`${NGUONC_BASE_URL}/film/ngoi-truong-xac-song`);
  const detailData = await detailRes.json();
  console.log("NguonC episodes:", JSON.stringify(detailData.movie.episodes, null, 2));
}
testNguonC();

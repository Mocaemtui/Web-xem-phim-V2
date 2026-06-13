const NGUONC_BASE_URL = "https://phim.nguonc.com/api";
async function testNguonC() {
  const detailRes = await fetch(`${NGUONC_BASE_URL}/film/ngoi-truong-xac-song?_v=1`);
  const detailData = await detailRes.json();
  console.log("NguonC with query param worked:", !!detailData.movie);
}
testNguonC();

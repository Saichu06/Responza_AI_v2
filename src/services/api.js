const BASE_URL = "http://127.0.0.1:8000";

export const getDisasters = async () => {
  const res = await fetch(`${BASE_URL}/all-disasters`);
  return res.json();
};
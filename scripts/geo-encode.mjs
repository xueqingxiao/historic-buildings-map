#!/usr/bin/env node
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import xlsx from "xlsx";
import axios from "axios";
import { ConcurrencyManager as createConcurrencyManager } from "axios-concurrency";

const AMAP_API_KEY = process.env.AMAP_API_KEY;
const AMAP_API_ENDPOINT = "https://restapi.amap.com";
const AMAP_API = axios.create({ baseURL: AMAP_API_ENDPOINT });
const MAX_CONCURRENT_REQUESTS = 1;
const CONCURRENCY_MANAGER = createConcurrencyManager(
  AMAP_API,
  MAX_CONCURRENT_REQUESTS
);

const format = (buildings = []) => {
  return buildings.map((building) => ({
    name: building.name,
    cate: building.cate,
    address: `山西省${building.city}${building.county}${building.name}`,
    latitude: 0,
    longitude: 0,
  }));
};

const geoEncode = async (building) => {
  if (!AMAP_API_KEY) {
    return building;
  }

  const encoded = { ...building };

  try {
    const url = `/v3/geocode/geo?key=${AMAP_API_KEY}&address=${building.address}`;
    const resp = await AMAP_API.get(url);
    const { geocodes = [] } = resp.data;
    if (geocodes.length > 0) {
      const [lat, lon] = geocodes[0].location.split(",");
      encoded.latitude = lat;
      encoded.longitude = lon;
      console.log("encode success: ", building.address);
    } else {
      throw new Error("encode failed");
    }
  } catch (e) {
    console.warn("encode failed: ", building.address);
  }

  return encoded;
};

(async () => {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const filePath = path.resolve(dirname, "../src/assets/historic-buildings.xls");
  const outPtah = path.resolve(dirname, "../src/assets/historic-buildings.json");

  const buf = await readFile(filePath);
  const workbook = await xlsx.read(buf);
  const buildings = xlsx.utils.sheet_to_json(
    workbook.Sheets[workbook.SheetNames[0]]
  );
  const encoded = await Promise.all(
    format(buildings).map((building) => geoEncode(building))
  );

  await writeFile(outPtah, JSON.stringify(encoded, null, 2));
  CONCURRENCY_MANAGER.detach();
})();

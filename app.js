import { createMap, addGeoJSON, fitMap, getGeoJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.16/map.min.js";
import { addScaleBar } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.16/mapcontrol.min.js";
import { addMarker } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.16/mapmarker.min.js";
import { setInner } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.16/element.min.js";

// Konfigurasi Wadah Peta & Berkas GeoJSON
const MAP_CONTAINER_ID = "peta";
const GEOJSON_DATA_URL = "./data/rute_ojek.geojson";

// Koordinat Titik Acuan (Format: [longitude, latitude])
const COORD_ULBI = [107.57575071, -6.87450316];
const COORD_VIO_HOTEL = [107.58217199, -6.89205182];
const COORD_MAP_CENTER = [107.579, -6.883];

/**
 * Memperbarui angka ringkasan tarif perjalanan pada kartu antarmuka
 */
function updateDashboardUI() {
  setInner("val-total-tarif", "Rp 10.000");
  setInner("val-jarak", "3,3 km");
  setInner("val-waktu", "10 Menit");
}

/**
 * Memuat data GeoJSON dan merendernya ke atas kanvas peta CrootJS
 */
function loadAndRenderRoute() {
  getGeoJSON(GEOJSON_DATA_URL, (response) => {
    const geojsonData = response && response.data ? response.data : response;

    if (!geojsonData || !geojsonData.features) {
      console.error("Gagal memuat berkas GeoJSON!");
      return;
    }

    // 1. Render data GeoJSON (Point & LineString) ke atas kanvas peta
    addGeoJSON(MAP_CONTAINER_ID, geojsonData, {
      style: {
        stroke: "#00875a",
        strokeWidth: 5,
        strokeOpacity: 0.9,
        fill: "#00875a",
        fillOpacity: 0.2
      },
      popup: (feature) => {
        if (!feature.properties || !feature.properties.label) return "";
        return `
          <div class="popup-box">
            <p><strong>${feature.properties.label}</strong></p>
          </div>
        `;
      }
    });

    // 2. Tambahkan Pin Marker khusus untuk Titik Jemput dan Antar
    try {
      addMarker(MAP_CONTAINER_ID, COORD_ULBI, {
        title: "Titik Jemput: Universitas Logistik dan Bisnis Internasional",
        popup: "<strong>Titik Jemput</strong><br>Universitas Logistik dan Bisnis Internasional"
      });

      addMarker(MAP_CONTAINER_ID, COORD_VIO_HOTEL, {
        title: "Titik Antar: Vio Hotel Pasteur",
        popup: "<strong>Titik Antar</strong><br>Vio Hotel Pasteur"
      });
    } catch (markerErr) {
      console.warn("Marker helper notice:", markerErr);
    }

    // 3. Posisikan kamera peta agar seluruh rute terlihat sempurna
    try {
      fitMap(MAP_CONTAINER_ID, geojsonData);
    } catch (fitErr) {
      console.warn("fitMap notice:", fitErr);
    }

    // 4. Perbarui data metrik kartu ringkasan
    updateDashboardUI();
  });
}

/**
 * Inisialisasi utama aplikasi
 */
function initApplication() {
  // 1. Buat kanvas peta slippy CrootJS
  createMap(MAP_CONTAINER_ID, {
    center: COORD_MAP_CENTER,
    zoom: 14
  });

  // 2. Tambahkan skala peta (scale bar)
  try {
    addScaleBar(MAP_CONTAINER_ID, "bottom-left");
  } catch (err) {
    console.warn("Scalebar module notice:", err);
  }

  // 3. Muat dan render data GeoJSON rute ojek Rp10.000
  loadAndRenderRoute();
}

// Jalankan inisialisasi saat modul dimuat
initApplication();

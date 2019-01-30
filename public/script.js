const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

function success(pos) {
  const lat = document.getElementById('poi_lat');
  const lon = document.getElementById('poi_lon');
  lat.value = `${pos.coords.latitude}`;
  lon.value = `${pos.coords.longitude}`;
}

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

function get() {
  navigator.geolocation.getCurrentPosition(success, error, options);
}

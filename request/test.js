import * as R from 'ramda';
import ioc from '../../dependancies';
import { getPosition } from '../store/watchers';
import { load as loadPoi } from '../store/actions/poi';
import {
  list as listGeofences,
  listMy as listMyGeofences,
  setInside as setInsideGeofences,
  setPoiLoaded as setPoiLoadedGeofences,
} from '../store/actions/geofence';
import store from '../store';

/**
 * Get geofence around current store position
 */
const getAround = async ({ recordPosition = true } = {}) => {
  const conf = ioc.get('conf');
  const iUid = localStorage.getItem('iUid');

  try {
    const request = await ioc.get('async.request');

    const position = await getPosition().catch((positionError) => {
      throw new Error(`Position error (${positionError.code}) : ${positionError.message}`);
    });

    const response = await request({
      method: 'GET',
      uri: `${conf.api.innoside.baseUrl}/geofence`,
      json: true,
      simple: false,
      qs: {
        longitude: position.longitude,
        latitude: position.latitude,
        ...(recordPosition ? { iUid } : {}),
      },
    });

    return response;
  } catch (error) {
    return {
      success: false,
      error: error.toString(),
    };
  }
};

/**
 * Get all geofences
 */
const getAllGeofences = async () => {
  const conf = ioc.get('conf');
  const request = await ioc.get('async.request');

  const response = await request({
    method: 'GET',
    uri: `${conf.api.innoside.baseUrl}/geofence`,
    json: true,
    simple: false,
  });

  return response;
};

/**
 * Get geofence by id
 */
const getGeofence = async (geofenceId) => {
  const conf = ioc.get('conf');
  const request = await ioc.get('async.request');

  const response = await request({
    method: 'GET',
    uri: `${conf.api.innoside.baseUrl}/geofence/${geofenceId}`,
    json: true,
    simple: false,
  });

  return response;
};

/**
 * Get geofence by id
 */
const getGlobalPois = async () => {
  const conf = ioc.get('conf');

  try {
    const request = await ioc.get('async.request');

    const position = await getPosition().catch((positionError) => {
      throw new Error(`Position error (${positionError.code}) : ${positionError.message}`);
    });

    const response = await request({
      method: 'GET',
      uri: `${conf.api.innoside.baseUrl}/poi/getAround`,
      json: true,
      simple: false,
      qs: {
        longitude: position.longitude,
        latitude: position.latitude,
      },
    });

    return response;
  } catch (error) {
    return {
      success: false,
      error: error.toString(),
    };
  }
};

/**
 * Load and dispatch all geofences
 */
export const dispatchAllGeofences = async () => {
  const response = await getAllGeofences();

  if (!response.success) {
    throw new Error(response.error);
  }

  const { geofences } = response.payload;

  store.dispatch(listGeofences(geofences));

  return geofences;
};

/**
 * Get all geofences
 */
const getMyGeofences = async ({ with: additionalContent } = {}) => {
  const conf = ioc.get('conf');
  const request = await ioc.get('async.request');
  const { username, authToken } = store.getState().auth;

  const response = await request({
    method: 'GET',
    uri: `${conf.api.innoside.baseUrl}/geofence/by/user`,
    json: true,
    simple: false,
    qs: {
      username,
      authToken,
      with: additionalContent,
    },
  });

  return response;
};

/**
 * Load and dispatch all geofences
 */
export const dispatchMyGeofences = async (options = {}) => {
  const response = await getMyGeofences(options);

  if (!response.success) {
    throw new Error(response.error);
  }

  const { geofences } = response.payload;

  store.dispatch(listMyGeofences(geofences));

  return geofences;
};

/**
 * Load and dispatch the POIs from a single geofence
 */
export const dispatchGeofencePois = async (geofenceId) => {
  const response = await getGeofence(geofenceId);

  if (!response.success) {
    throw new Error(response.error);
  }

  const { pois: poiList } = response.payload;

  store.dispatch(loadPoi(poiList));
  store.dispatch(setPoiLoadedGeofences([geofenceId]));

  return poiList;
};

/**
 * Get poiList of geofences i am inside
 */
const getPoiListAround = async () => {
  const response = await getAround();

  if (!response.success) {
    throw new Error(response.error);
  }

  const { geofences } = response.payload;

  const poiLists = await Promise.all(geofences.map(async (geofence) => {
    const subResponse = await getGeofence(geofence._id);

    if (!subResponse.success) {
      throw new Error(subResponse.error);
    }

    return subResponse.payload.pois;
  }));

  const { payload: { pois: globalPoiList } } = await getGlobalPois();

  const poiList = R.unnest(poiLists);

  return {
    poiList: [
      ...poiList,
      ...globalPoiList,
    ],
    geofences,
  };
};

export const dispatchPoiListAround = async () => {
  const { poiList, geofences } = await getPoiListAround();

  const geofenceIds = Object.values(geofences).map(({ _id }) => _id);

  store.dispatch(loadPoi(poiList));
  store.dispatch(setInsideGeofences(geofenceIds));
  store.dispatch(setPoiLoadedGeofences(geofenceIds));

  return poiList;
};

export const notify = async (form) => {
  const conf = ioc.get('conf');
  const request = await ioc.get('async.request');
  const { username, authToken } = store.getState().auth;

  const response = await request({
    method: 'PUT',
    uri: `${conf.api.innoside.baseUrl}/geofence/${form.geofenceId}/notify`,
    json: true,
    simple: false,
    form: {
      username,
      authToken,
      ...form,
    },
  });

  return response;
};
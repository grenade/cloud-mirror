'use strict';
let debugModule = require('debug');
let assert = require('assert');

/**
 * Abstract base class for StorageProviders.  Every method of this abstract
 * base class may be overridden for each provider aside from the constructor.
 * The constructor should only take a single object as the configuration so
 * that we can use typed-env-config as the sole system for configuring them.
 * It is permissible and recommended that implementors validate the config
 * object.  This class should only deal with storage provider operations and
 * not any sort of caching or input functions, aside from extra input
 * validation required by the backend
 */
class StorageProvider {

  /**
   * Store the configuration for this storage provider in the variable
   * 'this.config' for use in following methods.
   */
  constructor(config) {
    assert(config, 'must pass a configuration object to StorageProvider constructor');
    assert(config.id, 'all StorageProviders must have an ID');
    this.id = config.id;
    this.debug = debugModule(`cloud-mirror:${this.constructor.name}:${this.id}`);
  }

  /**
   * Perform any async init code require for this storage provider.  Default action
   * is for there to be no init code.
   */
  async init() { }

  /**
   * Store a file with the StorageProvider.  This must be overridden with a method
   * which takes:
   *   - rawUrl: the original input url as plain text
   *   - inputStream: a ReadableStream for the object to store
   *   - headers: HTTP headers required to be set on the object in the storage
   *     provider
   *   - storageMetadata: metadata that should be stored in the storage provider
   *
   * and inserts the object into the storage provider
   */
  async put(rawUrl, inputStream, headers, storageMetadata) {
    throw new Error('This StorageProvider implementation must implement .put()');
  }

  /**
   * Remove an internal address from the storage provider
   */
  async purge(internalAddress) {
    throw new Error('This StorageProvider implementation must implement .purge()');
  }

  /**
   * Perform any extra input validation required by the backend
   */
  async validateInput(rawUrl) {
    return true;
  }

  /**
   * Take the request-promise response from an HTTP HEAD request for an object
   * in this storage provider and return a Date object which represents when
   * this object will be cleaned up from the cache
   */
  async expirationDate(response) {
    throw new Error('This StorageProvider implementation must implement .expirationDate()');
  }

  /**
   * A world address is what we will eventually redirect to.  This method
   * should map an internal address to a world address
   */
  worldAddress(internalAddress) {
    throw new Error('This StorageProvider implementation must implement .worldAddress()');
  }

  /**
   * An internal address is what we use to find this entry in the storage
   * provider.  In the standard case, we will just URL encode the input URL and
   * use that, but in the case a system which uses non-deterministic
   * addressing. Another use is if we want to obscure the input URL using, we
   * could maintain this inputUrl:internalAddress mapping in a persistent
   * datastore and use this method to find the worldAddress
   */
  internalAddress(rawUrl) {
    return encodeURIComponent(rawUrl);
  }
}

module.exports = {
  StorageProvider,
};

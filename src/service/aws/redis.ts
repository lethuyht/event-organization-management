/* eslint-disable */
import Redis from 'ioredis';
import _ from 'lodash';
import { configuration } from '../../config';

export const CACHE_NAMESPACE = {
  PersonContext: 'person-context-',
  Prefix: `the-perfect-score-${configuration.api.nodeEnv}`,
  Entity: 'entity'
};

export class RedisClientSingleton {
  private static instance: RedisClientSingleton;

  private redis: Redis;
  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor() {
    this.redis = new Redis(configuration.redisUrl, {
      maxRetriesPerRequest: 3,
      connectTimeout: 5000
    });
    if (!this.redis) {
      console.log('Cant connect redis');
    }
  }

  /**
   * The static method that controls the access to the singleton instance.
   *
   * This implementation let you subclass the Singleton class while keeping
   * just one instance of each subclass around.
   */
  public static getInstance(): RedisClientSingleton {
    if (!RedisClientSingleton.instance) {
      RedisClientSingleton.instance = new RedisClientSingleton();
    }

    return RedisClientSingleton.instance;
  }

  public async get(namespace: string, key: string, getter?: any, expiryInMinutes?: number) {
    try {
      const cacheKey = namespace ? `${CACHE_NAMESPACE.Prefix}:${namespace}${key}` : `${CACHE_NAMESPACE.Prefix}:${key}`;
      let res = await this.redis.get(cacheKey);
      if (res) {
        console.log(`Redis data retrieved: ${res}`);
        res = JSON.parse(res);
        return res;
      }

      if (!getter) {
        return;
      }

      const value = await getter();
      if (value) {
        if (!expiryInMinutes) expiryInMinutes = 10;
        await this.set(namespace, key, value, expiryInMinutes);
      }
      return value;
    } catch (err) {
      console.log('Cache error while performing GET');
      console.log(err);
      return await getter();
    }
  }

  public async delete(namespace: string, key: any) {
    try {
      const cacheKey = namespace ? `${CACHE_NAMESPACE.Prefix}:${namespace}${key}` : `${CACHE_NAMESPACE.Prefix}:${key}`;
      // allow delete cache by array of keys
      if (_.isArray(key)) {
        await this.redis.del(cacheKey);
        return await this.redis.del(
          key.map(e => (namespace ? `${CACHE_NAMESPACE.Prefix}:${namespace}${e}` : `${CACHE_NAMESPACE.Prefix}:${e}`))
        );
      }
      return await this.redis.del(cacheKey);
    } catch (err) {
      console.log(err);
      return true;
    }
  }

  //We should not need to call this SET method explicitly. Just use the GET method to get data and let it automaticaly SET to the Redis cache
  async set(namespace: string, key: string, data: any, ttl: number) {
    try {
      if (!ttl) ttl = 10; //minutes
      ttl = ttl * 60;
      const cacheKey = namespace ? `${CACHE_NAMESPACE.Prefix}:${namespace}${key}` : `${CACHE_NAMESPACE.Prefix}:${key}`;
      return await this.redis.set(cacheKey, JSON.stringify(data), 'EX', ttl);
    } catch (err) {
      console.log('Cache error while performing SET');
      console.log(err);
      return data;
    }
  }
}

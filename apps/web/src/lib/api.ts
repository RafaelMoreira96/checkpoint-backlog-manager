import { CheckpointApiClient } from '@checkpoint/core';

// Automatically uses relative /api/v1 proxy in dev or full URL if configured
export const api = new CheckpointApiClient({
  baseUrl: '/api/v1',
});

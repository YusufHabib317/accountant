import { apiEndpoints } from '@/data/api-endpoints';
import { ApiClient } from '@/lib/axios';
import { handleApiError } from '@/utils/api-handlers/handle-backend-error';
import { HTTPS_CODES } from '@/data';

export enum staticsQueryKeys {
 statics = 'statics',
}

// get statics
const getStaticsRequest = () => ApiClient.get(apiEndpoints.statics())
  .then((res) => res?.data)
  .catch((e) => {
    handleApiError(e);
    throw e.response?.data;
  });

export const getStaticsQuery = () => ({
  queryKey: [
    staticsQueryKeys.statics,
  ],
  queryFn: () => getStaticsRequest(),
  refetchOnWindowFocus: false,
  retry: (failureCount: number, error: { code: HTTPS_CODES }) => error?.code !== HTTPS_CODES.UNAUTHORIZED,
});

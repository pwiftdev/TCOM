import { api } from './client';
import { DESIGN_PREVIEW, designData } from '../lib/designPreview';

export const statsApi = {
  online: () => (DESIGN_PREVIEW ? designData.online() : api.get('/stats/online').then((r) => r.data)),
};

import { ActivityEventModel } from '../../models/mongo/ActivityEvent';
import { ModMetadataModel } from '../../models/mongo/ModMetadata';

export type ActivityType = 'NEW_MOD' | 'NEW_VERSION' | 'NEW_COMMENT';

export const activityRepository = {
  record(type: ActivityType, modId: string, actorId: string, payload: Record<string, unknown> = {}) {
    return ActivityEventModel.create({ type, modId, actorId, payload });
  },

  feedForMods(modIds: string[], limit: number) {
    return ActivityEventModel.find({ modId: { $in: modIds } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  },

  setMetadata(modId: string, gameKey: string, fields: Record<string, unknown>) {
    return ModMetadataModel.findOneAndUpdate(
      { modId },
      { modId, gameKey, fields },
      { upsert: true, returnDocument: 'after' },
    );
  },

  getMetadata(modId: string) {
    return ModMetadataModel.findOne({ modId }).lean();
  },
};

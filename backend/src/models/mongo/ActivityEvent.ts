import { Schema, model, type InferSchemaType } from 'mongoose';

const activityEventSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['NEW_MOD', 'NEW_VERSION', 'NEW_COMMENT'],
      required: true,
    },
    modId: { type: String, required: true, index: true },
    actorId: { type: String, required: true },
    // Forme variable selon `type` : ex. { versionLabel } pour NEW_VERSION,
    // { commentPreview } pour NEW_COMMENT — c'est justement ce qui justifie Mongo ici.
    payload: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export type ActivityEvent = InferSchemaType<typeof activityEventSchema>;
export const ActivityEventModel = model('ActivityEvent', activityEventSchema);

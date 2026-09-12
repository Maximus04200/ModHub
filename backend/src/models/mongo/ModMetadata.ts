import { Schema, model, type InferSchemaType } from 'mongoose';

const modMetadataSchema = new Schema(
  {
    modId: { type: String, required: true, unique: true },
    gameKey: { type: String, required: true, index: true },
    // Champs libres et propres à chaque jeu (ex. requiredDLC + workshopId pour
    // Arma Reforger, mcVersion + modLoader pour Minecraft) — schéma variable par
    // nature, d'où le choix Mongo plutôt qu'un modèle relationnel EAV.
    fields: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export type ModMetadata = InferSchemaType<typeof modMetadataSchema>;
export const ModMetadataModel = model('ModMetadata', modMetadataSchema);

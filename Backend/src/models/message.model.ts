import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema: Schema = new Schema<IMessage>(
    {
        senderId: { type: String, required: true, index: true },
        receiverId: { type: String, required: true, index: true },
        content: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

export const MessageModel = mongoose.model<IMessage>("Message", MessageSchema);

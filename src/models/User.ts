import mongoose, { Document, Model, Schema } from 'mongoose';

import { UserStatus } from '../enums/UserStatus';

export interface IUser extends Document {
  email: string;
  username: string;
  password: string;
  status: number;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
  hasVerify: Boolean;
  isExhibitor: Boolean;
  //
  profile: UserProfile;
}

export interface UserProfile {
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

export interface SocialLink {
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

const UserProfileSchema: Schema<UserProfile> = new Schema<UserProfile>({
  firstName: {
    type: String,
    required: false,
    default: null,
  },
  lastName: {
    type: String,
    required: false,
    default: null,
  },
  profileImageUrl: {
    type: String,
    required: false,
    default: null,
  },
});

const UserSchema: Schema<IUser> = new Schema<IUser>(
  {
    username: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    status: {
      type: Number,
      default: UserStatus.Active,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      required: true,
    },
    updatedAt: {
      type: Date,
      default: null,
      required: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
      required: false,
    },
    hasVerify: {
      type: Boolean,
      default: false,
      required: false,
    },
    isExhibitor: {
      type: Boolean,
      default: false,
      required: false,
    },
    profile: UserProfileSchema,
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret) {
        // Transform the _id field to id
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  },
);

// Define and export the Organization model
const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export default User;

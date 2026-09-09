import { Schema, model, type HydratedDocument } from 'mongoose';
import bcrypt from 'bcryptjs';

// 1. Define the interface WITHOUT extending Document
export interface IUser {
  name: string;
  email: string;
  password: string;
  correctPassword(candidatePassword: string): Promise<boolean>;
}

// 2. Create a HydratedDocument type (this gives you isModified, save, etc.)
type UserDocument = HydratedDocument<IUser>;

const userSchema = new Schema<IUser>({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true },
  password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false }
}, { timestamps: true });

// 3. Explicitly type 'this' as UserDocument. TypeScript will now perfectly infer 'next'.
userSchema.pre('save', async function(this: UserDocument) {
  if (!this.isModified('password')) return ;
  this.password = await bcrypt.hash(this.password, 12);
});

// 4. Type 'this' here as well for the custom method
userSchema.methods.correctPassword = async function(this: UserDocument, candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default model<IUser>('User', userSchema);
import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  createdAt: { type: Date, default: Date.now },
  role: { type: String, enum: ['user', 'premium', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationExpires: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  tokenVersion: { type: Number, default: 0 },
  lastLogin: { type: Date },
  stripeCustomerId: { type: String },
  subscription: {
    tier: { type: String, enum: ['free', 'basic', 'premium'], default: 'free' },
    startDate: { type: Date },
    endDate: { type: Date },
    status: { type: String, enum: ['active', 'canceled', 'expired'], default: 'active' }
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to increment token version (for refresh token invalidation)
userSchema.methods.incrementTokenVersion = async function() {
  this.tokenVersion += 1;
  return this.save();
};

// Check if user's subscription is active
userSchema.methods.hasActiveSubscription = function() {
  if (this.subscription.tier === 'free') return true;
  
  return (
    this.subscription.status === 'active' && 
    this.subscription.endDate && 
    new Date(this.subscription.endDate) > new Date()
  );
};

// Helper to get subscription status
userSchema.methods.getSubscriptionStatus = function() {
  if (this.subscription.tier === 'free') return 'free';
  
  if (this.subscription.status !== 'active') {
    return 'inactive';
  }
  
  if (this.subscription.endDate && new Date(this.subscription.endDate) <= new Date()) {
    return 'expired';
  }
  
  return 'active';
};

// Check if user has access to a specific feature
userSchema.methods.hasFeature = async function(feature: string): Promise<boolean> {
  const Subscription = mongoose.model('Subscription');
  
  // Free users have access to basic features
  if (feature === 'limited_resumes' || feature === 'basic_templates' || feature === 'pdf_export') {
    return true;
  }
  
  // Check subscription
  const subscription = await Subscription.findOne({ userId: this._id });
  if (!subscription || !subscription.isActive()) {
    return false;
  }
  
  return subscription.hasFeature(feature);
};

const User = mongoose.model('User', userSchema);

export default User;

import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  plan: 'free' | 'basic' | 'premium';
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trial' | 'expired';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  paymentMethod?: {
    id: string;
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  features: string[]; // List of features the user has access to
}

const SubscriptionSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  stripeCustomerId: {
    type: String,
    required: true,
    index: true
  },
  stripeSubscriptionId: {
    type: String,
    required: true,
    index: true
  },
  plan: {
    type: String,
    enum: ['free', 'basic', 'premium'],
    default: 'free',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'past_due', 'unpaid', 'trial', 'expired'],
    default: 'active',
    required: true
  },
  currentPeriodStart: {
    type: Date,
    required: true
  },
  currentPeriodEnd: {
    type: Date,
    required: true
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  canceledAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    id: String,
    brand: String,
    last4: String,
    expMonth: Number,
    expYear: Number
  },
  features: [{
    type: String
  }]
}, {
  timestamps: true // Automatically manage createdAt and updatedAt
});

// Pre-save hook to update user subscription details
SubscriptionSchema.pre('save', async function() {
  if (this.isModified('plan') || this.isModified('status')) {
    // Update the related user's subscription information
    const User = mongoose.model('User');
    
    await User.updateOne(
      { _id: this.userId },
      { 
        subscription: {
          tier: this.plan,
          status: this.status,
          startDate: this.currentPeriodStart,
          endDate: this.currentPeriodEnd
        }
      }
    );
  }
});

// Helper methods to check access to features
SubscriptionSchema.methods.hasFeature = function(feature: string): boolean {
  return this.features.includes(feature);
};

SubscriptionSchema.methods.isActive = function(): boolean {
  return this.status === 'active' || this.status === 'trial';
};

const Subscription = mongoose.model<ISubscription>('Subscription', SubscriptionSchema);

export default Subscription; 
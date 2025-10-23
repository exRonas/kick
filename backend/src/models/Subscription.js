import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class Subscription extends Model {}

  Subscription.init(
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      plan: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'basic' },
      status: { type: DataTypes.ENUM('active', 'canceled', 'expired'), allowNull: false, defaultValue: 'active' },
      expiresAt: { type: DataTypes.DATE, allowNull: true }
    },
    { sequelize, modelName: 'Subscription', tableName: 'subscriptions' }
  );

  return Subscription;
};

import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class Donation extends Model {}

  Donation.init(
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      currency: { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'RUB' },
      status: { type: DataTypes.ENUM('succeeded', 'failed'), allowNull: false, defaultValue: 'succeeded' },
      paymentId: { type: DataTypes.STRING(100), allowNull: false }
    },
    { sequelize, modelName: 'Donation', tableName: 'donations' }
  );

  return Donation;
};

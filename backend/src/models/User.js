import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class User extends Model {}

  User.init(
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(100), allowNull: false },
      email: { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: { isEmail: true } },
      passwordHash: { type: DataTypes.STRING(200), allowNull: false },
      role: { type: DataTypes.ENUM('donor', 'author', 'admin'), allowNull: false, defaultValue: 'donor' },
      activeSubscription: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      authorRequested: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
    },
    { sequelize, modelName: 'User', tableName: 'users' }
  );

  return User;
};

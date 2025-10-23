import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class Config extends Model {}

  Config.init(
    {
      key: { type: DataTypes.STRING(100), primaryKey: true },
      value: { type: DataTypes.JSON, allowNull: false }
    },
    { sequelize, modelName: 'Config', tableName: 'config' }
  );

  return Config;
};

import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class ProjectUpdate extends Model {}

  ProjectUpdate.init(
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      content: { type: DataTypes.TEXT('long'), allowNull: false }
    },
    { sequelize, modelName: 'ProjectUpdate', tableName: 'project_updates' }
  );

  return ProjectUpdate;
};

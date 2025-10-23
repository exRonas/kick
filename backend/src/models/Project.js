import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class Project extends Model {}

  Project.init(
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING(200), allowNull: false },
      shortDescription: { type: DataTypes.STRING(300), allowNull: false },
      description: { type: DataTypes.TEXT('long'), allowNull: false },
      category: { type: DataTypes.STRING(50), allowNull: false },
      goalAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      raisedAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      coverImageUrl: { type: DataTypes.STRING(500), allowNull: true },
      mediaUrls: { type: DataTypes.JSON, allowNull: true },
      team: { type: DataTypes.JSON, allowNull: true },
      status: { type: DataTypes.ENUM('pending', 'approved', 'archived'), allowNull: false, defaultValue: 'approved' },
      deletedAt: { type: DataTypes.DATE, allowNull: true }
    },
    { sequelize, modelName: 'Project', tableName: 'projects' }
  );

  return Project;
};

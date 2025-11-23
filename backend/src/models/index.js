import { sequelize } from '../config/db.js';
import UserFactory from './User.js';
import ProjectFactory from './Project.js';
import DonationFactory from './Donation.js';
import SubscriptionFactory from './Subscription.js';
import ProjectUpdateFactory from './ProjectUpdate.js';
import ConfigFactory from './Config.js';

export const User = UserFactory(sequelize);
export const Project = ProjectFactory(sequelize);
export const Donation = DonationFactory(sequelize);
export const Subscription = SubscriptionFactory(sequelize);
export const ProjectUpdate = ProjectUpdateFactory(sequelize);
export const Config = ConfigFactory(sequelize);

// Associations
User.hasMany(Project, { foreignKey: 'ownerId', as: 'projects' });
Project.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

User.hasMany(Donation, { foreignKey: 'userId', as: 'donations' });
Donation.belongsTo(User, { foreignKey: 'userId', as: 'donor' });

Project.hasMany(Donation, { foreignKey: 'projectId', as: 'donations' });
Donation.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

User.hasOne(Subscription, { foreignKey: 'userId', as: 'subscription' });
Subscription.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Project.hasMany(ProjectUpdate, { foreignKey: 'projectId', as: 'updates' });
ProjectUpdate.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

export async function syncModels(force = false, alter = true) {
  await sequelize.sync({ force, alter });
}

export async function migrateSchema() {
  const qi = sequelize.getQueryInterface();
  // Ensure projects.deletedAt exists
  try {
    const desc = await qi.describeTable('projects');
    if (!desc.deletedAt) {
      await qi.addColumn('projects', 'deletedAt', { type: 'DATETIME', allowNull: true });
    }
  } catch (e) {
    // Table may not exist yet; ignore and rely on sync
  }

  // Ensure users.authorRequested exists
  try {
    const udesc = await qi.describeTable('users');
    if (!('authorRequested' in udesc)) {
      await qi.addColumn('users', 'authorRequested', { type: 'TINYINT(1)', allowNull: false, defaultValue: 0 });
    }
  } catch (e) {
    // ignore if table not ready yet
  }
}

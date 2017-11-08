import Sequelize from 'sequelize';

const db = new Sequelize('db', null, null, {
  dialect: 'sqlite',
  storage: './db.sqlite',
});

const UserModel = db.define('user', {
  id: { type: Sequelize.INTEGER, primaryKey: true},
  type: {
    type: Sequelize.VIRTUAL(Sequelize.STRING),
    get() {
      return 'userType';
    }
  },
  name: { type: Sequelize.STRING },
  email: { type: Sequelize.STRING },
  password: { type: Sequelize.STRING },
  isSuperUser: { type: Sequelize.BOOLEAN },
  isAdmin: { type: Sequelize.BOOLEAN },
  isActivated: { type: Sequelize.BOOLEAN },
  created: { type: Sequelize.DATE },
  updated: { type: Sequelize.DATE },
});

const BlogModel = db.define('blog', {
  id: { type: Sequelize.INTEGER, primaryKey: true},
  type: {
    type: Sequelize.VIRTUAL(Sequelize.STRING),
    get() {
      return 'blogType';
    }
  },
  title: { type: Sequelize.STRING },
  content: { type: Sequelize.STRING },
  author: { type: Sequelize.INTEGER },
  category: { type: Sequelize.STRING },
  created: { type: Sequelize.DATE },
  updated: { type: Sequelize.DATE },
  slug: { type: Sequelize.STRING },
  imageSource: { type: Sequelize.STRING },
});


BlogModel.belongsTo(UserModel, {foreignKey: 'author', targetKey: 'id'});

const User = db.models.user;
const Blog = db.models.blog;

export { User, Blog };
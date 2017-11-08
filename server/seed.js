import {
  User,
  Blog,
} from './database.js';
import postsArray from '../data/posts.json';
import usersArray from '../data/users.json';
import { encrypt } from '../constants.js';


Blog.sync({force: true}).then(() => {
  User.sync({force: true}).then(() => {
    usersArray.forEach(user => {
      User.create({
        id: user.id,
        name: user.name,
        email: user.email,
        password: encrypt(user.password),
        isSuperUser: user.isSuperUser,
        isAdmin: user.isAdmin,
        isActivated: user.isActivated,
        created: new Date(),
        updated: new Date(),
      });
    });
    postsArray.forEach(post => {
      Blog.create({
        id: post.id,
        content: post.content,
        imageSource: post.imageSource,
        author: post.author,
        title: post.title,
        category: post.category,
        created: new Date(),
        updated: new Date(),
        slug: post.title.toLowerCase().split(' ').join('-'),
      });
    });
  });
});

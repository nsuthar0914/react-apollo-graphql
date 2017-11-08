import * as _ from 'underscore';

import {
  GraphQLList,
  GraphQLObjectType,
  GraphQLInterfaceType,
  GraphQLSchema,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
  GraphQLFloat,
  GraphQLEnumType,
  GraphQLNonNull,
  GraphQLBoolean
} from 'graphql';

import {
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
  cursorForObjectInConnection,
  offsetToCursor,
  fromGlobalId,
  globalIdField,
  mutationWithClientMutationId,
  nodeDefinitions,
  toGlobalId,
} from 'graphql-relay';

import {
  User as usersCollection,
  Blog as blogsCollection,
} from './database.js';

import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import {jwtSecret, encrypt, decrypt} from '../constants.js';


// Mock authenticated ID.
const ANON_VIEWER_ID = 'me';


export function getViewer(obj, args, info) {
  if (info.user && info.user.user) {
    return (info.user.user);
  } else {
    return {ANON_VIEWER_ID: {id:ANON_VIEWER_ID}};
  }
}

const newCursorForObjectInConnection = (data, object) => {
  var offset = data.findIndex(obj => obj.id == object.id);
  if (offset === -1) {
    return null;
  }
  return offsetToCursor(offset);
}

const getTokenFromUser = function(user) {
  if (!user) return null;
  return jwt.sign({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isSuperUser: user.isSuperUser,
      isRecruiter: user.isRecruiter,
      isAuthor: user.isAuthor,
      isAdmin: user.isAdmin,
      isActivated: user.isActivated,
    }
  }, jwtSecret);
}

const getTokenFromEmail = function(email) {
  if (!email) return null;
  return jwt.sign({
    email
  }, jwtSecret);
}

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
      user: 'neerajs@suventure.in', // Your email id
      pass: 'swastik123456' // Your password
  }
});

const sendVerificationEmail = function({email, name, url, client, message}) {
  const token = jwt.sign({
    email
  }, jwtSecret)
  let mailOptions = {
    from: 'neerajs@suventure.in', // sender address
    to: email, // list of receivers
    // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
  };
  if (url) {
    if (url == '/reset-password') {
      mailOptions.text = `Please click the link to reset your password! \n
      ${client}${url}/${email}/${token}`;
      mailOptions.subject = 'Password Reset';
    } else if (url == '/activation') {
      mailOptions.text = `Please click the link to activate your account! \n
      ${client}${url}/${email}/${token}`;
      mailOptions.subject = 'Welcome to BadCanvas';
    }
  } else if (message) {
    mailOptions.text = `Message from ${email || name}: "${message}" `;
    mailOptions.subject = `Message from ${name || email} `;
    mailOptions.to = 'neerajs@suventure.in';
  }
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      console.log(error);
      // res.json({yo: 'error'});
    }else{
      console.log('Message sent: ' + info.response);
      // res.json({yo: info.response});
    };
  });
}

const createUser = function({name, email, password, token, isAdmin}, client) {
  console.log(token, email, password);
  let isActivated;
  let passwordChange;
  if (token && email && password) {
    jwt.verify(token, jwtSecret, function(err, decoded) {
      if (decoded && decoded.email) {
        passwordChange = email == decoded.email
        // console.log('passwordChange');
        // console.log(passwordChange);
      }
    })
  } else if (token && email) {
    jwt.verify(token, jwtSecret, function(err, decoded) {
      if (decoded && decoded.email) {
        isActivated = email == decoded.email
        console.log(isActivated);
      }
    })
    console.log('verifying', isActivated, token, email);
  }
  return usersCollection.findOne({where: {email}}).then((userExists) => {
    // console.log('passwordChange');
    if (userExists) {
      const updatedUser = userExists.get({
        plain: true
      });
      updatedUser.name = name || updatedUser.name;
      updatedUser.password = passwordChange ? password : updatedUser.password;
      updatedUser.isAdmin = isAdmin != undefined ? isAdmin : updatedUser.isAdmin;
      updatedUser.isActivated = isActivated != undefined ? isActivated : updatedUser.isActivated;
      updatedUser.updated = new Date();
      usersCollection.update(updatedUser, {where: {email}});
      // console.log('passwordChange');
      // console.log(passwordChange, updatedUser, password);
      return updatedUser;
    } else {
      let url = '/activation';
      sendVerificationEmail({email, name, url, client});
      return usersCollection.count().then(length => {
        let user = {
          name,
          email,
          password,
          isAdmin: false,
          isSuperUser: false,
          isActivated: false,
        }
        user.id = length + 1;
        return usersCollection.create(user)
          .then(_ => user);
      });
    }
  })
}

const findUserByEmail = function ({email, password}, client) {
  return usersCollection.findOne({where: {email}}).then((user) => {
    const userExists = user.get({
      plain: true
    });
    console.log('userExists', userExists)
    if (!userExists) return null;
    if (password == undefined) {
      let url = '/reset-password';
      sendVerificationEmail({email, url, client});
      return userExists;
    }
    if (decrypt(userExists.password) === password) {
      return userExists;
    } else {
      return null;
    }
  });
}

const findUserById = function ({id}) {
  return usersCollection.findOne({where: {id}});
}

const getUsers = () => {
  return usersCollection.findAll();
}

const getBlog = (id) => {
  return blogsCollection.findOne({where: {id}});
}

const getBlogBySlug = (slug) => {
  return blogsCollection.findOne({where: {slug}});
}

const getBlogs = (author, category) => {
  let query = {};
  if (author) query.author = author;
  if (category) query.category = category;
  return blogsCollection.findAll({where: query, order: [['updated', 'DESC']]});
}

export async function addBlog({imageSource,title,content, author, category}) {
  return blogsCollection.count().then(length => {
    let blog = {
      imageSource,
      title,
      content,
      author,
      category,
      created: new Date(),
      updated: new Date(),
      slug: title.toLowerCase().split(' ').join('-')
    }
    blog.id = length + 1;
    return blogsCollection.create(blog)
      .then(_ => blog.id);
  })
}

export async function editBlog({id, imageSource,title,content, category}) {
  let updateQuery = {};
  if (imageSource) updateQuery.imageSource = imageSource;
  if (title) updateQuery.title = title;
  if (content) updateQuery.content = content;
  if (category) updateQuery.category = category;
  updateQuery.updated = new Date();
  // console.log(updateQuery, id)
  blogsCollection.update(updateQuery, {where: {id}});
  return id;
}

export async function removeBlog(id) {
  blogsCollection.destroy({ where: {id} });
}

export async function sendMessage({email, message, subject}) {
  let mailOptions = {
    from: 'neerajs@suventure.in', // sender address
    to: email, // list of receivers
    subject: subject, // Subject line
    text: message //, // plaintext body
    // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
  };
  return transporter.sendMail(mailOptions, function(error, info){
    if(error){
      console.log(error);
      // res.json({yo: 'error'});
    }else{
      console.log('Message sent: ' + info.response);
      // res.json({yo: info.response});
    };
  });
}


const { nodeInterface, nodeField } = nodeDefinitions(
  globalId => {
    // console.log('globalId', type, id, globalId);
    const { type, id } = fromGlobalId(globalId);
    switch (type) {
      case 'User':
        return findUserById({id});
      case 'Blog':
        console.log('id', id);
        return getBlog(id);
      default:
        return null;
    }
  },
  obj => {
    const { type } = obj;
    switch (type) {
      case 'userType':
        return GraphQLUser;
      case 'blogType':
        return GraphQLBlog;
      default:
        return null;
    }
  },
);

const Category = new GraphQLEnumType({
  name: 'Category',
  description: 'A Category of the blog',
  values: {
    NEWS: {value: 'news'},
    EVENT: {value: 'event'},
    USER_STORY: {value: 'user-story'},
    BLOG: {value: 'blog'},
    CASE_STUDY: {value: 'case-study'},
    OTHER: {value: 'other'}
  }
});

const GraphQLBlog = new GraphQLObjectType({
  name:'Blog',
  description:'blogs details',
  fields: () => ({
    id: globalIdField(),
    category :{type: Category},
    imageSource: {type: GraphQLString},
    title: {type: GraphQLString},
    content : {type: GraphQLString},
    author : {
      type: GraphQLUser,
      resolve: async ({ author }) => {
        // console.log(author, 'author')
        const authorNode = await findUserById({id: author});
        return authorNode;
      },
    },
    created: {type: GraphQLString},
    updated: {type: GraphQLString},
    slug: {type: GraphQLString},
  }),
  interfaces: [nodeInterface]
});

const { connectionType: BlogsConnection, edgeType: GraphQLBlogEdge } = 
  connectionDefinitions({ nodeType: GraphQLBlog });


const GraphQLUser = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: globalIdField(),
    name: {type: GraphQLString},
    email: {type: GraphQLString},
    token: {type: GraphQLString},
    isSuperUser: {type: GraphQLBoolean},
    isAdmin: {type: GraphQLBoolean},
    isActivated: {type: GraphQLBoolean},
    users: {
      type: UsersConnection,
      args: {
        ...connectionArgs,
      },
      resolve: async (obj, args) => (
        connectionFromArray(await getUsers(), args)
      ),
    },
    blogs: {
      type:BlogsConnection,
      args: {
        author: {type: GraphQLString},
        category: {type: Category},
        ...connectionArgs,
      },
      resolve: async (obj, {...args, author, category}, info) => {
        let authorId;
        if (author) {
          authorId = fromGlobalId(author).id;
        }
        return connectionFromArray(await getBlogs(authorId, category), args)
      },
    },
    blog: {
      type: GraphQLBlog,
      description: 'Blog by slug',
      args: {
        slug: {type: new GraphQLNonNull(GraphQLString)},
        email: {type: GraphQLString}
      },
      resolve: async (obj, { slug, email }, info) => {
        const blog = await getBlogBySlug(slug);
        return (info.user ? blog : null);
      },
    },
  }),
  interfaces: [nodeInterface],
});

const { connectionType: UsersConnection, edgeType: GraphQLUserEdge } =
  connectionDefinitions({ nodeType: GraphQLUser });

const GraphQLRoot = new GraphQLObjectType({
  name: 'Root',
  fields: {
    viewer: {
      type: GraphQLUser,
      resolve: getViewer,
    },
    node: nodeField,
  },
});

const GraphQLLoginMutation = mutationWithClientMutationId({
  name: 'Login',
  inputFields: {
    email: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: GraphQLString },
  },
  outputFields: {
    viewer: {
      type: GraphQLUser,
      resolve: (obj, args, info) => {
        return obj;
      },
    },
  },
  mutateAndGetPayload: async (obj, args, info) => {
    let client  = info.rootValue.app.locals.client;
    // console.log(obj);
    return findUserByEmail(obj, client).then(user => {
      console.log('user', user)
      if (user) delete user.password
      return {
        ...user,
        token: (user && user.isActivated && obj.password) ? getTokenFromUser(user) : null,
      };
    });
  },
});

const GraphQLSignupMutation = mutationWithClientMutationId({
  name: 'Signup',
  inputFields: {
    name: { type: GraphQLString },
    email: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) },
    token: { type: GraphQLString },
  },
  outputFields: {
    viewer: {
      type: GraphQLUser,
      resolve: (obj, args, info) => {
        return obj;
      },
    },
  },
  mutateAndGetPayload: async (obj, args, info) => {
    let client  = info.rootValue.app.locals.client;
    obj.password = encrypt(obj.password);
    return createUser(obj, client).then(user => {
      // console.log(user)
      delete user.password
      return user;
    });
  },
});

const GraphQLActivationMutation = mutationWithClientMutationId({
  name: 'Activation',
  inputFields: {
    email: { type: new GraphQLNonNull(GraphQLString) },
    token: { type: new GraphQLNonNull(GraphQLString) },
  },
  outputFields: {
    viewer: {
      type: GraphQLUser,
      resolve: (obj, args, info) => {
        return obj;
      },
    },
  },
  mutateAndGetPayload: async (obj, args, info) => {
    let client  = info.rootValue.app.locals.client;
    // console.log(obj);
    return createUser(obj, client).then(user => {
      // console.log(user)
      delete user.password
      return user;
    });
  },
});

const GraphQLAddBlogMutation = mutationWithClientMutationId({
  name: 'AddBlog',
  inputFields: {
    imageSource: { type: GraphQLString },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    category: {
      type: Category,
      defaultValue: 'other'
    }
  },
  outputFields: {
    viewer: {
      type: GraphQLUser,
      resolve: getViewer,
    },
    blog: {
      type: GraphQLBlogEdge,
      resolve: async ({ blogId }) => {
        if (blogId) {
          return getBlogs().then(blogs => {
            return getBlog(blogId).then(blog => {
              let cursor = cursorForObjectInConnection(blogs, blog);
              return {
                cursor,
                node: blog,
              };
            })
          })
          
        } else {
          return null;
        }
      },
    },
  },
  mutateAndGetPayload: async ({ imageSource,title,content,category }, args, info) => {
    let newImageSource = info.rootValue.file && info.rootValue.file.cloudStoragePublicUrl;
    let blogId = null;
    if (info.rootValue.user && info.rootValue.user.user) {
      blogId = await addBlog({imageSource: newImageSource,title,content,author: info.rootValue.user.user.id, category});
    }
    return {blogId};
  },
})

const GraphQLEditBlogMutation = mutationWithClientMutationId({
  name: 'EditBlog',
  inputFields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    imageSource: { type: GraphQLString },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    author: { type: GraphQLString },
    category: {
      type: Category,
      defaultValue: 'other'
    }
  },
  outputFields: {
    viewer: {
      type: GraphQLUser,
      resolve: getViewer,
    },
    blog: {
      type: GraphQLBlog,
      resolve: async ({ blogId }) => {
        if (blogId) {
          const blog = await getBlog(blogId);
          // console.log(blog, blogId, 'blog');
          return blog;
        }
        return null;
      },
    },
  },
  mutateAndGetPayload: async ({ id, imageSource,title,content, author, category }, args, info) => {
    let newImageSource = info.rootValue.file && info.rootValue.file.cloudStoragePublicUrl;
    const { id: blog } = fromGlobalId(id);
    const { id: authorId } = fromGlobalId(author);
    console.log(authorId, info.rootValue.user.user.id, authorId == info.rootValue.user.user.id);
    let blogId = null;
    if (info.rootValue.user && info.rootValue.user.user && (authorId == info.rootValue.user.user.id)) {
      blogId = await editBlog({id:blog, imageSource: (newImageSource || imageSource), title, content, category});
    }
    return { blogId };
  },
});

const GraphQLRemoveBlogMutation = mutationWithClientMutationId({
  name: 'RemoveBlog',
  inputFields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  outputFields: {
    viewer: {
      type: GraphQLUser,
      resolve: getViewer,
    },
    deletedId: {
      type: GraphQLID,
      resolve: ({ id }) => id,
    },
  },
  mutateAndGetPayload: ({ id }) => {
    const { id: blogId } = fromGlobalId(id);
    removeBlog(blogId);
    return { id };
  },
})


const GraphQLMutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    login: GraphQLLoginMutation,
    signup: GraphQLSignupMutation,
    addBlog: GraphQLAddBlogMutation,
    editBlog: GraphQLEditBlogMutation,
    removeBlog: GraphQLRemoveBlogMutation,
    activation: GraphQLActivationMutation,
  },
});

const Schema = new GraphQLSchema({
  query: GraphQLRoot,
  mutation: GraphQLMutation,
});


export default Schema;

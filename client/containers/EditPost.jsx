import React from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import {browserHistory} from 'react-router';
import Dropzone from 'react-dropzone';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import CircularProgress from 'material-ui/CircularProgress';
import RichTextEditor from 'react-rte';

import {
    gql,
    graphql,
    compose,
} from 'react-apollo';

import { blogsListQuery } from './Blogs.jsx';



const styles = {
  textField:{
    width: '80%',
    marginLeft: '30px',
    marginBottom: '20px',
  },
  button:{
    marginLeft: '30px',
  },
  buttons: {
    textAlign: 'center',
  },
  title: {
    textAlign: 'center',
  },
  label: {
    color: 'rgba(0, 0, 0, 0.298039)',
    fontSize: '12px',
  },
  dropZone: {
    width: '100%',
    border: 'silver dashed 2px',
    minHeight: '200px',
    position: 'relative',
    marginTop: '10px',
  },
  dropZoneHelpTextWrapper: {
    position: 'absolute',
    top: '0px',
    width: '100%',
    height: '100%',
  },
  dropZoneHelpText: {
    padding: '5% 0',
    textAlign: 'center',
    backgroundColor: 'rgba(192, 192, 192, 0.7)',
  },
  dropZonePreview: {
    width: '100%',
  }
}

class EditPost extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      pageTitle: 'Add Blog',
      imageSource: '',
      title: '',
      content: RichTextEditor.createEmptyValue(),
      slug: '',
      author: '',
      category: 'BLOG',
      image: null,
      loading: false,
    }
    this.handleOnChange = this.handleOnChange.bind(this);
    this.editBlog = this.editBlog.bind(this);
    this.addBlog = this.addBlog.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    const {params: {blogSlug}, data} = nextProps;
    if (data.viewer && blogSlug && this.state.pageTitle == 'Add Blog') {
      if (data.viewer.blog) {
        this.setState({
          pageTitle: 'Edit Blog',
          imageSource: data.viewer.blog.imageSource,
          title: data.viewer.blog.title,
          content: RichTextEditor.createValueFromString(data.viewer.blog.content, 'html'),
          category: data.viewer.blog.category,
          slug: blogSlug,
          author: data.viewer.blog.author.id,
          id: data.viewer.blog.id,
        });
      }
    }
  }
  handleOnChange(e, field){
    this.setState({
      [field]:e.target.value,
    })
  }

  editBlog(e) {
    this.setState({
      loading: true
    });
    this.props.editBlog({ 
      variables: {
        id: this.state.id,
        title: this.state.title,
        content: this.state.content.toString('html'),
        category: this.state.category,
        author: this.state.author,
      },
      // optimisticResponse: {
      //   editBlog: {
      //     title: this.state.title,
      //     content: this.state.content.toString('html'),
      //     category: this.state.category,
      //     author: this.state.author,
      //     id: this.state.id,
      //     __typename: 'Blog',
      //   },
      // },
      update: (store, { data: { editBlog } }) => {
          // Read the data from the cache for this query.
          const data = store.readQuery({ query: blogsListQuery });
          // Add our channel from the mutation to the end.
          data.viewer.blogs.edges.push({node: editBlog});
          // Write the data back to the cache.
          store.writeQuery({ query: blogsListQuery, data });
        },
    }).then(() => {
      this.setState({
        loading: false
      });
      browserHistory.push('/blogs')
    }).catch((error) => {
      this.setState({
        loading: false
      });
      console.log(error);
    });
  }

  addBlog(e) {
    this.setState({
      loading: true
    });
    this.props.addBlog({ 
      variables: {
        title: this.state.title,
        content: this.state.content.toString('html'),
        category: this.state.category,
      },
      // optimisticResponse: {
      //   addBlog: {
      //     title: this.state.title,
      //     content: this.state.content.toString('html'),
      //     category: this.state.category,
      //     author: this.props.viewer,
      //     id: Math.round(Math.random() * -1000000),
      //     __typename: 'Blog',
      //   },
      // },
      update: (store, { data: { addBlog } }) => {
          // Read the data from the cache for this query.
          const data = store.readQuery({ query: blogsListQuery });
          // Add our channel from the mutation to the end.
          data.viewer.blogs.edges.push({node: addBlog});
          // Write the data back to the cache.
          store.writeQuery({ query: blogsListQuery, data });
        },
    }).then(() => {
      this.setState({
        loading: false
      });
      browserHistory.push('/blogs')
    }).catch((error) => {
      this.setState({
        loading: false
      });
      console.log(error);
    });
  }

  submitPost(e) {    
    e.preventDefault();
    if (this.state.id) {
      this.editBlog();
    } else {
      this.addBlog();
    }
  }
  render() {
    console.log(this.props);
    const {data, params: {blogSlug}} = this.props;
    if (data && data.loading) {
      return (<div 
        style={{
          top: '50%',
          left: '50%',
          position: 'absolute',
          zIndex: '15'
        }}
      >
        <CircularProgress size={80} thickness={5} />
      </div>);
    }
    if (this.state.loading) {
      return (<div 
        style={{
          top: '50%',
          left: '50%',
          position: 'absolute',
          zIndex: '15'
        }}
      >
        <CircularProgress size={80} thickness={5} />
      </div>);
    }
    return (
      <div className="body-margin">
        <h1 style={styles.title}>{this.state.pageTitle}</h1>
        <form onSubmit={(e) => this.submitPost(e)}>
          <TextField
            value={this.state.title}
            onChange={(e) => this.handleOnChange(e, 'title')}
            style={styles.textField}
            fullWidth={true}
            floatingLabelText="Title"  
          />
          <div style={styles.textField}>
            <label style={styles.label}>Content</label>
            <RichTextEditor
              value={this.state.content}
              onChange={(v) => this.handleOnChange({target: {value: v}}, 'content')}
            />
          </div>
          <div style={styles.textField}>
            <label style={styles.label}>Header Image</label>
            <Dropzone
              style={styles.dropZone}
              onDrop={(files) => this.handleOnChange({target: {value: files[0]}}, 'image')}
              multiple={false}
              accept="image/*"
            >
              <div style={styles.dropZoneHelpTextWrapper}>
                <div style={styles.dropZoneHelpText}>Try dropping some files here, or click to select files to upload.</div>
              </div>              
              <img style={styles.dropZonePreview} src={this.state.image ? this.state.image.preview : this.state.imageSource} />
            </Dropzone>
          </div>
          <div style={styles.textField}>
            <label style={styles.label}>Post Type</label>
            <div>
              <DropDownMenu value={this.state.category} onChange={(e, i, v) => this.handleOnChange({target:{value:v}}, 'category')}>
                <MenuItem value="NEWS" primaryText="News" />
                <MenuItem value="EVENT" primaryText="Event" />
                <MenuItem value="USER_STORY" primaryText="User Story" />
                <MenuItem value="BLOG" primaryText="Blog" />
                <MenuItem value="CASE_STUDY" primaryText="Case Study" />
                <MenuItem value="OTHER" primaryText="Other" />
              </DropDownMenu>
            </div>
          </div>
          <br />
          <div style={styles.buttons}>
            <RaisedButton style={styles.button} label="Submit" type="submit"/>
            <RaisedButton
              style={styles.button}
              label="Cancel"
              type="button"
              onClick={() => browserHistory.push(`/blogs`)}
            />
          </div>
        </form>
      </div>
    );
  }
}

const addBlogMutation = gql`
  mutation addBlog(
    $title: String!
    $content: String!
    $category: Category
  ) {
    addBlog(input: {title: $title, content: $content, category: $category}){
      blog {
        node {
          id
          title
          content
          imageSource
          created
          category
          author {
            id
            name
          }
        }
      }
    }
  }
`;

const editBlogMutation = gql`
  mutation editBlog(
    $title: String!
    $content: String!
    $category: Category
    $author: String
    $id: ID!
  ) {
    editBlog(input: {id: $id, title: $title, content: $content, category: $category, author: $author}){
      blog {
        id
        title
        content
        imageSource
        created
        category
        author {
          id
          name
        }
      }
    }
  }
`;

const postDetailQuery = gql`
  query PostDetailQuery ($blogSlug : String!) {
    viewer {
      id
      email
      isSuperUser
      isAdmin
      blog(slug: $blogSlug) {
        id
        title
        content
        imageSource
        created
        category
        author {
          id
          name
          email
        }
      }
    }
  }
`;

export default compose(
  graphql(postDetailQuery, {
    options: (props) => ({
      variables: { blogSlug: props.params.blogSlug },
    }),
    skip: (props) => !props.params.blogSlug,
  }),
  graphql(addBlogMutation, {name: 'addBlog'}),
  graphql(editBlogMutation, {name: 'editBlog'}),
)(EditPost);

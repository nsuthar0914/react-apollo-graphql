import React from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';
import {ShareButtons,generateShareIcon} from 'react-share';
import RaisedButton from 'material-ui/RaisedButton';
import {browserHistory} from 'react-router';
import CircularProgress from 'material-ui/CircularProgress';

import {
    gql,
    graphql,
} from 'react-apollo';

const {
  FacebookShareButton,
  GooglePlusShareButton,
  LinkedinShareButton,
  TwitterShareButton,d
} = ShareButtons;
/*import nineSharp from './posts/9sharp';
import digital from 'posts/digital';
import fixed from 'posts/fixed-price';
import internet from 'posts/internet-softwere';
 import savvymob from './posts/savvymob';*/

const FacebookIcon = generateShareIcon('facebook');
const TwitterIcon = generateShareIcon('twitter');
const GooglePlusIcon = generateShareIcon('google');
const LinkedinIcon = generateShareIcon('linkedin');

const styles = {
  share:{
    display: 'flex',
  },
  date: {
    display: 'inline-block',
    width: '33%',
    textAlign: 'left',
  },
  author: {
    display: 'inline-block',
    width: '33%',
    textAlign: 'right',
  },
  editButton: {
    float: 'right',
  }
}

class Posts extends React.Component {

  render() {
    const {data: {loading, error, viewer}, params: {blogSlug}} = this.props;
    if (loading || !viewer) {
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
    const {blog:post, email, isSuperUser, isAdmin} = viewer;
    
    if (!post) {
      return null;
    }
    return (
      <div className="body-margin">
        {post.imageSource && <div>
          <img
            src={post.imageSource}
            alt="post-image"
            width="100%"
          />
        </div>}
        <h3 className="block-title">{post.title}</h3>
        <div>
          {post.author && post.author.email == email && <RaisedButton
            label="Edit Post"
            secondary={true}
            style={styles.editButton}
            onClick={() => browserHistory.push(`/blogs/${blogSlug}/edit`)}
          />}
          <div style={styles.date}>Posted on {new Date(post.created).toDateString()}</div>
          {post.author && <div style={styles.author}>Posted By {post.author.name}</div>}
        </div>
        <br />
        <br />
        <div className="block-text" dangerouslySetInnerHTML={{__html:post.content}}></div>
        <div>
          <p>Share this :</p>
          <div style={styles.share}>
            <FacebookShareButton url={this.props.location.pathname} title={post.title}>
              <FacebookIcon size={32} round />
            </FacebookShareButton>
            <TwitterShareButton url={this.props.location.pathname} title={post.title}>
              <TwitterIcon size={32} round />
            </TwitterShareButton>
            <GooglePlusShareButton url={this.props.location.pathname} title={post.title}>
              <GooglePlusIcon size={32} round />
            </GooglePlusShareButton>
            <LinkedinShareButton url={this.props.location.pathname} title={post.title}>
              <LinkedinIcon size={32} round />
            </LinkedinShareButton>
          </div>
        </div>
      </div>
    );
  }
}

export const postDetailQuery = gql`
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
        author {
          name
          email
        }
      }
    }
  }
`;

export default graphql(postDetailQuery, {
  options: (props) => ({
    variables: { blogSlug: props.params.blogSlug },
  }),
  skip: (props) => !props.params.blogSlug,
})(Posts);
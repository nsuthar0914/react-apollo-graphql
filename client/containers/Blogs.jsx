import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import RaisedButton from 'material-ui/RaisedButton';
import Chip from 'material-ui/Chip';
import {browserHistory} from 'react-router';
import HardwareKeyboardArrowRight from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import CircularProgress from 'material-ui/CircularProgress';

import {
    gql,
    graphql,
} from 'react-apollo';

import AlertDialog from '../components/AlertDialog.jsx';

const styles = {
  leftBlock: {
    display: 'inline-block',
    width: 'calc(30% - 20px)',
    paddingRight: '20px',
    paddingTop: '30px',
  },
  rightBlock: {
    display: 'inline-block',
    width: 'calc(70% - 20px)',
    paddingLeft: '30px',
  },
  title: {
    textAlign: 'left',
    fontSize: '27px',
    color: '#00386c',
    fontWeight: '400',
    textTransform: 'capitalize',
    lineHeight: '37px',
  },
  icon:{
    width: '25px',
    height: '25px',
    marginLeft: '5px',
  },
  addButton: {
    textAlign: 'center'
  },
  chip: {
    margin: 4,
  },
};


class Blogs extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      titleArrow:false,
    }
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
  }
  handleMouseOver(event){
    event.preventDefault();
    this.setState({titleArrow:true})
  }
  handleMouseOut(event){
    event.preventDefault();
    this.setState({titleArrow:false})
  }
  render(){
    console.log(this.props);
    if (this.props.data.loading) {
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
    const {blogs: {edges}, email, isAdmin, isAuthor, isSuperUser} = this.props.data.viewer;
    return (
      <div >
        <h1 className="block-title">Blogs and Case Studies</h1>
        {email && (isSuperUser || isAdmin || isAuthor) &&  <div style={styles.addButton}>
          <RaisedButton label="Add Post" secondary={true} onClick={() => browserHistory.push('/blogs/add')}/>
        </div>}
        {
          edges && edges.map((edge,i) => {
            const {node:blog} = edge;
            return (
              <div key={i}>
                <div className="block-content">
                  {blog.imageSource && <div style={styles.leftBlock}>
                    <img
                      src={blog.imageSource}
                      width="290"
                      height="225"
                    />
                  </div>}
                  <div style={blog.imageSource ? styles.rightBlock : {}}>
                    <a onClick={() => {
                      browserHistory.push(`/blogs/${blog.slug}`)
                    }}>
                      <h3 style={styles.title} onMouseOver={this.handleMouseOver} onMouseOut={this.handleMouseOut} >
                        {blog.title}{this.state.titleArrow?<HardwareKeyboardArrowRight viewBox="10 0 5 18" style={styles.icon}/>:''}
                      </h3>
                    </a>
                    <div className="block-text" dangerouslySetInnerHTML={{__html:(blog.content && blog.content.slice(0, 200) + '...')}}></div>
                    <b>{blog.boldText}</b>
                    <Chip
                      style={styles.chip}
                    >
                      {blog.category.replace('_',' ')}
                    </Chip>
                  </div>
                </div>
                <hr />
              </div>
            );
          })
        }
        <AlertDialog ref={e => {this.alert = e;}} />
      </div>
    );
  }
}

export const blogsListQuery = gql`
  query BlogsListQuery {
    viewer {
      id
      email
      isAdmin
      isSuperUser
      blogs(last: 100) {
        edges {
          node {
            id
            title
            content
            imageSource
            slug
            category
          }
        }
      }
    }
  }
`;

export default graphql(blogsListQuery, {
  options: { pollInterval: 5000 },
})(Blogs);
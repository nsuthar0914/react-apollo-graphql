import React from 'react';
import Paper from 'material-ui/Paper';
import FlatButton from 'material-ui/FlatButton';
import Popover, {PopoverAnimationVertical} from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import {Tabs, Tab} from 'material-ui';
import {Link, browserHistory} from 'react-router';
import CircularProgress from 'material-ui/CircularProgress';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';
import Drawer from 'material-ui/Drawer';
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';

const styles = {
  headerLogo: {
    margin: '10px 0',
    textAlign: 'left',
    display: 'inline-block',
    width: '33%',
  },
  navItemsCenter: {
    display: 'inline-block',
    margin: '20px 0',
    width: '33%',
    textAlign: 'center',
  },
  navItems: {
    margin: '10px 20px',
  },
  navItemsRight: {
    display: 'inline-block',
    margin: '20px 0',
    width: '33%',
    textAlign: 'right',
  },
  navItemsRightSm: {
    display: 'inline-block',
    margin: '20px 0',
    width: '66%',
    textAlign: 'right',
  },
  header: {
    display: 'flex',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  wrapper: {
    position: 'fixed',
    width: '100%',
    top: '0px',
  },
  burgerMenuIcon: {
    float: 'right'
  }
}

export default class Header extends React.Component{
  constructor(props){
    super(props)
    this.handleRequestClose = this.handleRequestClose.bind(this);
    this.state = {
      open: false,
      drawerOpen: false,
    };
  }
  handleRequestClose(){
    this.setState({
      open: false,
      type: null,
    }); 
  }

  goTo(url) {
    this.handleCloseDrawer();
    browserHistory.push(url);
    if (this.state.open) {
      this.handleRequestClose();
    }
  }

  handleToggleDrawer = () => this.setState({drawerOpen: !this.state.drawerOpen});

  handleCloseDrawer = () => this.setState({drawerOpen: false});

  render(){
    const {viewer: {email, name}, logout, pages} = this.props;
    return (
      <div style={styles.wrapper}>
        <Paper style={styles.header}>
          <div style={styles.headerLogo} onClick={() => {
            this.goTo('/');
          }}>
            <img
              className="site-logo"
              src="https://media-exp2.licdn.com/mpr/mpr/shrink_200_200/AAEAAQAAAAAAAAZXAAAAJDk3OGMzNjY3LTE1MDgtNGQxNS1hNTM1LTU3MTZmNzE0YjA4OQ.png"
              alt="BadCanvas"
            />
          </div>
          <div style={styles.navItemsCenter} className="hide-sm">
            <Link style={styles.navItems} onClick={() => {this.goTo('/blogs')}}>Blogs</Link>
          </div>
          {email || name
            ? <div style={styles.navItemsRight} className="hide-sm">
              <Link onClick={logout} style={styles.navItems}>Logout</Link>
            </div>
            : <div style={styles.navItemsRight} className="hide-sm">
              <Link onClick={() => this.goTo('/signin')} style={styles.navItems}>Login</Link>
            </div>}
          <div style={styles.navItemsRightSm} className="show-sm">
            <MenuIcon onTouchTap={() => this.handleToggleDrawer()}/>
          </div>
        </Paper>
        <Drawer
          docked={false}
          width={200}
          open={this.state.drawerOpen}
          onRequestChange={(drawerOpen) => this.setState({drawerOpen})}
        >
          <MenuItem onTouchTap={() => this.goTo('/blogs')}>Blogs</MenuItem>
          {email || name
            ? <MenuItem onTouchTap={logout}>Logout</MenuItem>
            : <MenuItem onTouchTap={() => this.goTo('/signin')}>Login</MenuItem>}
        </Drawer>
      </div>
    );
  }
}

